/**
 * tanstack-acp
 * 
 * TanStack AI adapter for Agent Client Protocol (ACP)
 * 
 * @example
 * ```tsx
 * import { useAcpSession, createAcpAdapter } from 'tanstack-acp'
 * import { useChat } from '@tanstack/ai-react'
 * 
 * function App() {
 *   const { connection, sessions, activeSessionId, createSession } = useAcpSession({
 *     wsUrl: 'ws://localhost:3003'
 *   })
 * 
 *   const { messages, handleSubmit } = useChat({
 *     connection: createAcpAdapter({
 *       connection,
 *       sessionId: activeSessionId
 *     })
 *   })
 * 
 *   return <Chat messages={messages} onSubmit={handleSubmit} />
 * }
 * ```
 */

// Hooks
export { useAcpSession } from './hooks/use-acp-session.js'

// Core
export { createAcpAdapter } from './adapter.js'
export { AcpConnection } from './acp-connection.js'

// Utilities
export { WebSocketManager } from './utils/websocket-manager.js'
export { ToolCallAggregator } from './utils/tool-aggregator.js'
export { Deferred } from './utils/deferred.js'

// Persistence
export { MemoryPersistence } from './persistence/memory.js'

// Types
export type {
  AcpSessionOptions,
  AcpSessionReturn,
  AcpAdapterOptions,
  ConnectionState,
  ConnectionStatus,
  Session,
  IdentifiedPermissionRequest,
  ToolCallState,
} from './types/index.js'

export type {
  SessionPersistence,
  SessionData,
  SessionMetadata,
  GroupedSessions,
} from './persistence/types.js'

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
} from '@agentclientprotocol/sdk'
