import { cn } from '@/lib/utils';
import { Bot } from 'lucide-react';

interface TypingIndicatorProps {
  className?: string;
  text?: string;
}

export function TypingIndicator({
  className,
  text = 'Agent is thinking...',
}: TypingIndicatorProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 text-zinc-500 dark:text-zinc-400',
        className
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand/10 dark:bg-brand/20 flex items-center justify-center">
        <Bot className="w-4 h-4 text-brand" />
      </div>

      {/* Content */}
      <div className="flex items-center gap-2">
        {/* Bouncing Dots */}
        <div className="flex items-center gap-1">
          <span
            className="w-2 h-2 rounded-full bg-brand animate-bounce"
            style={{ animationDelay: '0ms', animationDuration: '1.4s' }}
          />
          <span
            className="w-2 h-2 rounded-full bg-brand animate-bounce"
            style={{ animationDelay: '200ms', animationDuration: '1.4s' }}
          />
          <span
            className="w-2 h-2 rounded-full bg-brand animate-bounce"
            style={{ animationDelay: '400ms', animationDuration: '1.4s' }}
          />
        </div>

        {/* Text */}
        <span className="text-sm font-medium">{text}</span>
      </div>
    </div>
  );
}
