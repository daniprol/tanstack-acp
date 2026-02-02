/**
 * Hook for managing ACP chat session and connection
 * 
 * Combines useAcpSession from tanstack-acp with local UI state
 */

import { useState, useCallback, useMemo } from 'react';
import { useAcpSession, createAcpAdapter } from 'tanstack-acp';
import type { AgentConfig, AppSession, ConnectionState } from '@/types';

interface UseChatSessionProps {
  selectedAgent: AgentConfig;
  customUrl: string;
}

interface UseChatSessionReturn {
  // Connection
  connectionState: ConnectionState;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  
  // Sessions
  sessions: AppSession[];
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;
  createSession: () => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  forkSession: (sessionId: string) => Promise<void>;
  isCreatingSession: boolean;
  
  // Agent capabilities
  availableCommands: { name: string; description: string }[];
  availableModes: { id: string; name: string; description?: string }[];
  currentModeId: string | null;
  setSessionMode: (modeId: string) => Promise<void>;
  
  // Permissions
  pendingPermission: import('tanstack-acp').IdentifiedPermissionRequest | null;
  resolvePermission: (permissionId: string, response: import('@agentclientprotocol/sdk').RequestPermissionResponse) => void;
  rejectPermission: (permissionId: string, error: Error) => void;
  
  // Adapter for useChat
  adapter: import('@tanstack/ai-react').ConnectionAdapter | null;
}

export function useChatSession({ selectedAgent, customUrl }: UseChatSessionProps): UseChatSessionReturn {
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  
  const wsUrl = selectedAgent.id === 'custom' ? customUrl : selectedAgent.wsUrl;
  
  const {
    connection,
    connectionState,
    isConnected,
    sessions,
    activeSessionId,
    setActiveSessionId,
    availableCommands,
    availableModes,
    currentModeId,
    createSession: createAcpSession,
    loadSession: loadAcpSession,
    forkSession: forkAcpSession,
    setSessionMode: setAcpSessionMode,
    connect,
    disconnect,
    pendingPermission,
    resolvePermission,
    rejectPermission,
  } = useAcpSession({
    wsUrl,
    autoConnect: false,
    reconnectAttempts: 3,
    reconnectDelay: 2000,
    cwd: '/tmp',
  });
  
  // Create adapter for useChat
  const adapter = useMemo(() => {
    if (!connection || !isConnected) {
      return null;
    }
    
    return createAcpAdapter({
      connection,
      sessionId: activeSessionId,
      sessionParams: { cwd: '/tmp', mcpServers: [] },
      onSessionCreated: (sessionId) => {
        console.log('Session created:', sessionId);
      },
      onSessionLoaded: (sessionId) => {
        console.log('Session loaded:', sessionId);
      },
    });
  }, [connection, isConnected, activeSessionId]);
  
  // Wrap session actions with loading state
  const createSession = useCallback(async () => {
    setIsCreatingSession(true);
    try {
      await createAcpSession({
        cwd: '/tmp',
        mcpServers: [],
      });
    } finally {
      setIsCreatingSession(false);
    }
  }, [createAcpSession]);
  
  const loadSession = useCallback(async (sessionId: string) => {
    await loadAcpSession(sessionId, { cwd: '/tmp' });
  }, [loadAcpSession]);
  
  const forkSession = useCallback(async (sessionId: string) => {
    await forkAcpSession(sessionId);
  }, [forkAcpSession]);
  
  const setSessionMode = useCallback(async (modeId: string) => {
    await setAcpSessionMode(modeId);
  }, [setAcpSessionMode]);
  
  // Enhance sessions with agent name
  const enhancedSessions: AppSession[] = useMemo(() => {
    return sessions.map(session => ({
      ...session,
      agentName: selectedAgent.name,
    }));
  }, [sessions, selectedAgent.name]);
  
  return {
    connectionState,
    isConnected,
    connect,
    disconnect,
    sessions: enhancedSessions,
    activeSessionId,
    setActiveSessionId,
    createSession,
    loadSession,
    forkSession,
    isCreatingSession,
    availableCommands,
    availableModes,
    currentModeId,
    setSessionMode,
    pendingPermission,
    resolvePermission,
    rejectPermission,
    adapter,
  };
}
