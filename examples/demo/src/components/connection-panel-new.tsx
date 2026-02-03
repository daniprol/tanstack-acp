import { useState } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { 
  Power, 
  PowerOff, 
  Loader2, 
  Wifi, 
  WifiOff, 
  AlertCircle,
  CheckCircle2,
  Terminal,
  ChevronDown
} from 'lucide-react';
import { AGENT_CONFIGS } from '@/types';
import type { AgentConfig, ConnectionStatus } from '@/types';

interface ConnectionPanelProps {
  selectedAgent: AgentConfig;
  customUrl: string;
  connectionStatus: ConnectionStatus;
  connectionError?: string;
  onAgentChange: (agent: AgentConfig) => void;
  onCustomUrlChange: (url: string) => void;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function ConnectionPanel({
  selectedAgent,
  customUrl,
  connectionStatus,
  connectionError,
  onAgentChange,
  onCustomUrlChange,
  onConnect,
  onDisconnect,
}: ConnectionPanelProps) {
  const [localCustomUrl, setLocalCustomUrl] = useState(customUrl);
  const [showCommand, setShowCommand] = useState(false);

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: CheckCircle2,
          label: 'Connected',
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          pulse: false,
        };
      case 'connecting':
        return {
          icon: Loader2,
          label: 'Connecting...',
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          pulse: true,
        };
      case 'error':
        return {
          icon: AlertCircle,
          label: 'Connection Failed',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          pulse: false,
        };
      default:
        return {
          icon: WifiOff,
          label: 'Disconnected',
          color: 'text-slate-500',
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-200',
          pulse: false,
        };
    }
  };

  const status = getStatusConfig();
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Terminal className="w-5 h-5 text-primary" />
          Agent Connection
        </h3>
        <p className="text-sm text-muted-foreground">
          Connect to an AI agent via WebSocket
        </p>
      </div>

      {/* Status Card */}
      <div className={cn(
        "relative overflow-hidden rounded-xl border-2 p-4 transition-all duration-300",
        status.bgColor,
        status.borderColor
      )}>
        {/* Animated background pulse for connecting state */}
        {status.pulse && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        )}
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-full bg-white/80 shadow-sm",
              status.color
            )}>
              <StatusIcon className={cn(
                "w-5 h-5",
                status.pulse && "animate-spin"
              )} />
            </div>
            <div>
              <p className={cn("font-semibold", status.color)}>
                {status.label}
              </p>
              {connectionError && (
                <p className="text-xs text-red-600 mt-0.5 max-w-[200px] truncate">
                  {connectionError}
                </p>
              )}
            </div>
          </div>
          
          <Badge 
            variant={connectionStatus === 'connected' ? 'default' : 'secondary'}
            className={cn(
              "font-mono text-xs",
              connectionStatus === 'connected' && "bg-emerald-600 hover:bg-emerald-700"
            )}
          >
            {selectedAgent.wsUrl}
          </Badge>
        </div>
      </div>

      {/* Agent Selector */}
      <div className="space-y-3">
        <label className="text-sm font-medium flex items-center gap-2">
          <Wifi className="w-4 h-4" />
          Select Agent
        </label>
        <Select
          value={selectedAgent.id}
          onValueChange={(value) => {
            const agent = AGENT_CONFIGS.find((a) => a.id === value)!;
            onAgentChange(agent);
          }}
          disabled={connectionStatus === 'connected' || connectionStatus === 'connecting'}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Choose an agent">
              <div className="flex items-center gap-2">
                <span className="font-medium">{selectedAgent.name}</span>
                <span className="text-muted-foreground">—</span>
                <span className="text-muted-foreground text-sm truncate">
                  {selectedAgent.description}
                </span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            <div className="p-2">
              <p className="text-xs font-semibold text-muted-foreground mb-2 px-2">
                Recommended
              </p>
              {AGENT_CONFIGS.slice(0, 4).map((agent) => (
                <SelectItem 
                  key={agent.id} 
                  value={agent.id}
                  className="py-3"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{agent.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {agent.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </div>
            <Separator />
            <div className="p-2">
              <p className="text-xs font-semibold text-muted-foreground mb-2 px-2">
                Custom
              </p>
              <SelectItem value="custom" className="py-3">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">Custom Agent</span>
                  <span className="text-xs text-muted-foreground">
                    Connect to your own ACP-compatible agent
                  </span>
                </div>
              </SelectItem>
            </div>
          </SelectContent>
        </Select>
      </div>

      {/* Custom URL Input */}
      {selectedAgent.id === 'custom' && (
        <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
          <label className="text-sm font-medium">WebSocket URL</label>
          <Input
            type="text"
            value={localCustomUrl}
            onChange={(e) => {
              setLocalCustomUrl(e.target.value);
              onCustomUrlChange(e.target.value);
            }}
            placeholder="ws://localhost:8000"
            disabled={connectionStatus === 'connected' || connectionStatus === 'connecting'}
            className="font-mono"
          />
        </div>
      )}

      {/* Connect/Disconnect Button */}
      <div className="space-y-3">
        {connectionStatus === 'connected' ? (
          <Button
            onClick={onDisconnect}
            variant="outline"
            className="w-full h-12 border-2 border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600 transition-all duration-200"
          >
            <PowerOff className="w-5 h-5 mr-2" />
            Disconnect
          </Button>
        ) : (
          <Button
            onClick={onConnect}
            disabled={connectionStatus === 'connecting'}
            className={cn(
              "w-full h-12 text-base font-semibold transition-all duration-200",
              connectionStatus === 'connecting' 
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-gradient-to-r from-primary to-primary/90 hover:opacity-90"
            )}
          >
            {connectionStatus === 'connecting' ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Power className="w-5 h-5 mr-2" />
                Connect to Agent
              </>
            )}
          </Button>
        )}

        {/* Retry button for error state */}
        {connectionStatus === 'error' && (
          <Button
            onClick={onConnect}
            variant="ghost"
            className="w-full text-amber-600 hover:text-amber-700 hover:bg-amber-50"
          >
            <Loader2 className="w-4 h-4 mr-2" />
            Retry Connection
          </Button>
        )}
      </div>

      <Separator />

      {/* Command Reference */}
      <div className="space-y-2">
        <button
          onClick={() => setShowCommand(!showCommand)}
          className="flex items-center justify-between w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="font-medium">Command Reference</span>
          <ChevronDown className={cn(
            "w-4 h-4 transition-transform",
            showCommand && "rotate-180"
          )} />
        </button>
        
        {showCommand && (
          <div className="animate-in slide-in-from-top-2 duration-200">
            <code className="text-xs bg-muted p-3 rounded-lg block break-all font-mono">
              {selectedAgent.command}
            </code>
            <p className="text-xs text-muted-foreground mt-2">
              Run this command in a terminal to start the agent
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
