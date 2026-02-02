/**
 * createAcpAdapter
 * 
 * Creates a TanStack AI connection adapter for ACP protocol
 * Bridges useChat with the ACP connection
 */

import { stream, type ConnectionAdapter } from '@tanstack/ai-react'
import type { ModelMessage } from '@tanstack/ai'
import type { AcpAdapterOptions } from './types/index.js'

export function createAcpAdapter(options: AcpAdapterOptions): ConnectionAdapter {
  const { connection, sessionId, sessionParams, onSessionCreated, onSessionLoaded } = options

  if (!connection) {
    throw new Error('AcpConnection is required')
  }

  const streamFn = async function* (messages: ModelMessage[], _data?: Record<string, unknown>, signal?: AbortSignal) {
    // Determine which session to use
    let currentSessionId = sessionId

    // Auto-create session if none provided
    if (!currentSessionId) {
      const session = await connection.newSession({
        cwd: sessionParams?.cwd || '/tmp',
        mcpServers: sessionParams?.mcpServers || [],
      })
      currentSessionId = session.sessionId
      onSessionCreated?.(session.sessionId)
    } else {
      onSessionLoaded?.(currentSessionId)
    }

    // Convert messages to ACP format
    const acpPrompt = messages.map((msg) => ({
      type: 'text' as const,
      text: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
    }))

    // Send prompt (notifications come via sessionUpdate)
    await connection.prompt(currentSessionId, acpPrompt)

    // Stream chunks from ACP connection
    try {
      for await (const chunk of connection.streamChunks(signal)) {
        if (signal?.aborted) {
          // Send cancel notification
          try {
            await connection.cancel(currentSessionId!)
          } catch {
            // Ignore cancel errors
          }
          break
        }

        const streamChunk = convertToStreamChunk(chunk)
        if (streamChunk) {
          yield streamChunk as any
        }
      }
    } catch (error) {
      // Send cancel notification on error
      connection.cancel(currentSessionId!).catch(() => {
        // Ignore cancel errors
      })
      connection.closeStream()
      throw error
    }

    // Clean up stream when done
    connection.closeStream()
  }

  return stream(streamFn as any)
}

function convertToStreamChunk(chunk: unknown): Record<string, unknown> | null {
  if (!chunk || typeof chunk !== 'object') return null

  const c = chunk as Record<string, unknown>

  switch (c.type) {
    case 'text':
      return {
        type: 'TEXT_MESSAGE_CONTENT',
        id: String(c.id || ''),
        delta: String(c.delta || ''),
      }

    case 'reasoning':
      return {
        type: 'REASONING',
        id: String(c.id || ''),
        reasoning: String(c.reasoning || ''),
      }

    case 'tool-call':
      return {
        type: 'TOOL_CALL_ARGS',
        id: String(c.id || ''),
        toolCallId: String(c.toolCallId || ''),
        toolName: String(c.toolName || ''),
        args: String(c.args || ''),
      }

    case 'tool-result':
      return {
        type: 'TOOL_CALL_END',
        id: String(c.id || ''),
        toolCallId: String(c.toolCallId || ''),
        result: c.result,
      }

    case 'data':
      return {
        type: 'CUSTOM',
        data: c.data,
      }

    default:
      return null
  }
}
