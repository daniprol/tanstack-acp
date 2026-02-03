import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';
import { TypingIndicator } from './typing-indicator';
import { EmptyChat } from './empty-chat';
import type { ConnectionStatus } from '@/types';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

// Simple message interface compatible with @tanstack/ai UIMessage
interface MessageLike {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  parts?: Array<{ type: string; text?: string; reasoning?: string }>;
  content?: string | Array<{ type: string; text?: string; reasoning?: string }>;
  createdAt?: Date | string;
  toolInvocations?: Array<{
    toolCallId: string;
    toolName: string;
    args: Record<string, unknown>;
    result?: unknown;
  }>;
}

interface ChatContainerProps {
  messages: MessageLike[];
  isAgentTyping: boolean;
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  connectionStatus: ConnectionStatus;
  connectionError?: string;
  activeSessionId: string | null;
  onNewChat?: () => void;
  disabled?: boolean;
  className?: string;
}

export function ChatContainer({
  messages,
  isAgentTyping,
  isLoading,
  onSendMessage,
  selectedModel,
  onModelChange,
  connectionStatus,
  connectionError,
  activeSessionId,
  onNewChat,
  disabled = false,
  className,
}: ChatContainerProps) {
  const isConnected = connectionStatus === 'connected';
  const isConnecting = connectionStatus === 'connecting';
  const hasError = connectionStatus === 'error';
  const hasActiveSession = !!activeSessionId;

  const getConnectionBadge = () => {
    if (isConnecting) {
      return (
        <Badge variant="warning" className="animate-pulse">
          <Wifi className="w-3 h-3 mr-1" />
          Connecting...
        </Badge>
      );
    }

    if (hasError) {
      return (
        <Badge variant="destructive">
          <AlertCircle className="w-3 h-3 mr-1" />
          Error
        </Badge>
      );
    }

    if (isConnected) {
      return (
        <Badge variant="success">
          <Wifi className="w-3 h-3 mr-1" />
          Connected
        </Badge>
      );
    }

    return (
      <Badge variant="secondary">
        <WifiOff className="w-3 h-3 mr-1" />
        Disconnected
      </Badge>
    );
  };

  const isInputDisabled = !isConnected || isConnecting || !hasActiveSession || disabled;

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-background',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-sm">
            {hasActiveSession ? 'Chat' : 'No Active Chat'}
          </h2>
          {hasActiveSession && (
            <span className="text-xs text-zinc-500 font-mono">
              #{activeSessionId?.slice(0, 8)}
            </span>
          )}
        </div>
        {getConnectionBadge()}
      </div>

      {/* Error Display */}
      {hasError && connectionError && (
        <div className="px-4 py-2 bg-destructive/10 border-b border-destructive/20">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4" />
            <span>{connectionError}</span>
          </div>
        </div>
      )}

      {/* Message List */}
      <MessageList
        messages={messages}
        isAgentTyping={isAgentTyping}
        emptyState={
          !hasActiveSession ? (
            <EmptyChat
              title="No active conversation"
              description="Select an existing conversation from the sidebar or start a new chat to begin."
              icon="message"
              showCta={!!onNewChat}
              ctaText="Start New Chat"
              onCtaClick={onNewChat}
            />
          ) : messages.length === 0 ? (
            <EmptyChat
              title="Ready to chat"
              description="Send a message to start the conversation with your AI assistant."
              icon="zap"
              showCta={false}
            />
          ) : undefined
        }
      />

      {/* Input Area */}
      <div className="border-t bg-background">
        {/* Typing indicator in input area when no messages yet */}
        {hasActiveSession && messages.length > 0 && isAgentTyping && (
          <div className="px-4 py-2 border-b bg-zinc-50/50 dark:bg-zinc-900/50">
            <TypingIndicator text="Agent is typing..." />
          </div>
        )}

        <ChatInput
          onSendMessage={onSendMessage}
          selectedModel={selectedModel}
          onModelChange={onModelChange}
          isLoading={isLoading}
          disabled={isInputDisabled}
          placeholder={
            !isConnected
              ? 'Connect to an agent to start chatting...'
              : !hasActiveSession
              ? 'Select or create a conversation...'
              : 'Type your message...'
          }
        />
      </div>
    </div>
  );
}
