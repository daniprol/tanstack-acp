import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAcpSession, createAcpAdapter, MemoryPersistence } from 'tanstack-acp';
import { useChat } from '@tanstack/ai-react';
import { ConnectionPanel } from '@/components/connection-panel-new';
import { SessionExplorer } from '@/components/session-explorer';
import { ChatMessageList } from '@/components/chat-message-list';
import { ChatInput } from '@/components/chat-input';
import { AgentTypingIndicator } from '@/components/agent-typing-indicator';
import { PermissionDialog } from '@/components/permission-dialog';
import { AGENT_CONFIGS } from '@/types';
import type { AgentConfig } from '@/types';
import { cn } from '@/lib/utils';
import { 
  MessageSquare,
  Clock,
  ChevronLeft,
  ChevronRight,
  PanelLeft,
  PanelLeftClose
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function App() {
  // Local UI state
  const [selectedAgent, setSelectedAgent] = useState<AgentConfig>(AGENT_CONFIGS[0]);
  const [customUrl, setCustomUrl] = useState('ws://localhost:8000');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAgentTyping, setIsAgentTyping] = useState(false);

  const wsUrl = selectedAgent.id === 'custom' ? customUrl : selectedAgent.wsUrl;

  // Lifecycle callbacks
  const handleLifecycleEvent = useCallback({
    onSessionCreateStart: () => {
      toast.loading('Creating new conversation...', { id: 'create-session' });
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
    onPromptError: (sessionId: string, error: Error) => {
      setIsAgentTyping(false);
      toast.error('Agent error', {
        description: error.message
      });
    },
    onConnectionStateChange: (state) => {
      if (state.status === 'connected') {
        toast.success('Connected to agent');
      } else if (state.status === 'error') {
        toast.error('Connection failed', {
          description: state.error
        });
      }
    },
  }, []);

  // ACP Session hook (MANUAL connection - no autoConnect!)
  const {
    connection,
    connectionState,
    isConnected,
    sessions,
    activeSessionId,
    setActiveSessionId,
    activeSessionData,
    isLoading: isSessionLoading,
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
    persistence,
    appendMessage,
  } = useAcpSession({
    wsUrl,
    agentName: selectedAgent.name,
    persistence: new MemoryPersistence(),
    onLifecycleEvent: handleLifecycleEvent,
  });

  // Create adapter for useChat
  const adapter = isConnected ? createAcpAdapter({
    connection,
    sessionId: activeSessionId,
  }) : null;

  // TanStack AI useChat
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading: isChatLoading,
    error,
    setInput,
  } = useChat({
    connection: adapter || (() => { throw new Error('Not connected'); }),
    initialMessages: [],
  });

  // Handle command selection
  const handleCommandSelect = useCallback((command: string) => {
    const newInput = `/${command} `;
    setInput(newInput);
  }, [setInput]);

  // Custom submit handler
  const handleCustomSubmit = useCallback((message: string) => {
    setInput(message);
    handleSubmit();
  }, [handleSubmit, setInput]);

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Permission Dialog */}
      {pendingPermission && (
        <PermissionDialog
          request={pendingPermission}
          onResolve={resolvePermission}
          onReject={rejectPermission}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-card border-r flex flex-col transition-all duration-300 ease-in-out",
          sidebarOpen ? "w-80" : "w-0 overflow-hidden"
        )}
      >
        <ScrollArea className="flex-1">
          <div className="p-5 space-y-6">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                <MessageSquare className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight">TanStack ACP</h1>
                <p className="text-xs text-muted-foreground">AI Agent Interface</p>
              </div>
            </div>

            {/* Connection Panel */}
            <ConnectionPanel
              selectedAgent={selectedAgent}
              customUrl={customUrl}
              connectionStatus={connectionState.status}
              connectionError={connectionState.error}
              onAgentChange={setSelectedAgent}
              onCustomUrlChange={setCustomUrl}
              onConnect={connect}
              onDisconnect={disconnect}
            />

            {/* Session Explorer (only show when connected) */}
            {isConnected && (
              <SessionExplorer
                sessions={sessions}
                activeSessionId={activeSessionId}
                availableModes={availableModes}
                currentModeId={currentModeId}
                availableCommands={availableCommands}
                isLoading={isSessionLoading}
                onCreateSession={createSession}
                onLoadSession={loadSession}
                onDeleteSession={deleteSession}
                onForkSession={forkSession}
                onDuplicateSession={duplicateSession}
                onSetMode={setSessionMode}
                onCommandSelect={handleCommandSelect}
                onRefresh={refreshSessions}
              />
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-background">
        {/* Chat Header */}
        <header className="h-16 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-9 w-9"
            >
              {sidebarOpen ? (
                <PanelLeftClose className="w-5 h-5" />
              ) : (
                <PanelLeft className="w-5 h-5" />
              )}
            </Button>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2.5 h-2.5 rounded-full",
                isConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
              )} />
              <h2 className="font-semibold">
                {selectedAgent.name}
              </h2>
            </div>
            
            {activeSessionId && (
              <>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono text-xs">
                    {activeSessionId.slice(0, 8)}...
                  </span>
                  {activeSessionData?.title && (
                    <>
                      <span className="text-muted-foreground/50">•</span>
                      <span className="truncate max-w-[200px]">
                        {activeSessionData.title}
                      </span>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Connection Status Badge */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium text-emerald-700">Connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
                <div className="w-2 h-2 rounded-full bg-slate-400" />
                <span className="text-sm font-medium text-slate-600">Disconnected</span>
              </div>
            )}
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-hidden relative">
          {!isConnected ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-6">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <MessageSquare className="w-10 h-10 text-primary/60" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-muted-foreground">
                  Not Connected
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Select an agent from the sidebar and click "Connect to Agent" to start chatting
                </p>
              </div>
            </div>
          ) : !activeSessionId ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-6">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <Clock className="w-10 h-10 text-primary/60" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-muted-foreground">
                  No Active Session
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Create a new conversation or select an existing one from the sidebar
                </p>
              </div>
            </div>
          ) : (
            <ChatMessageList messages={messages} />
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="px-4 py-3 bg-red-50 border-t border-red-100">
            <p className="text-sm text-red-600 font-medium">
              Error: {error.message || 'An error occurred'}
            </p>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t bg-card p-4">
          <div className="max-w-3xl mx-auto space-y-3">
            {/* Agent Typing Indicator */}
            {isAgentTyping && (
              <div className="px-1">
                <AgentTypingIndicator />
              </div>
            )}
            
            <ChatInput
              onSubmit={handleCustomSubmit}
              disabled={!isConnected || !activeSessionId || isChatLoading}
              placeholder={
                !isConnected
                  ? 'Connect to an agent to start chatting...'
                  : !activeSessionId
                  ? 'Create a conversation first...'
                  : isChatLoading
                  ? 'Agent is thinking...'
                  : 'Type a message... (Shift+Enter for new line)'
              }
            />
            
            {/* Footer Info */}
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>
                {activeSessionId ? (
                  <>
                    Session: <span className="font-mono">{activeSessionId.slice(0, 8)}...</span>
                    {activeSessionData?.messageCount && (
                      <>
                        {' '}{activeSessionData.messageCount} messages
                      </>
                    )}
                  </>
                ) : (
                  'No active session'
                )}
              </span>
              <span>
                {isConnected ? (
                  <span className="text-emerald-600 font-medium">
                    Connected to {selectedAgent.name}
                  </span>
                ) : (
                  <span>Disconnected</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
