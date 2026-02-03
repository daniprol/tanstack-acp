import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { User, Bot, Copy, Check, Wrench, Brain } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

// Simplified message interface based on @tanstack/ai UIMessage
interface MessagePart {
  type: string;
  text?: string;
  reasoning?: string;
  toolCallId?: string;
  toolName?: string;
  args?: Record<string, unknown>;
  result?: unknown;
}

interface UIMessageLike {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  parts?: MessagePart[];
  content?: string | MessagePart[];
  createdAt?: Date | string;
  toolInvocations?: Array<{
    toolCallId: string;
    toolName: string;
    args: Record<string, unknown>;
    result?: unknown;
  }>;
}

interface MessageItemProps {
  message: UIMessageLike;
  showAvatar?: boolean;
  showTimestamp?: boolean;
}

export function MessageItem({
  message,
  showAvatar = true,
  showTimestamp = true,
}: MessageItemProps) {
  const [copied, setCopied] = useState(false);

  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const isSystem = message.role === 'system';

  const handleCopy = async () => {
    const text = getMessageContent(message);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getMessageContent = (msg: UIMessageLike): string => {
    // Handle content property
    if (msg.content) {
      if (typeof msg.content === 'string') return msg.content;
      if (Array.isArray(msg.content)) {
        return msg.content
          .map((part: MessagePart) => {
            if (part.type === 'text' && part.text) return part.text;
            if (part.type === 'reasoning' && part.reasoning) return part.reasoning;
            return '';
          })
          .join('');
      }
    }
    
    // Handle parts property
    if (msg.parts && Array.isArray(msg.parts)) {
      return msg.parts
        .map((part: MessagePart) => {
          if (part.type === 'text' && part.text) return part.text;
          if (part.type === 'reasoning' && part.reasoning) return part.reasoning;
          return '';
        })
        .join('');
    }
    
    return '';
  };

  const getAvatarIcon = () => {
    if (isUser) return <User className="w-4 h-4" />;
    if (isSystem) return <Wrench className="w-4 h-4" />;
    return <Bot className="w-4 h-4" />;
  };

  const content = getMessageContent(message);
  const hasContent = content.trim().length > 0;

  // Extract reasoning if present
  const getReasoningContent = (): string | null => {
    const parts = message.parts || (Array.isArray(message.content) ? message.content : []);
    if (!Array.isArray(parts)) return null;
    
    const reasoningParts = parts.filter((part: MessagePart) => part.type === 'reasoning');
    if (reasoningParts.length === 0) return null;
    
    return reasoningParts
      .map((part: MessagePart) => part.reasoning || '')
      .join('');
  };

  const reasoningContent = getReasoningContent();
  const hasReasoning = !!reasoningContent && reasoningContent.length > 0;

  // Get tool invocations
  const toolInvocations = message.toolInvocations || [];
  const hasToolInvocations = toolInvocations.length > 0;

  return (
    <div
      className={cn(
        'group flex gap-3 p-4 transition-colors',
        isUser && 'bg-zinc-50/50 dark:bg-zinc-900/50',
        (isAssistant || isSystem) && 'bg-white dark:bg-zinc-950'
      )}
    >
      {/* Avatar */}
      {showAvatar && (
        <div
          className={cn(
            'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium',
            isUser && 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
            isAssistant && 'bg-brand text-brand-foreground',
            isSystem && 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
          )}
        >
          {getAvatarIcon()}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm">
            {isUser ? 'You' : isSystem ? 'System' : 'Assistant'}
          </span>
          {showTimestamp && message.createdAt && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {format(new Date(message.createdAt), 'HH:mm')}
            </span>
          )}
        </div>

        {/* Message Content */}
        {hasContent && (
          <div className="relative">
            <div
              className={cn(
                'text-sm leading-relaxed whitespace-pre-wrap',
                isUser && 'text-zinc-900 dark:text-zinc-100',
                (isAssistant || isSystem) && 'text-zinc-800 dark:text-zinc-200'
              )}
            >
              {content}
            </div>

            {/* Copy Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity',
                      'bg-white dark:bg-zinc-900 shadow-sm border'
                    )}
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>{copied ? 'Copied!' : 'Copy message'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        {/* Reasoning Content */}
        {hasReasoning && (
          <div className="mt-2 p-3 rounded-md bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center gap-1.5 mb-1.5 text-zinc-500 dark:text-zinc-400">
              <Brain className="w-3.5 h-3.5" />
              <span className="text-xs font-medium uppercase tracking-wide">
                Reasoning
              </span>
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400 italic leading-relaxed">
              {reasoningContent}
            </div>
          </div>
        )}

        {/* Tool Calls */}
        {hasToolInvocations && (
          <div className="mt-2 space-y-2">
            {toolInvocations.map((tool, index) => (
              <div
                key={tool.toolCallId || index}
                className="p-2.5 rounded-md bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-xs"
              >
                <div className="flex items-center gap-1.5 mb-1.5 text-zinc-500 dark:text-zinc-400">
                  <Wrench className="w-3.5 h-3.5" />
                  <span className="font-mono font-medium">{tool.toolName}</span>
                </div>
                <pre className="text-zinc-600 dark:text-zinc-400 overflow-x-auto">
                  {JSON.stringify(tool.args, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
