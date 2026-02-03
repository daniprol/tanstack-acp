import { cn } from '@/lib/utils';

export function AgentTypingIndicator() {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <div className="flex gap-1">
        <span 
          className={cn(
            "w-2 h-2 rounded-full bg-primary",
            "animate-bounce"
          )} 
          style={{ animationDelay: '0ms', animationDuration: '600ms' }}
        />
        <span 
          className={cn(
            "w-2 h-2 rounded-full bg-primary",
            "animate-bounce"
          )} 
          style={{ animationDelay: '150ms', animationDuration: '600ms' }}
        />
        <span 
          className={cn(
            "w-2 h-2 rounded-full bg-primary",
            "animate-bounce"
          )} 
          style={{ animationDelay: '300ms', animationDuration: '600ms' }}
        />
      </div>
      <span className="text-sm font-medium">Agent is thinking...</span>
    </div>
  );
}
