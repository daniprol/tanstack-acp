import { MessageAvatar } from './message-avatar';
import { MessageActions } from './message-actions';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Code2, Lightbulb, Wrench, FileCode } from 'lucide-react';
import type { Message } from '@tanstack/ai-react';

interface ChatMessageListProps {
  messages: Message[];
}

export function ChatMessageList({ messages }: ChatMessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Lightbulb className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <p className="text-lg font-medium text-muted-foreground">
              Start a conversation
            </p>
            <p className="text-sm text-muted-foreground">
              Send a message to begin chatting with the agent
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="divide-y">
        {messages.map((message, index) => (
          <ChatMessageItem
            key={message.id}
            message={message}
            isLast={index === messages.length - 1}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

interface ChatMessageItemProps {
  message: Message;
  isLast: boolean;
}

function ChatMessageItem({ message, isLast }: ChatMessageItemProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn('py-6', isUser ? 'bg-muted/30' : 'bg-background')}>
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex gap-4">
          <MessageAvatar role={message.role} />
          
          <div className="flex-1 min-w-0 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {isUser ? 'You' : 'Assistant'}
              </span>
              <MessageActions content={message.content} />
            </div>
            
            {/* Message Parts */}
            <div className="space-y-3">
              {message.parts?.map((part, i) => {
                switch (part.type) {
                  case 'text':
                    return (
                      <div key={i} className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap text-foreground">
                          {part.text}
                        </p>
                      </div>
                    );
                    
                  case 'reasoning':
                    return (
                      <div key={i} className="rounded-lg border bg-muted/50 p-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Lightbulb className="w-4 h-4" />
                          <span className="font-medium">Thinking</span>
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {part.reasoning}
                        </p>
                      </div>
                    );
                    
                  case 'tool-call':
                    return (
                      <div key={i} className="rounded-lg border bg-card p-3">
                        <div className="flex items-center gap-2 text-sm font-medium mb-2">
                          <Wrench className="w-4 h-4 text-primary" />
                          <span>Tool: {part.toolCall?.toolName}</span>
                        </div>
                        {part.toolCall?.args && (
                          <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                            {part.toolCall.args}
                          </pre>
                        )}
                      </div>
                    );
                    
                  case 'tool-result':
                    return (
                      <div key={i} className="border-l-2 border-green-500 pl-3 ml-2">
                        <div className="text-xs text-muted-foreground mb-1">
                          Result:
                        </div>
                        <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                          {JSON.stringify(part.toolResult?.result, null, 2)}
                        </pre>
                      </div>
                    );
                  
                  case 'file':
                    return (
                      <div key={i} className="rounded-lg border bg-muted/50 p-3">
                        <div className="flex items-center gap-2 text-sm font-medium mb-2">
                          <FileCode className="w-4 h-4" />
                          <span>{part.file?.name || 'File'}</span>
                        </div>
                      </div>
                    );
                    
                  default:
                    return null;
                }
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
