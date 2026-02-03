import { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { useAcpSession, MemoryPersistence } from 'tanstack-acp';

// Layout components
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';

// Connection components
import { ConnectionPanel } from '@/components/connection/connection-panel';

// Session components
import { SessionsPanel } from '@/components/sessions/sessions-panel';

// Chat components
import { ChatContainer } from '@/components/chat/chat-container';
import { EmptyChat } from '@/components/chat/empty-chat';

// Types
import { AGENT_CONFIGS, type AgentConfig, type ConnectionStatus } from '@/types';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentConfig>(AGENT_CONFIGS[0]);
  const [customUrl] = useState('ws://localhost:8000');
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [messages, setMessages] = useState<Array<{id: string, role: 'user' | 'assistant', content: string}>>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const wsUrl = selectedAgent.id === 'custom' ? customUrl : selectedAgent.wsUrl;

  // Lifecycle event handlers
  const handleLifecycleEvent = useCallback(() => ({
    onSessionCreateStart: () => {
      toast.loading('Creating conversation...', { id: 'create-session' });
    },
    onSessionCreateSuccess: (sessionId: string) => {
      toast.success('Conversation created', {
        id: 'create-session',
        description: `Session ${sessionId.slice(0, 8)}...`,
      });
    },
    onSessionCreateError: (error: Error) => {
      toast.error('Failed to create conversation', {
        id: 'create-session',
        description: error.message,
      });
    },
    onSessionLoadStart: (sessionId: string) => {
      toast.loading('Loading conversation...', { id: `load-${sessionId}` });
    },
    onSessionLoadSuccess: (sessionId: string) => {
      toast.success('Conversation loaded', {
        id: `load-${sessionId}`,
        description: `Session ${sessionId.slice(0, 8)}...`,
      });
    },
    onSessionLoadError: (sessionId: string, error: Error) => {
      toast.error('Failed to load conversation', {
        id: `load-${sessionId}`,
        description: error.message,
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

  // ACP Session hook
  const {
    connectionState,
    isConnected,
    sessions,
    activeSessionId,
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
    connection,
    pendingPermission,
    resolvePermission,
    rejectPermission,
  } = useAcpSession({
    wsUrl,
    agentName: selectedAgent.name,
    persistence: useMemo(() => new MemoryPersistence(), []),
    onLifecycleEvent: handleLifecycleEvent(),
  });



  // Handle sending messages
  const handleSendMessage = useCallback(async (message: string) => {
    if (!connection || !activeSessionId) return;
    
    setIsChatLoading(true);
    
    // Add user message to local state
    const userMessageId = `user-${Date.now()}`;
    setMessages(prev => [...prev, { id: userMessageId, role: 'user', content: message }]);
    
    try {
      // Send prompt through ACP connection
      await connection.prompt(activeSessionId, [
        { type: 'text', text: message }
      ]);
      
      // Note: In a real implementation, you would listen to stream chunks
      // and update messages accordingly. For now, we add a placeholder.
      const assistantMessageId = `assistant-${Date.now()}`;
      setMessages(prev => [...prev, { 
        id: assistantMessageId, 
        role: 'assistant', 
        content: 'Response from agent...'
      }]);
    } catch (err) {
      toast.error('Failed to send message', { 
        description: err instanceof Error ? err.message : 'Unknown error' 
      });
    } finally {
      setIsChatLoading(false);
    }
  }, [connection, activeSessionId]);

  // Safe create session with error handling
  const handleCreateSession = useCallback(async () => {
    try {
      await createSession();
    } catch (err) {
      toast.error('Failed to create session', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }, [createSession]);

  // Handle agent change - must accept string but we need AgentConfig
  const handleAgentChange = useCallback((agentId: string) => {
    const agent = AGENT_CONFIGS.find(a => a.id === agentId);
    if (agent) {
      setSelectedAgent(agent);
    }
  }, []);

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <AppSidebar className={sidebarOpen ? 'block' : 'hidden md:block'}>
        <div className="flex-1 flex flex-col p-4 space-y-6 overflow-y-auto">
          {/* Brand Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brand/70 flex items-center justify-center shadow-lg">
              <span className="text-brand-foreground font-bold text-lg">A</span>
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">
                TanStack <span className="text-brand">ACP</span>
              </h1>
              <p className="text-xs text-muted-foreground">AI Agent Interface</p>
            </div>
          </div>

          {/* Connection Panel */}
          <ConnectionPanel
            status={connectionState.status}
            selectedAgentId={selectedAgent.id}
            error={connectionState.error}
            onAgentChange={handleAgentChange}
            onConnect={connect}
            onDisconnect={disconnect}
          />

          {/* Sessions Panel (only when connected) */}
          {isConnected && (
            <SessionsPanel
              sessions={sessions}
              activeSessionId={activeSessionId}
              availableModes={availableModes}
              currentModeId={currentModeId}
              availableCommands={availableCommands}
              isLoading={isLoading}
              isConnected={isConnected}
               onCreateSession={handleCreateSession}
              onLoadSession={loadSession}
              onDeleteSession={deleteSession}
              onForkSession={forkSession}
              onDuplicateSession={duplicateSession}
              onSetMode={setSessionMode}
              onExecuteCommand={handleSendMessage}
              onRefreshSessions={refreshSessions}
            />
          )}
        </div>
      </AppSidebar>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader
          isConnected={isConnected}
          agentName={selectedAgent.name}
          activeSessionId={activeSessionId}
          activeSessionTitle={activeSessionData?.title}
          onMenuClick={toggleSidebar}
        />

        {/* Chat Area */}
        <main className="flex-1 flex flex-col min-h-0">
          {!isConnected ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyChat
                title="Not Connected"
                description="Select an agent from the sidebar and click 'Connect to Agent' to start chatting"
                icon="message"
              />
            </div>
          ) : !activeSessionId ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyChat
                title="No Active Session"
                description="Create a new conversation or select an existing one from the sidebar"
                icon="zap"
                showCta={true}
                ctaText="New Chat"
                onCtaClick={handleCreateSession}
              />
            </div>
          ) : (
            <ChatContainer
              messages={messages}
              isAgentTyping={isAgentTyping}
              isLoading={isChatLoading}
              connectionStatus={connectionState.status}
              connectionError={connectionState.error}
              selectedModel="default"
              onModelChange={() => {}}
              onSendMessage={handleSendMessage}
              activeSessionId={activeSessionId}
              onNewChat={handleCreateSession}
              disabled={!isConnected || !activeSessionId || isChatLoading}
            />
          )}
        </main>
      </div>

      {/* Permission Dialog */}
      {pendingPermission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold mb-2">Permission Request</h3>
            <p className="text-muted-foreground mb-4">
              The agent is requesting permission to execute: {pendingPermission.toolCall.title}
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => rejectPermission(pendingPermission.permissionId, new Error('User denied'))}
                className="px-4 py-2 rounded-lg border hover:bg-accent transition-colors"
              >
                Deny
              </button>
              <button
                onClick={() => resolvePermission(pendingPermission.permissionId, { outcome: 'allow' } as any)}
                className="px-4 py-2 rounded-lg bg-brand text-brand-foreground hover:bg-brand/90 transition-colors"
              >
                Allow Once
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
