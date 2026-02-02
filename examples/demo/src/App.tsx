import { useState, useCallback } from 'react';
import { useChat, type Message } from '@tanstack/ai-react';
import { ConnectionPanel } from '@/components/connection-panel';
import { SessionPanel } from '@/components/session-panel';
import { ChatMessageList } from '@/components/chat-message-list';
import { ChatInput } from '@/components/chat-input';
import { ChatEmptyState, ChatError } from '@/components/chat-status';
import { PermissionDialog } from '@/components/permission-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useChatSession } from '@/hooks/use-chat-session';
import { AGENT_CONFIGS, type AgentConfig } from '@/types';
import { cn } from '@/lib/utils';
import {
  MessageSquare,
  Clock,
} from 'lucide-react';

export default function App() {
  // Local UI state
  const [selectedAgent, setSelectedAgent] = useState<AgentConfig>(AGENT_CONFIGS[0]);
  const [customUrl, setCustomUrl] = useState('ws://localhost:8000');
  const [inputValue, setInputValue] = useState('');

  // Chat session hook
  const {
    connectionState,
    isConnected,
    connect,
    disconnect,
    sessions,
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
  } = useChatSession({
    selectedAgent,
    customUrl,
  });

  // TanStack AI useChat
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
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
    setInputValue(newInput);
  }, [setInput]);

  // Custom submit handler
  const handleCustomSubmit = useCallback((message: string) => {
    setInput(message);
    handleSubmit();
  }, [handleSubmit, setInput]);

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Permission Dialog */}
      <PermissionDialog
        request={pendingPermission}
        onResolve={resolvePermission}
        onReject={rejectPermission}
      />

      {/* Sidebar */}
      <aside className="w-80 bg-card border-r flex flex-col shrink-0">
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-xl font-bold">TanStack ACP</h1>
              <p className="text-xs text-muted-foreground mt-1">
                Agent Client Protocol Demo
              </p>
            </div>

            {/* Connection Panel */}
            <ConnectionPanel
              selectedAgent={selectedAgent}
              customUrl={customUrl}
              connectionState={connectionState}
              isConnected={isConnected}
              onAgentChange={setSelectedAgent}
              onCustomUrlChange={setCustomUrl}
              onConnect={connect}
              onDisconnect={disconnect}
            />

            {/* Session Panel */}
            <SessionPanel
              sessions={sessions}
              activeSessionId={activeSessionId}
              availableModes={availableModes}
              currentModeId={currentModeId}
              availableCommands={availableCommands}
              isConnected={isConnected}
              isCreatingSession={isCreatingSession}
              onCreateSession={createSession}
              onLoadSession={loadSession}
              onForkSession={forkSession}
              onSetMode={setSessionMode}
              onCommandSelect={handleCommandSelect}
            />
          </div>
        </ScrollArea>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <header className="h-14 border-b bg-card flex items-center px-4 shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-medium">
              {selectedAgent.name}
            </h2>
            {activeSessionId && (
              <>
                <Separator orientation="vertical" className="h-4 mx-2" />
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span className="font-mono text-xs">
                    {activeSessionId.slice(0, 8)}...
                  </span>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          <ChatEmptyState
            isConnected={isConnected}
            hasActiveSession={!!activeSessionId}
            onCreateSession={createSession}
          />
          {messages.length > 0 && <ChatMessageList messages={messages} />}
        </div>

        {/* Error */}
        {error && <ChatError error={error} />}

        {/* Input */}
        <div className="p-4 border-t bg-card shrink-0">
          <div className="max-w-3xl mx-auto">
            <ChatInput
              onSubmit={handleCustomSubmit}
              disabled={!isConnected || !activeSessionId || isLoading}
              placeholder={
                !isConnected
                  ? 'Connect to start chatting...'
                  : !activeSessionId
                  ? 'Create a session first...'
                  : isLoading
                  ? 'Agent is thinking...'
                  : 'Type a message... (Shift+Enter for new line)'
              }
            />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {activeSessionId
                ? `Session: ${activeSessionId.slice(0, 8)}...`
                : 'No active session'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
