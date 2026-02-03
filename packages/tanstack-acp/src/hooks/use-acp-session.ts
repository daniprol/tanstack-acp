/**
 * useAcpSession hook
 * 
 * React hook for managing ACP sessions with persistence support
 * Handles connection, session lifecycle, permissions, and message history
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import type { UIMessage } from '@tanstack/ai'
import { AcpConnection } from '../acp-connection.js'
import { Deferred } from '../utils/deferred.js'
import { MemoryPersistence } from '../persistence/memory.js'
import type {
  AcpSessionOptions,
  AcpSessionReturn,
  ConnectionState,
  IdentifiedPermissionRequest,
} from '../types/index.js'
import type { SessionMetadata, SessionData } from '../persistence/types.js'
import type {
  NewSessionRequest,
  LoadSessionRequest,
  RequestPermissionRequest,
  RequestPermissionResponse,
  SessionMode,
} from '@agentclientprotocol/sdk'

export function useAcpSession(options: AcpSessionOptions): AcpSessionReturn {
  // Initialize persistence
  const persistence = useMemo(() => 
    options.persistence || new MemoryPersistence(), 
    [options.persistence]
  )

  // Connection state
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: 'disconnected',
  })
  const [connection, setConnection] = useState<AcpConnection | null>(null)

  // Session state
  const [sessions, setSessions] = useState<SessionMetadata[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [activeSessionData, setActiveSessionData] = useState<SessionData | null>(null)
  const [availableModes, setAvailableModes] = useState<SessionMode[]>([])
  const [currentModeId, setCurrentModeId] = useState<string | null>(null)
  const [pendingPermission, setPendingPermission] = useState<IdentifiedPermissionRequest | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Refs
  const pendingPermissionsRef = useRef<Map<string, Deferred<RequestPermissionResponse>>>(new Map())
  const lifecycleCallbacks = options.onLifecycleEvent

  // Load sessions from persistence on mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const loadedSessions = await persistence.listSessions()
        setSessions(loadedSessions)
      } catch (error) {
        console.error('Failed to load sessions:', error)
      }
    }
    loadSessions()
  }, [persistence])

  // Connection action
  const connect = useCallback(async () => {
    lifecycleCallbacks?.onConnectionStateChange?.({ status: 'connecting', url: options.wsUrl })
    
    const conn = new AcpConnection({
      wsUrl: options.wsUrl,
      reconnectAttempts: options.reconnectAttempts,
      reconnectDelay: options.reconnectDelay,
      onConnectionStateChange: (state) => {
        setConnectionState(state)
        lifecycleCallbacks?.onConnectionStateChange?.(state)
      },
      onError: (error) => {
        lifecycleCallbacks?.onError?.(error)
      },
    })

    // Override permission handling
    const originalCreateClient = (conn as any).createClientInterface?.bind(conn)
    if (originalCreateClient) {
      ;(conn as any).createClientInterface = () => {
        const client = originalCreateClient()
        
        client.requestPermission = async (params: RequestPermissionRequest) => {
          const permissionId = crypto.randomUUID()
          const deferred = new Deferred<RequestPermissionResponse>()
          pendingPermissionsRef.current.set(permissionId, deferred)

          const identifiedRequest: IdentifiedPermissionRequest = {
            ...params,
            permissionId,
          }

          setPendingPermission(identifiedRequest)
          lifecycleCallbacks?.onPermissionRequest?.(identifiedRequest)

          return deferred.promise
        }

        return client
      }
    }

    try {
        await conn.connect()
        await conn.initialize()
        setConnection(conn)
        lifecycleCallbacks?.onConnectionStateChange?.({ status: 'connected', url: options.wsUrl })
      } catch (error) {
        setConnectionState({
          status: 'error',
          url: options.wsUrl,
          error: error instanceof Error ? error.message : String(error)
        })
        lifecycleCallbacks?.onConnectionStateChange?.({
          status: 'error',
          url: options.wsUrl,
          error: error instanceof Error ? error.message : String(error)
        })
        throw error
      }
    }, [options.wsUrl, options.reconnectAttempts, options.reconnectDelay, persistence, lifecycleCallbacks])

  const disconnect = useCallback(() => {
    connection?.disconnect()
    setConnection(null)
    setConnectionState({ status: 'disconnected' })
    setActiveSessionId(null)
    setActiveSessionData(null)
    pendingPermissionsRef.current.clear()
  }, [connection])

  const reconnect = useCallback(async () => {
    disconnect()
    await connect()
  }, [connect, disconnect])

  // Session actions
  const createSession = useCallback(
    async (params?: Partial<NewSessionRequest>) => {
      if (!connection) {
        console.error('createSession called but connection is null', { connectionState })
        throw new Error('Not connected to agent. Please make sure you are connected first.')
      }
      
      lifecycleCallbacks?.onSessionCreateStart?.()
      setIsLoading(true)
      
      try {
        const result = await connection.newSession({
          cwd: params?.cwd || options.cwd || '/tmp',
          mcpServers: params?.mcpServers || [],
          ...params,
        })

        // Save to persistence
        const sessionData: SessionData = {
          id: result.sessionId,
          title: 'New conversation',
          createdAt: new Date(),
          updatedAt: new Date(),
          messages: [],
          messageCount: 0,
          agentName: options.agentName,
          wsUrl: options.wsUrl,
          modeId: result.modes?.currentModeId,
          modelId: (params as Record<string, unknown>)?.modelId as string | undefined,
        }
        
        await persistence.saveSession(result.sessionId, sessionData)
        
        // Update state
        setSessions(prev => [sessionData, ...prev])
        setActiveSessionId(result.sessionId)
        setActiveSessionData(sessionData)
        setAvailableModes(result.modes?.availableModes || [])
        setCurrentModeId(result.modes?.currentModeId || null)
        
        lifecycleCallbacks?.onSessionCreateSuccess?.(result.sessionId)
        
        return result
      } catch (error) {
        lifecycleCallbacks?.onSessionCreateError?.(error as Error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [connection, options.cwd, options.agentName, options.wsUrl, persistence, lifecycleCallbacks]
  )

  const loadSession = useCallback(
    async (sessionId: string, params?: Partial<LoadSessionRequest>) => {
      if (!connection) throw new Error('Not connected')
      
      lifecycleCallbacks?.onSessionLoadStart?.(sessionId)
      setIsLoading(true)
      
      try {
        const result = await connection.loadSession({
          sessionId,
          cwd: params?.cwd || options.cwd || '/tmp',
          mcpServers: params?.mcpServers || [],
        })

        // Load from persistence
        const sessionData = await persistence.getSession(sessionId)
        const messages = await persistence.getMessages(sessionId)
        
        if (sessionData) {
          sessionData.messages = messages
          setActiveSessionData(sessionData)
        }
        
        setActiveSessionId(sessionId)
        setAvailableModes(result.modes?.availableModes || [])
        setCurrentModeId(result.modes?.currentModeId || null)
        
        // Update session list
        const updatedSessions = await persistence.listSessions()
        setSessions(updatedSessions)
        
        lifecycleCallbacks?.onSessionLoadSuccess?.(sessionId)
        
        return { ...result, messages, sessionData }
      } catch (error) {
        lifecycleCallbacks?.onSessionLoadError?.(sessionId, error as Error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [connection, options.cwd, persistence, lifecycleCallbacks]
  )

  const forkSession = useCallback(
    async (sessionId: string) => {
      if (!connection) throw new Error('Not connected')
      
      try {
        const result = await connection.forkSession({
          sessionId,
          cwd: options.cwd || '/tmp',
        })
        await persistence.forkSession(sessionId, result.sessionId)
        
        const updatedSessions = await persistence.listSessions()
        setSessions(updatedSessions)
        setActiveSessionId(result.sessionId)
        
        return result
      } catch (error) {
        throw error
      }
    },
    [connection, persistence]
  )

  const duplicateSession = useCallback(
    async (sessionId: string) => {
      const newId = crypto.randomUUID()
      await persistence.duplicateSession(sessionId, newId)
      
      const updatedSessions = await persistence.listSessions()
      setSessions(updatedSessions)
      setActiveSessionId(newId)
    },
    [persistence]
  )

  const deleteSession = useCallback(
    async (sessionId: string) => {
      await persistence.deleteSession(sessionId)
      
      const updatedSessions = await persistence.listSessions()
      setSessions(updatedSessions)
      
      if (activeSessionId === sessionId) {
        setActiveSessionId(null)
        setActiveSessionData(null)
      }
    },
    [persistence, activeSessionId]
  )

  const setSessionMode = useCallback(
    async (modeId: string) => {
      if (!connection || !activeSessionId) throw new Error('No active session')
      
      const result = await connection.setSessionMode({
        sessionId: activeSessionId,
        modeId,
      })
      
      setCurrentModeId(modeId)
      await persistence.updateSessionMetadata(activeSessionId, { modeId })
      
      return result
    },
    [connection, activeSessionId, persistence]
  )

  // Permission handling
  const resolvePermission = useCallback((permissionId: string, response: RequestPermissionResponse) => {
    const deferred = pendingPermissionsRef.current.get(permissionId)
    if (deferred) {
      deferred.resolve(response)
      pendingPermissionsRef.current.delete(permissionId)
    }
    setPendingPermission(null)
  }, [])

  const rejectPermission = useCallback((permissionId: string, error: Error) => {
    const deferred = pendingPermissionsRef.current.get(permissionId)
    if (deferred) {
      deferred.reject(error)
      pendingPermissionsRef.current.delete(permissionId)
    }
    setPendingPermission(null)
  }, [])

  // Refresh sessions
  const refreshSessions = useCallback(async () => {
    const updatedSessions = await persistence.listSessions()
    setSessions(updatedSessions)
  }, [persistence])

  return {
    // Connection
    connection,
    connectionState,
    isConnected: connectionState.status === 'connected',

    // Sessions
    sessions,
    activeSessionId,
    setActiveSessionId,
    activeSessionData,
    isLoading,

    // Session actions
    createSession,
    loadSession,
    deleteSession,
    forkSession,
    duplicateSession,
    refreshSessions,

    // Agent capabilities
    agentCapabilities: connection?.agentCapabilities || null,
    availableCommands: connection?.availableCommands || [],
    availableModes,
    currentModeId,
    setSessionMode,

    // Connection actions
    connect,
    disconnect,
    reconnect,

    // Permission handling
    pendingPermission,
    resolvePermission,
    rejectPermission,

    // Persistence
    persistence,
    
    // Helper to append message to active session
    appendMessage: async (message: UIMessage) => {
      if (activeSessionId) {
        await persistence.appendMessage(activeSessionId, message)
        const updated = await persistence.getSession(activeSessionId)
        if (updated) {
          setActiveSessionData(updated)
        }
      }
    },
  }
}
