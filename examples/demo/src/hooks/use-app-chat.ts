import { useCallback, useState } from 'react';
import { useAcpSession, createAcpAdapter, MemoryPersistence } from 'tanstack-acp';
import { toast } from 'sonner';
import type { AgentConfig, ConnectionStatus } from '@/types';

interface UseAppChatProps {
  agent: AgentConfig;
  wsUrl: string;
}

export function useAppChat({ agent, wsUrl }: UseAppChatProps) {
  const [isAgentTyping, setIsAgentTyping] = useState(false);

  const handleLifecycleEvent = useCallback(() => ({
    onSessionCreateStart: () => {
      toast.loading('Creating conversation...', { id: 'create-session' });
    },
    onSessionCreateSuccess: (sessionId: string) => {
      toast.success('Conversation created', { 
        id: 'create-session',
        description: `Session ${sessionId.slice(0, 8)}...`
      });
    },
    onSessionCreateError: (error: Error) => {
      toast.error('Failed to create conversation', { 
        id: 'create-session',
        description: error.message
      });
    },
    onSessionLoadStart: (sessionId: string) => {
      toast.loading('Loading conversation...', { id: `load-${sessionId}` });
    },
    onSessionLoadSuccess: (sessionId: string) => {
      toast.success('Conversation loaded', { 
        id: `load-${sessionId}`,
        description: `Session ${sessionId.slice(0, 8)}...`
      });
    },
    onSessionLoadError: (sessionId: string, error: Error) => {
      toast.error('Failed to load conversation', { 
        id: `load-${sessionId}`,
        description: error.message
      });
    },
    onPromptStart: () => {
      setIsAgentTyping(true);
    },
    onPromptSuccess: () => {
      setIsAgentTyping(false);
    },
    onPromptError: (_sessionId: string, error: Error) => {
      setIsAgentTyping(false);
      toast.error('Agent error', { description: error.message });
    },
    onConnectionStateChange: (state: { status: ConnectionStatus; error?: string }) => {
      if (state.status === 'connected') {
        toast.success('Connected to agent');
      } else if (state.status === 'error') {
        toast.error('Connection failed', { description: state.error });
      }
    },
  }), []);

  const {
    connection,
    connectionState,
    isConnected,
    sessions,
    activeSessionId,
    setActiveSessionId,
    activeSessionData,
    isLoading,
    createSession,
    loadSession,
    deleteSession,
    forkSession,
    duplicateSession,
    refreshSessions,
    availableCommands,
    availableModes,
    currentModeId,
    setSessionMode,
    connect,
    disconnect,
    pendingPermission,
    resolvePermission,
    rejectPermission,
  } = useAcpSession({
    wsUrl,
    agentName: agent.name,
    persistence: new MemoryPersistence(),
    onLifecycleEvent: handleLifecycleEvent(),
  });

  const adapter = isConnected && connection
    ? createAcpAdapter({ connection, sessionId: activeSessionId })
    : null;

  return {
    // Connection
    connectionState,
    isConnected,
    connect,
    disconnect,
    
    // Sessions
    sessions,
    activeSessionId,
    setActiveSessionId,
    activeSessionData,
    isLoading,
    createSession,
    loadSession,
    deleteSession,
    forkSession,
    duplicateSession,
    refreshSessions,
    
    // Capabilities
    availableCommands,
    availableModes,
    currentModeId,
    setSessionMode,
    
    // Chat
    adapter,
    isAgentTyping,
    pendingPermission,
    resolvePermission,
    rejectPermission,
  };
}
