import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  Wifi, 
  WifiOff,
  Clock,
  Menu
} from 'lucide-react';

interface AppHeaderProps {
  isConnected: boolean;
  agentName: string;
  activeSessionId: string | null;
  activeSessionTitle?: string;
  onMenuClick: () => void;
}

export function AppHeader({
  isConnected,
  agentName,
  activeSessionId,
  activeSessionTitle,
  onMenuClick,
}: AppHeaderProps) {
  return (
    <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="md:hidden h-8 w-8"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-brand/70 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-brand-foreground" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-sm leading-tight">
              TanStack <span className="text-brand">ACP</span>
            </h1>
          </div>
        </div>

        <Separator orientation="vertical" className="h-6 hidden sm:block" />

        {/* Agent Info */}
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isConnected ? "bg-success animate-pulse" : "bg-muted-foreground"
          )} />
          <span className="font-medium text-sm hidden sm:inline">{agentName}</span>
          
          {activeSessionId && (
            <>
              <span className="text-muted-foreground hidden md:inline">•</span>
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span className="font-mono text-xs">{activeSessionId.slice(0, 8)}...</span>
                {activeSessionTitle && (
                  <>
                    <span className="text-muted-foreground/50">•</span>
                    <span className="truncate max-w-[150px] text-xs">{activeSessionTitle}</span>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Connection Status */}
      <div className="flex items-center gap-2">
        {isConnected ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
            <Wifi className="w-3 h-3 text-success" />
            <span className="text-xs font-medium text-success hidden sm:inline">Connected</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border">
            <WifiOff className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground hidden sm:inline">Disconnected</span>
          </div>
        )}
      </div>
    </header>
  );
}
