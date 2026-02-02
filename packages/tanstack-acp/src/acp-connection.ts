/**
 * ACP Connection
 * 
 * Manages the connection to an ACP agent via WebSocket
 * Implements the Client interface for the ACP protocol
 */

import {
  ClientSideConnection,
  ndJsonStream,
  type SessionNotification,
  type RequestPermissionRequest,
  type RequestPermissionResponse,
  type ReadTextFileRequest,
  type ReadTextFileResponse,
  type WriteTextFileRequest,
  type WriteTextFileResponse,
  type NewSessionRequest,
  type NewSessionResponse,
  type LoadSessionRequest,
  type LoadSessionResponse,
  type ListSessionsRequest,
  type ListSessionsResponse,
  type ForkSessionRequest,
  type ForkSessionResponse,
  type ResumeSessionRequest,
  type ResumeSessionResponse,
  type SetSessionModeRequest,
  type SetSessionModeResponse,
  type CancelNotification,
  type AgentCapabilities,
  type SessionInfo,
  type SessionMode,
  type AvailableCommand,
} from '@agentclientprotocol/sdk'
import { WebSocketManager } from './utils/websocket-manager.js'
import { ToolCallAggregator } from './utils/tool-aggregator.js'
import { Deferred } from './utils/deferred.js'
import type {
  AcpConnectionOptions,
  ConnectionState,
  IdentifiedPermissionRequest,
  ToolCallState,
} from './types/index.js'

export interface AcpClientInterface {
  sessionUpdate(params: SessionNotification): Promise<void>
  requestPermission(params: RequestPermissionRequest): Promise<RequestPermissionResponse>
  readTextFile?(params: ReadTextFileRequest): Promise<ReadTextFileResponse>
  writeTextFile?(params: WriteTextFileRequest): Promise<WriteTextFileResponse>
}

export class AcpConnection {
  private wsManager: WebSocketManager
  private acpClient: ClientSideConnection | null = null
  private options: AcpConnectionOptions
  private pendingPermissions = new Map<string, Deferred<RequestPermissionResponse>>()
  private toolCallAggregator = new ToolCallAggregator()
  private currentMessageId: string | null = null
  private messageQueue: Array<{ type: 'chunk'; data: unknown } | { type: 'error'; error: Error }> = []
  private resolveNextChunk: ((value: IteratorResult<unknown, unknown>) => void) | null = null
  
  // Public state
  public agentCapabilities: AgentCapabilities | null = null
  public availableCommands: AvailableCommand[] = []
  public currentModeId: string | null = null
  public availableModes: SessionMode[] = []
  public sessions: SessionInfo[] = []

  constructor(options: AcpConnectionOptions) {
    this.options = options
    this.wsManager = new WebSocketManager({
      url: options.wsUrl,
      onConnectionStateChange: options.onConnectionStateChange,
      onError: options.onError || (() => {}),
      reconnectAttempts: options.reconnectAttempts,
      reconnectDelay: options.reconnectDelay,
    })
  }

  async connect(): Promise<void> {
    const { readable, writable } = await this.wsManager.connect()

    // Create ACP client with our implementation
    this.acpClient = new ClientSideConnection(
      () => this.createClientInterface(),
      ndJsonStream(writable, readable)
    )
  }

  disconnect(): void {
    this.wsManager.disconnect()
    this.acpClient = null
    this.pendingPermissions.clear()
    this.toolCallAggregator.clear()
  }

  reconnect(): Promise<void> {
    this.disconnect()
    return this.connect()
  }

  private createClientInterface(): AcpClientInterface {
    return {
      sessionUpdate: async (params: SessionNotification) => {
        this.handleSessionUpdate(params)
      },

      requestPermission: async (params: RequestPermissionRequest) => {
        const permissionId = crypto.randomUUID()
        const deferred = new Deferred<RequestPermissionResponse>()
        this.pendingPermissions.set(permissionId, deferred)

        // Emit to hook for UI handling
        const identifiedRequest: IdentifiedPermissionRequest = {
          ...params,
          permissionId,
        }

        // For now, auto-allow. In hook, this will be overridden
        deferred.resolve({ outcome: { outcome: 'allow_once' } })

        return deferred.promise
      },

      readTextFile: undefined,
      writeTextFile: undefined,
    }
  }

