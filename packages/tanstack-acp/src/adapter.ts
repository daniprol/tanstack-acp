/**
 * createAcpAdapter
 * 
 * Creates a TanStack AI connection adapter for ACP protocol
 * Bridges useChat with the ACP connection
 */

import { stream, type ConnectionAdapter } from '@tanstack/ai-react'
import type { ModelMessage, StreamChunk } from '@tanstack/ai'
import { AcpConnection } from './acp-connection.js'
import type { AcpAdapterOptions } from './types/index.js'

export function createAcpAdapter(options: AcpAdapterOptions): ConnectionAdapter {
  const { connection, sessionId, sessionParams, onSessionCreated, onSessionLoaded } = options

  if (!connection) {
    throw new Error('AcpConnection is required')
  }

  return stream(async (messages: ModelMessage[], data?: Record<string, unknown>, signal?: AbortSignal) => {
    // Determine which session to use
    let currentSessionId = sessionId
    let isNewSession = false

    // Auto-create session if none provided
    if (!currentSessionId) {
      const session = await connection.newSession({
        cwd: sessionParams?.cwd || '/tmp',
        mcpServers: sessionParams?.mcpServers || [],
      })
      currentSessionId = session.sessionId
      isNewSession = true
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

    // Create stream from ACP connection
    return new ReadableStream<StreamChunk>({
      async start(controller) {
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
              controller.enqueue(streamChunk)
            }
          }
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
      cancel() {
        // Send cancel notification when stream is cancelled
        connection.cancel(currentSessionId!).catch(() => {
          // Ignore cancel errors
        })
        connection.closeStream()
      },
    })
  })
}

function convertToStreamChunk(chunk: unknown): StreamChunk | null {
  if (!chunk || typeof chunk !== 'object') return null

  const c = chunk as Record<string, unknown>

  switch (c.type) {
    case 'text':
      return {
        type: 'text',
        id: String(c.id || ''),
        delta: String(c.delta || ''),
      }

    case 'reasoning':
      return {
        type: 'reasoning',
        id: String(c.id || ''),
        reasoning: String(c.reasoning || ''),
      }

    case 'tool-call':
      return {
        type: 'tool-call',
        id: String(c.id || ''),
        toolCallId: String(c.toolCallId || ''),
        toolName: String(c.toolName || ''),
        args: String(c.args || ''),
      }

    case 'tool-result':
      return {
        type: 'tool-result',
        id: String(c.id || ''),
        toolCallId: String(c.toolCallId || ''),
        result: c.result,
      }

    case 'data':
      return {
        type: 'data',
        data: c.data,
      }

    default:
      return null
  }
}
