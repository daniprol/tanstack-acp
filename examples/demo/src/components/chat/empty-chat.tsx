import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MessageSquare, Zap, Plus } from 'lucide-react';

interface EmptyChatProps {
  title?: string;
  description?: string;
  icon?: 'message' | 'zap';
  showCta?: boolean;
  ctaText?: string;
  onCtaClick?: () => void;
  className?: string;
}

export function EmptyChat({
  title = 'Ready to chat',
  description = 'Start a new conversation to begin chatting with your AI assistant.',
  icon = 'zap',
  showCta = true,
  ctaText = 'New Chat',
  onCtaClick,
  className,
}: EmptyChatProps) {
  const Icon = icon === 'zap' ? Zap : MessageSquare;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8',
        className
      )}
    >
      {/* Icon Container */}
      <div className="relative mb-6">
        {/* Background glow */}
        <div className="absolute inset-0 bg-brand/20 dark:bg-brand/10 blur-xl rounded-full" />

        {/* Icon */}
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-brand to-brand/70 flex items-center justify-center shadow-lg shadow-brand/20">
          <Icon className="w-8 h-8 text-brand-foreground" />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
        {title}
      </h2>

      {/* Description */}
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {/* CTA Button */}
      {showCta && onCtaClick && (
        <Button
          onClick={onCtaClick}
          className="bg-brand text-brand-foreground hover:bg-brand/90 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          {ctaText}
        </Button>
      )}
    </div>
  );
}
