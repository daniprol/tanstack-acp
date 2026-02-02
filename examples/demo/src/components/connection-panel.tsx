import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AGENT_CONFIGS } from '@/types';
import type { AgentConfig, ConnectionState } from '@/types';
import {
  Power,
  PowerOff,
  Loader2,
  Plus,
  GitBranch,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Copy,
  Clock,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectionPanelProps {
  selectedAgent: AgentConfig;
  customUrl: string;
  connectionState: ConnectionState;
  isConnected: boolean;
  onAgentChange: (agent: AgentConfig) => void;
  onCustomUrlChange: (url: string) => void;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function ConnectionPanel({
  selectedAgent,
  customUrl,
  connectionState,
  isConnected,
  onAgentChange,
  onCustomUrlChange,
  onConnect,
  onDisconnect,
}: ConnectionPanelProps) {
  const [localCustomUrl, setLocalCustomUrl] = useState(customUrl);
  
  const getStatusColor = () => {
    switch (connectionState.status) {
      case 'connected':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'connecting':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const handleCustomUrlChange = (value: string) => {
    setLocalCustomUrl(value);
    onCustomUrlChange(value);
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Select Agent</label>
        <Select
          value={selectedAgent.id}
          onValueChange={(value) => {
            const agent = AGENT_CONFIGS.find((a) => a.id === value)!;
            onAgentChange(agent);
          }}
          disabled={isConnected}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an agent" />
          </SelectTrigger>
          <SelectContent>
            {AGENT_CONFIGS.map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>
                {agent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">{selectedAgent.description}</p>
      </div>

      {selectedAgent.id === 'custom' && (
        <div className="space-y-2">
          <label className="text-sm font-medium">WebSocket URL</label>
          <Input
            type="text"
            value={localCustomUrl}
            onChange={(e) => handleCustomUrlChange(e.target.value)}
            placeholder="ws://localhost:8000"
            disabled={isConnected}
          />
        </div>
      )}

      <div className={cn('p-3 rounded-md border', getStatusColor())}>
        <div className="flex items-center gap-2">
          {connectionState.status === 'connected' ? (
            <Power className="w-4 h-4" />
          ) : connectionState.status === 'connecting' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <PowerOff className="w-4 h-4" />
          )}
          <span className="font-medium capitalize">{connectionState.status}</span>
        </div>
        {connectionState.error && (
          <p className="text-xs mt-1">{connectionState.error}</p>
        )}
      </div>

      <Button
        onClick={isConnected ? onDisconnect : onConnect}
        disabled={connectionState.status === 'connecting'}
        variant={isConnected ? 'destructive' : 'default'}
        className="w-full"
      >
        {connectionState.status === 'connecting' && (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        )}
        {connectionState.status === 'connected' && 'Disconnect'}
        {connectionState.status === 'disconnected' && 'Connect'}
        {connectionState.status === 'error' && 'Retry Connection'}
        {connectionState.status === 'connecting' && 'Connecting...'}
      </Button>

      <Separator />

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground font-medium">Command Reference:</p>
        <code className="text-xs bg-muted p-2 rounded block break-all">
          {selectedAgent.command}
        </code>
      </div>
    </div>
  );
}