  private handleSessionUpdate(notification: SessionNotification): void {
    const update = notification.update

    // Update session metadata
    switch (update.sessionUpdate) {
      case 'available_commands_update':
        this.availableCommands = update.availableCommands
        break
      case 'current_mode_update':
        this.currentModeId = update.currentModeId
        break
      case 'session_info_update':
        // Update session info in list
        break
    }

    // Queue chunks for the stream iterator
    const chunks = this.mapNotificationToChunks(update)
    chunks.forEach((chunk) => {
      this.enqueueChunk({ type: 'chunk', data: chunk })
    })
  }

  private mapNotificationToChunks(update: SessionNotification['update']): unknown[] {
    const chunks: unknown[] = []

    switch (update.sessionUpdate) {
      case 'agent_message_chunk': {
        const content = update.content?.type === 'text' ? update.content.text : ''
        const messageId = update.messageId || this.currentMessageId || crypto.randomUUID()

        if (update.start || messageId !== this.currentMessageId) {
          this.currentMessageId = messageId
        }

        chunks.push({
          type: 'text',
          id: messageId,
          delta: content,
        })
        break
      }

      case 'agent_thought_chunk': {
        const thought = update.content?.type === 'text' ? update.content.text : ''
        chunks.push({
          type: 'reasoning',
          id: update.messageId || crypto.randomUUID(),
          reasoning: thought,
        })
        break
      }

      case 'tool_call': {
        this.toolCallAggregator.start(update.toolCallId, update.toolCallName)
        chunks.push({
          type: 'tool-call',
          id: update.toolCallId,
          toolCallId: update.toolCallId,
          toolName: update.toolCallName,
          args: '',
        })
        break
      }

      case 'tool_call_update': {
        try {
          const aggregated = this.toolCallAggregator.update(update.toolCallId, {
            status: update.status,
            rawOutput: update.rawOutput,
            locations: update.locations,
            content: update.content,
          })

          chunks.push({
            type: 'tool-call',
            id: update.toolCallId,
            toolCallId: update.toolCallId,
            toolName: aggregated.toolName,
            args: JSON.stringify(aggregated.args),
          })

          // If completed, also send tool-result
          if (update.status === 'completed' || update.status === 'failed') {
            chunks.push({
              type: 'tool-result',
              id: `${update.toolCallId}-result`,
              toolCallId: update.toolCallId,
              result: update.rawOutput,
            })
          }
        } catch {
          // Tool call not started yet, ignore
        }
        break
      }

      case 'plan': {
        // Map plan to reasoning
        const planText = `Plan: ${update.title}\n${update.entries?.map((e) => `- ${e.description}`).join('\n')}`
        chunks.push({
          type: 'reasoning',
          id: crypto.randomUUID(),
          reasoning: planText,
        })
        break
      }

      case 'user_message_chunk':
        // User message acknowledgement, usually not displayed
        break

      case 'available_commands_update':
      case 'current_mode_update':
      case 'config_option_update':
      case 'session_info_update':
        // Metadata updates - pass through as data chunks
        chunks.push({
          type: 'data',
          data: {
            type: update.sessionUpdate,
            ...update,
          },
        })
        break
    }

    return chunks
  }

  private enqueueChunk(chunk: { type: 'chunk'; data: unknown } | { type: 'error'; error: Error }): void {
    if (this.resolveNextChunk) {
      this.resolveNextChunk({ value: chunk, done: false })
      this.resolveNextChunk = null
    } else {
      this.messageQueue.push(chunk)
    }
  }

