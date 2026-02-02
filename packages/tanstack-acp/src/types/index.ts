/**
 * Types for tanstack-acp
 * 
 * TypeScript type definitions for the TanStack AI ACP adapter
 */

import type { UIMessage } from '@tanstack/ai';
import type { AcpConnection } from '../acp-connection.js'
import type {
  NewSessionRequest,
  NewSessionResponse,
  LoadSessionRequest,
  LoadSessionResponse,
  SetSessionModeRequest,
  SetSessionModeResponse,
  ListSessionsRequest,
  ListSessionsResponse,
  ForkSessionRequest,
  ForkSessionResponse,
  ResumeSessionRequest,
  ResumeSessionResponse,
  RequestPermissionRequest,
  RequestPermissionResponse,
  ReadTextFileRequest,
  ReadTextFileResponse,
  WriteTextFileRequest,
  WriteTextFileResponse,
  AgentCapabilities,
  SessionNotification,
  McpServer,
  SessionMode,
  AvailableCommand,
  SessionInfo,
  StopReason,
} from '@agentclientprotocol/sdk'
import type { SessionPersistence, SessionMetadata, SessionData } from '../persistence/types.js'

// Connection state
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface ConnectionState {
  status: ConnectionStatus
  error?: string
  url?: string
}

// Session representation (legacy, for backward compatibility)
export interface Session {
  id: string
  createdAt: Date
  lastActiveAt: Date
  modes?: SessionMode[]
  currentModeId?: string
  meta?: Record<string, unknown>
}

// Permission request with identifier
export interface IdentifiedPermissionRequest extends RequestPermissionRequest {
  permissionId: string
}

// Lifecycle callbacks
export interface LifecycleCallback {
  onSessionCreateStart?: () => void
  onSessionCreateSuccess?: (sessionId: string) => void
  onSessionCreateError?: (error: Error) => void
  
  onSessionLoadStart?: (sessionId: string) => void
  onSessionLoadSuccess?: (sessionId: string) => void
  onSessionLoadError?: (sessionId: string, error: Error) => void
  
  onPromptStart?: (sessionId: string) => void
  onPromptSuccess?: (sessionId: string, response: unknown) => void
  onPromptError?: (sessionId: string, error: Error) => void
  
  onConnectionStateChange?: (state: ConnectionState) => void
  onPermissionRequest?: (request: IdentifiedPermissionRequest) => void
  onError?: (error: Error) => void
}

// ACP Session hook options
export interface AcpSessionOptions {
  wsUrl: string
  cwd?: string
  agentName?: string
  autoConnect?: boolean
  reconnectAttempts?: number
  reconnectDelay?: number
  persistence?: SessionPersistence
  onLifecycleEvent?: LifecycleCallback
  onConnectionStateChange?: (state: ConnectionState) => void
  onPermissionRequest?: (request: IdentifiedPermissionRequest) => Promise<RequestPermissionResponse>
  onSessionNotification?: (notification: SessionNotification) => void
  onError?: (error: Error) => void
}

// Forward declaration - AcpConnection imported at top of file

// ACP Session hook return value
export interface AcpSessionReturn {
  // Connection
  connection: AcpConnection | null
  
  // Connection state
  connectionState: ConnectionState
  isConnected: boolean
  
  // Sessions (using new metadata format)
  sessions: SessionMetadata[]
  activeSessionId: string | null
  setActiveSessionId: (sessionId: string | null) => void
  activeSessionData: SessionData | null
  isLoading: boolean
  
  // Session actions
  createSession: (params?: Partial<NewSessionRequest> & { modelId?: string }) => Promise<NewSessionResponse>
  loadSession: (sessionId: string, params?: Partial<LoadSessionRequest>) => Promise<LoadSessionResponse & { messages: UIMessage[]; sessionData: SessionData | null }>
  deleteSession: (sessionId: string) => Promise<void>
  forkSession: (sessionId: string) => Promise<ForkSessionResponse>
  duplicateSession: (sessionId: string) => Promise<void>
  refreshSessions: () => Promise<void>
  
  // Agent capabilities
  agentCapabilities: AgentCapabilities | null
  availableCommands: AvailableCommand[]
  currentModeId: string | null
  availableModes: SessionMode[]
  setSessionMode: (modeId: string) => Promise<SetSessionModeResponse>
  
  // Connection actions
  connect: () => Promise<void>
  disconnect: () => void
  reconnect: () => Promise<void>
  
  // Permission handling
  pendingPermission: IdentifiedPermissionRequest | null
  resolvePermission: (permissionId: string, response: RequestPermissionResponse) => void
  rejectPermission: (permissionId: string, error: Error) => void
  
  // Persistence
  persistence: SessionPersistence
  
  // Helper methods
  appendMessage: (message: UIMessage) => Promise<void>
}

// Adapter options
export interface AcpAdapterOptions {
  connection: AcpConnection | null
  sessionId?: string | null
  sessionParams?: {
    cwd?: string
    mcpServers?: McpServer[]
  }
  onSessionCreated?: (sessionId: string) => void
  onSessionLoaded?: (sessionId: string) => void
}

// Internal connection class interface
export interface AcpConnectionOptions {
  wsUrl: string
  reconnectAttempts?: number
  reconnectDelay?: number
  onConnectionStateChange?: (state: ConnectionState) => void
  onError?: (error: Error) => void
}

// Client interface implementation
export interface AcpClientImplementation {
  sessionUpdate: (params: SessionNotification) => Promise<void>
  requestPermission: (params: RequestPermissionRequest) => Promise<RequestPermissionResponse>
  readTextFile?: (params: ReadTextFileRequest) => Promise<ReadTextFileResponse>
  writeTextFile?: (params: WriteTextFileRequest) => Promise<WriteTextFileResponse>
}

// Tool call aggregation state
export interface ToolCallState {
  toolCallId: string
  toolName: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  args: Record<string, unknown>
  result?: unknown
  locations?: unknown[]
  content?: unknown[]
}

// Event mapper context
export interface EventMapperContext {
  currentMessageId: string | null
  toolCalls: Map<string, ToolCallState>
}

// Re-export ACP SDK types for convenience
export type {
  // Session
  NewSessionRequest,
  NewSessionResponse,
  LoadSessionRequest,
  LoadSessionResponse,
  ListSessionsRequest,
  ListSessionsResponse,
  ForkSessionRequest,
  ForkSessionResponse,
  ResumeSessionRequest,
  ResumeSessionResponse,
  SetSessionModeRequest,
  SetSessionModeResponse,
  
  // Messages
  SessionNotification,
  
  // Permissions
  RequestPermissionRequest,
  RequestPermissionResponse,
  
  // File System
  ReadTextFileRequest,
  ReadTextFileResponse,
  WriteTextFileRequest,
  WriteTextFileResponse,
  
  // Capabilities
  AgentCapabilities,
  SessionMode,
  AvailableCommand,
  SessionInfo,
  McpServer,
  StopReason,
}
