import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { AGENT_CONFIGS } from '@/types';
import { Sparkles } from 'lucide-react';

interface AgentSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

const recommendedAgents = ['opencode', 'claude', 'gemini', 'codex'];

export function AgentSelector({
  value,
  onChange,
  disabled,
  className,
}: AgentSelectorProps) {
  const recommended = AGENT_CONFIGS.filter((agent) =>
    recommendedAgents.includes(agent.id)
  );
  const custom = AGENT_CONFIGS.filter(
    (agent) => !recommendedAgents.includes(agent.id)
  );

  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
        Select Agent
      </label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choose an agent to connect" />
        </SelectTrigger>
        <SelectContent>
          <div className="px-2 py-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Recommended
          </div>
          {recommended.map((agent) => (
            <SelectItem key={agent.id} value={agent.id}>
              <div className="flex items-center gap-2">
                {agent.id === 'opencode' && (
                  <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                )}
                <div className="flex flex-col">
                  <span className="font-medium">{agent.name}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {agent.description}
                  </span>
                </div>
              </div>
            </SelectItem>
          ))}
          
          {custom.length > 0 && (
            <>
              <div className="my-1 h-px bg-zinc-100 dark:bg-zinc-800" />
              <div className="px-2 py-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Custom
              </div>
              {custom.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{agent.name}</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {agent.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
