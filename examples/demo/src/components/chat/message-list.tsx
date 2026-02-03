import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageItem } from './message-item';
import { TypingIndicator } from './typing-indicator';
import { format, isSameDay, isToday, isYesterday, subDays } from 'date-fns';

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

interface MessageListProps {
  messages: MessageLike[];
  isAgentTyping?: boolean;
  className?: string;
  emptyState?: React.ReactNode;
}

interface GroupedMessages {
  date: Date;
  label: string;
  messages: MessageLike[];
}

function groupMessagesByDate(messages: MessageLike[]): GroupedMessages[] {
  const groups: GroupedMessages[] = [];
  let currentGroup: GroupedMessages | null = null;

  messages.forEach((message) => {
    const messageDate = message.createdAt ? new Date(message.createdAt) : new Date();

    if (!currentGroup || !isSameDay(currentGroup.date, messageDate)) {
      let label: string;
      if (isToday(messageDate)) {
        label = 'Today';
      } else if (isYesterday(messageDate)) {
        label = 'Yesterday';
      } else if (messageDate > subDays(new Date(), 7)) {
        label = format(messageDate, 'EEEE'); // Day name
      } else {
        label = format(messageDate, 'MMMM d, yyyy');
      }

      currentGroup = {
        date: messageDate,
        label,
        messages: [],
      };
      groups.push(currentGroup);
    }

    currentGroup.messages.push(message);
  });

  return groups;
}

export function MessageList({
  messages,
  isAgentTyping = false,
  className,
  emptyState,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAgentTyping]);

  const groupedMessages = groupMessagesByDate(messages);
  const hasMessages = messages.length > 0;

  if (!hasMessages && emptyState) {
    return (
      <div className={cn('flex-1 flex items-center justify-center', className)}>
        {emptyState}
      </div>
    );
  }

  return (
    <ScrollArea className={cn('flex-1', className)} ref={scrollRef}>
      <div className="min-h-full">
        {!hasMessages ? (
          <div className="flex items-center justify-center h-full min-h-[300px] text-zinc-500 dark:text-zinc-400">
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {groupedMessages.map((group, groupIndex) => (
              <div key={groupIndex}>
                {/* Date Header */}
                {groupedMessages.length > 1 && (
                  <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2 px-4 border-b border-zinc-100 dark:border-zinc-800/50">
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      {group.label}
                    </span>
                  </div>
                )}

                {/* Messages in group */}
                {group.messages.map((message, messageIndex) => (
                  <MessageItem
                    key={message.id || messageIndex}
                    message={message}
                    showAvatar={true}
                    showTimestamp={true}
                  />
                ))}
              </div>
            ))}

            {/* Typing Indicator */}
            {isAgentTyping && (
              <div className="p-4">
                <TypingIndicator />
              </div>
            )}
          </div>
        )}

        {/* Bottom anchor for scrolling */}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
