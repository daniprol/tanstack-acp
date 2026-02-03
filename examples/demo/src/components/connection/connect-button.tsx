import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ConnectionStatus } from '@/types';
import { Loader2, Plug, Unplug } from 'lucide-react';

interface ConnectButtonProps {
  status: ConnectionStatus;
  onConnect: () => void;
  onDisconnect: () => void;
  className?: string;
}

export function ConnectButton({
  status,
  onConnect,
  onDisconnect,
  className,
}: ConnectButtonProps) {
  const isConnecting = status === 'connecting';
  const isConnected = status === 'connected';

  if (isConnected) {
    return (
      <Button
        variant="outline"
        size="lg"
        className={cn(
          'w-full border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-900/50',
          className
        )}
        onClick={onDisconnect}
      >
        <Unplug className="mr-2 h-5 w-5" />
        Disconnect
      </Button>
    );
  }

  if (isConnecting) {
    return (
      <Button
        variant="default"
        size="lg"
        className={cn('w-full', className)}
        disabled
      >
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Connecting...
      </Button>
    );
  }

  return (
    <Button
      variant="default"
      size="lg"
      className={cn(
        'w-full bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700',
        className
      )}
      onClick={onConnect}
    >
      <Plug className="mr-2 h-5 w-5" />
      Connect to Agent
    </Button>
  );
}
