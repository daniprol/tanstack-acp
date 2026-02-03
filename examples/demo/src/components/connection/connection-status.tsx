import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ConnectionStatus } from '@/types';
import { AlertCircle, CheckCircle2, Loader2, WifiOff } from 'lucide-react';

interface ConnectionStatusProps {
  status: ConnectionStatus;
  error?: string;
  className?: string;
}

const statusConfig = {
  disconnected: {
    icon: WifiOff,
    label: 'Disconnected',
    description: 'Ready to connect to an agent',
    colors: {
      bg: 'bg-zinc-100 dark:bg-zinc-800',
      border: 'border-zinc-200 dark:border-zinc-700',
      icon: 'text-zinc-500 dark:text-zinc-400',
      text: 'text-zinc-900 dark:text-zinc-100',
      description: 'text-zinc-500 dark:text-zinc-400',
    },
  },
  connecting: {
    icon: Loader2,
    label: 'Connecting',
    description: 'Establishing connection...',
    colors: {
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-800',
      icon: 'text-amber-600 dark:text-amber-400',
      text: 'text-amber-900 dark:text-amber-100',
      description: 'text-amber-700 dark:text-amber-300',
    },
  },
  connected: {
    icon: CheckCircle2,
    label: 'Connected',
    description: 'Active session with agent',
    colors: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      border: 'border-emerald-200 dark:border-emerald-800',
      icon: 'text-emerald-600 dark:text-emerald-400',
      text: 'text-emerald-900 dark:text-emerald-100',
      description: 'text-emerald-700 dark:text-emerald-300',
    },
  },
  error: {
    icon: AlertCircle,
    label: 'Connection Error',
    description: 'Failed to connect to agent',
    colors: {
      bg: 'bg-red-50 dark:bg-red-950/30',
      border: 'border-red-200 dark:border-red-800',
      icon: 'text-red-600 dark:text-red-400',
      text: 'text-red-900 dark:text-red-100',
      description: 'text-red-700 dark:text-red-300',
    },
  },
};

export function ConnectionStatusCard({
  status,
  error,
  className,
}: ConnectionStatusProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Card
      className={cn(
        'transition-all duration-300 ease-in-out',
        config.colors.bg,
        config.colors.border,
        className
      )}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-all duration-300',
            status === 'connecting' && 'animate-pulse',
            config.colors.bg
          )}
        >
          <Icon
            className={cn(
              'h-6 w-6 transition-all duration-300',
              status === 'connecting' && 'animate-spin',
              config.colors.icon
            )}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'font-semibold transition-colors duration-300',
              config.colors.text
            )}
          >
            {config.label}
          </p>
          <p
            className={cn(
              'text-sm transition-colors duration-300 truncate',
              config.colors.description
            )}
          >
            {status === 'error' && error ? error : config.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
