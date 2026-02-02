import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';

interface MessageAvatarProps {
  role: 'user' | 'assistant' | 'system';
}

export function MessageAvatar({ role }: MessageAvatarProps) {
  const isUser = role === 'user';
  
  return (
    <div
      className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
        isUser
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground'
      )}
    >
      {isUser ? (
        <User className="w-4 h-4" />
      ) : (
        <Bot className="w-4 h-4" />
      )}
    </div>
  );
}