  // Stream iterator for useChat adapter
  async *streamChunks(signal?: AbortSignal): AsyncGenerator<unknown, void, unknown> {
    while (true) {
      // Check for abort
      if (signal?.aborted) {
        // Send cancel notification
        if (this.acpClient) {
          // Note: Cancel needs sessionId, which we don't have here
          // This is handled at the adapter level
        }
        break
      }

      if (this.messageQueue.length > 0) {
        const chunk = this.messageQueue.shift()!
        if (chunk.type === 'error') {
          throw chunk.error
        }
        yield chunk.data
      } else {
        // Wait for next chunk
        const result = await new Promise<IteratorResult<unknown, unknown>>((resolve) => {
          this.resolveNextChunk = resolve
        })
        if (result.done) break
        const chunk = result.value as { type: 'chunk'; data: unknown } | { type: 'error'; error: Error }
        if (chunk.type === 'error') {
          throw chunk.error
        }
        yield chunk.data
      }
    }
  }

  closeStream(): void {
    if (this.resolveNextChunk) {
      this.resolveNextChunk({ value: undefined, done: true })
      this.resolveNextChunk = null
    }
  }

  // Permission resolution (called from hook)
  resolvePermission(permissionId: string, response: RequestPermissionResponse): void {
    const deferred = this.pendingPermissions.get(permissionId)
    if (deferred) {
      deferred.resolve(response)
      this.pendingPermissions.delete(permissionId)
    }
  }

  rejectPermission(permissionId: string, error: Error): void {
    const deferred = this.pendingPermissions.get(permissionId)
    if (deferred) {
      deferred.reject(error)
      this.pendingPermissions.delete(permissionId)
    }
  }

  // ACP protocol methods
  async initialize(): Promise<void> {
    if (!this.acpClient) throw new Error('Not connected')
    const result = await this.acpClient.initialize({
      protocolVersion: '0.1.0',
      clientCapabilities: {},
    })
    this.agentCapabilities = result.agentCapabilities
  }

  async newSession(params: NewSessionRequest): Promise<NewSessionResponse> {
    if (!this.acpClient) throw new Error('Not connected')
    return this.acpClient.newSession(params)
  }

  async loadSession(params: LoadSessionRequest): Promise<LoadSessionResponse> {
    if (!this.acpClient) throw new Error('Not connected')
    if (!this.acpClient.loadSession) {
      throw new Error('Agent does not support loadSession')
    }
    return this.acpClient.loadSession(params)
  }

  async listSessions(params?: ListSessionsRequest): Promise<ListSessionsResponse> {
    if (!this.acpClient) throw new Error('Not connected')
    if (!this.acpClient.unstable_listSessions) {
      throw new Error('Agent does not support listSessions')
    }
    return this.acpClient.unstable_listSessions(params || {})
  }

  async forkSession(params: ForkSessionRequest): Promise<ForkSessionResponse> {
    if (!this.acpClient) throw new Error('Not connected')
    if (!this.acpClient.unstable_forkSession) {
      throw new Error('Agent does not support forkSession')
    }
    return this.acpClient.unstable_forkSession(params)
  }

  async resumeSession(params: ResumeSessionRequest): Promise<ResumeSessionResponse> {
    if (!this.acpClient) throw new Error('Not connected')
    if (!this.acpClient.unstable_resumeSession) {
      throw new Error('Agent does not support resumeSession')
    }
    return this.acpClient.unstable_resumeSession(params)
  }

  async setSessionMode(params: SetSessionModeRequest): Promise<SetSessionModeResponse> {
    if (!this.acpClient) throw new Error('Not connected')
    if (!this.acpClient.setSessionMode) {
      throw new Error('Agent does not support setSessionMode')
    }
    return this.acpClient.setSessionMode(params)
  }

  async prompt(sessionId: string, prompt: unknown[]): Promise<unknown> {
    if (!this.acpClient) throw new Error('Not connected')
    return this.acpClient.prompt({
      sessionId,
      prompt,
    })
  }

  async cancel(sessionId: string): Promise<void> {
    if (!this.acpClient) throw new Error('Not connected')
    const notification: CancelNotification = { sessionId }
    // Note: cancel is a notification, not a request
    // We need to access the connection directly or use a different approach
  }

  getConnectionState() {
    return this.wsManager.getConnectionState()
  }
}
