import { AgentSelector } from '@/components/connection/agent-selector';
import { ConnectButton } from '@/components/connection/connect-button';
import { ConnectionStatusCard } from '@/components/connection/connection-status';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { AGENT_CONFIGS, ConnectionStatus } from '@/types';
import { ChevronDown, Code, Terminal } from 'lucide-react';
import { useMemo, useState } from 'react';

interface ConnectionPanelProps {
  status: ConnectionStatus;
  selectedAgentId: string;
  error?: string;
  onAgentChange: (agentId: string) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  className?: string;
}

export function ConnectionPanel({
  status,
  selectedAgentId,
  error,
  onAgentChange,
  onConnect,
  onDisconnect,
  className,
}: ConnectionPanelProps) {
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  const selectedAgent = useMemo(
    () => AGENT_CONFIGS.find((agent) => agent.id === selectedAgentId),
    [selectedAgentId]
  );

  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';
  const isDisabled = isConnected || isConnecting;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Agent Connection
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Connect to an ACP agent to start collaborating
        </p>
      </div>

      <ConnectionStatusCard status={status} error={error} />

      <AgentSelector
        value={selectedAgentId}
        onChange={onAgentChange}
        disabled={isDisabled}
        className="pt-2"
      />

      <ConnectButton
        status={status}
        onConnect={onConnect}
        onDisconnect={onDisconnect}
        className="mt-4"
      />

      {selectedAgent && (
        <Collapsible
          open={isCommandOpen}
          onOpenChange={setIsCommandOpen}
          className="mt-4"
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              <span>Command Reference</span>
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform duration-200',
                isCommandOpen && 'rotate-180'
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
            <div className="mt-2 space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  <Code className="h-3.5 w-3.5" />
                  <span>WebSocket URL</span>
                </div>
                <code className="block rounded bg-white px-3 py-2 text-sm font-mono text-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
                  {selectedAgent.wsUrl}
                </code>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  <Terminal className="h-3.5 w-3.5" />
                  <span>Start Command</span>
                </div>
                <code className="block rounded bg-white px-3 py-2 text-sm font-mono text-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
                  {selectedAgent.command}
                </code>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Run this command in your terminal to start the agent before connecting.
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
