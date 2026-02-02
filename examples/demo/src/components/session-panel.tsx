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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { AppSession } from '@/types';
import type { SessionMode, AvailableCommand } from '@agentclientprotocol/sdk';
import {
  Plus,
  Loader2,
  GitBranch,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface SessionPanelProps {
  sessions: AppSession[];
  activeSessionId: string | null;
  availableModes: SessionMode[];
  currentModeId: string | null;
  availableCommands: AvailableCommand[];
  isConnected: boolean;
  isCreatingSession: boolean;
  onCreateSession: () => void;
  onLoadSession: (sessionId: string) => void;
  onForkSession: (sessionId: string) => void;
  onSetMode: (modeId: string) => void;
  onCommandSelect: (command: string) => void;
}

export function SessionPanel({
  sessions,
  activeSessionId,
  availableModes,
  currentModeId,
  availableCommands,
  isConnected,
  isCreatingSession,
  onCreateSession,
  onLoadSession,
  onForkSession,
  onSetMode,
  onCommandSelect,
}: SessionPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  
  if (!isConnected) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Separator />
      
      {/* New Session */}
      <Button
        onClick={onCreateSession}
        disabled={isCreatingSession}
        variant="secondary"
        className="w-full"
      >
        {isCreatingSession ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Plus className="w-4 h-4 mr-2" />
        )}
        New Session
      </Button>

      {/* Slash Commands */}
      {availableCommands.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Slash Commands</label>
          <Select
            onValueChange={(value) => {
              if (value) {
                onCommandSelect(value);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Insert command..." />
            </SelectTrigger>
            <SelectContent>
              {availableCommands.map((cmd) => (
                <SelectItem key={cmd.name} value={cmd.name}>
                  /{cmd.name} - {cmd.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Session Mode */}
      {availableModes.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Session Mode</label>
          <Select
            value={currentModeId || ''}
            onValueChange={onSetMode}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select mode..." />
            </SelectTrigger>
            <SelectContent>
              {availableModes.map((mode) => (
                <SelectItem key={mode.id} value={mode.id}>
                  {mode.name}
                  {mode.description ? ` - ${mode.description}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Sessions List */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium hover:text-primary transition-colors">
          <span>Sessions ({sessions.length})</span>
          {isOpen ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 space-y-1">
          {sessions.map((session) => (
            <TooltipProvider key={session.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      'p-2 rounded-md cursor-pointer transition-colors group',
                      session.id === activeSessionId
                        ? 'bg-primary/10 border border-primary/30'
                        : 'bg-muted/50 hover:bg-muted border border-transparent'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => onLoadSession(session.id)}
                        className="flex-1 text-left min-w-0"
                      >
                        <div className="text-xs font-mono text-muted-foreground truncate">
                          {session.id.slice(0, 8)}...
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {session.createdAt.toLocaleString()}
                        </div>
                      </button>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onForkSession(session.id);
                            }}
                            className="p-1 hover:bg-background rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <GitBranch className="w-3 h-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Fork session</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to load session</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
