import { useState, useMemo } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Plus,
  Loader2,
  GitBranch,
  Copy,
  Trash2,
  RefreshCw,
  Search,
  MessageSquare,
  Settings,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Command
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { SessionMetadata } from 'tanstack-acp';
import type { SessionMode, AvailableCommand } from '@agentclientprotocol/sdk';

interface SessionExplorerProps {
  sessions: SessionMetadata[];
  activeSessionId: string | null;
  availableModes: SessionMode[];
  currentModeId: string | null;
  availableCommands: AvailableCommand[];
  isLoading: boolean;
  onCreateSession: () => void;
  onLoadSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onForkSession: (sessionId: string) => void;
  onDuplicateSession: (sessionId: string) => void;
  onSetMode: (modeId: string) => void;
  onCommandSelect: (command: string) => void;
  onRefresh: () => void;
}

interface GroupedSessions {
  today: SessionMetadata[];
  yesterday: SessionMetadata[];
  last7Days: SessionMetadata[];
  older: SessionMetadata[];
}

function groupSessionsByDate(sessions: SessionMetadata[]): GroupedSessions {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const last7Days = new Date(today);
  last7Days.setDate(last7Days.getDate() - 7);

  return sessions.reduce(
    (acc, session) => {
      const sessionDate = new Date(session.createdAt);
      
      if (sessionDate >= today) {
        acc.today.push(session);
      } else if (sessionDate >= yesterday) {
        acc.yesterday.push(session);
      } else if (sessionDate >= last7Days) {
        acc.last7Days.push(session);
      } else {
        acc.older.push(session);
      }
      
      return acc;
    },
    { today: [], yesterday: [], last7Days: [], older: [] } as GroupedSessions
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function SessionExplorer({
  sessions,
  activeSessionId,
  availableModes,
  currentModeId,
  availableCommands,
  isLoading,
  onCreateSession,
  onLoadSession,
  onDeleteSession,
  onForkSession,
  onDuplicateSession,
  onSetMode,
  onCommandSelect,
  onRefresh,
}: SessionExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({
    today: true,
    yesterday: true,
    last7Days: true,
    older: false,
  });

  const groupedSessions = useMemo(() => {
    const filtered = sessions.filter(
      (s) =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.lastMessagePreview?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return groupSessionsByDate(filtered);
  }, [sessions, searchQuery]);

  const toggleGroup = (group: keyof GroupedSessions) => {
    setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const SessionGroup = ({
    title,
    sessions,
    groupKey,
  }: {
    title: string;
    sessions: SessionMetadata[];
    groupKey: keyof GroupedSessions;
  }) => {
    if (sessions.length === 0) return null;

    const isExpanded = expandedGroups[groupKey];

    return (
      <Collapsible open={isExpanded} onOpenChange={() => toggleGroup(groupKey)}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-2 hover:bg-muted/50 rounded-lg transition-colors">
          <span className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            {title}
            <Badge variant="secondary" className="text-xs">
              {sessions.length}
            </Badge>
          </span>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1 mt-1">
          {sessions.map((session) => (
            <SessionItem
              key={session.id}
              session={session}
              isActive={session.id === activeSessionId}
              onLoad={() => onLoadSession(session.id)}
              onDelete={() => onDeleteSession(session.id)}
              onFork={() => onForkSession(session.id)}
              onDuplicate={() => onDuplicateSession(session.id)}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <div className="space-y-4">
      <Separator />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Conversations
          <Badge variant="secondary" className="text-xs">
            {sessions.length}
          </Badge>
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={isLoading}
          className="h-8 w-8"
        >
          <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-10"
        />
      </div>

      {/* New Session Button */}
      <Button
        onClick={onCreateSession}
        disabled={isLoading}
        className="w-full h-11 bg-gradient-to-r from-primary to-primary/90 hover:opacity-90 transition-all"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Plus className="w-4 h-4 mr-2" />
        )}
        New Conversation
      </Button>

      {/* Slash Commands */}
      {availableCommands.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
            <Command className="w-3 h-3" />
            Quick Commands
          </label>
          <Select onValueChange={onCommandSelect}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Insert command..." />
            </SelectTrigger>
            <SelectContent>
              {availableCommands.map((cmd) => (
                <SelectItem key={cmd.name} value={cmd.name} className="text-sm">
                  <span className="font-medium">/{cmd.name}</span>
                  <span className="text-muted-foreground ml-2">
                    — {cmd.description}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Session Mode */}
      {availableModes.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
            <Settings className="w-3 h-3" />
            Session Mode
          </label>
          <Select value={currentModeId || ''} onValueChange={onSetMode}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Select mode..." />
            </SelectTrigger>
            <SelectContent>
              {availableModes.map((mode) => (
                <SelectItem key={mode.id} value={mode.id} className="text-sm">
                  <div className="flex flex-col">
                    <span className="font-medium">{mode.name}</span>
                    {mode.description && (
                      <span className="text-xs text-muted-foreground">
                        {mode.description}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Separator />

      {/* Session Groups */}
      <ScrollArea className="h-[calc(100vh-500px)]">
        <div className="space-y-2 pr-3">
          <SessionGroup
            title="Today"
            sessions={groupedSessions.today}
            groupKey="today"
          />
          <SessionGroup
            title="Yesterday"
            sessions={groupedSessions.yesterday}
            groupKey="yesterday"
          />
          <SessionGroup
            title="Last 7 Days"
            sessions={groupedSessions.last7Days}
            groupKey="last7Days"
          />
          <SessionGroup
            title="Older"
            sessions={groupedSessions.older}
            groupKey="older"
          />

          {sessions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Create your first one!</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function SessionItem({
  session,
  isActive,
  onLoad,
  onDelete,
  onFork,
  onDuplicate,
}: {
  session: SessionMetadata;
  isActive: boolean;
  onLoad: () => void;
  onDelete: () => void;
  onFork: () => void;
  onDuplicate: () => void;
}) {
  return (
    <div
      className={cn(
        'group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200',
        isActive
          ? 'bg-primary/10 border border-primary/30 shadow-sm'
          : 'hover:bg-muted/60 border border-transparent'
      )}
    >
      <div className="flex-1 min-w-0" onClick={onLoad}>
        <div className="flex items-center gap-2">
          <p
            className={cn(
              'font-medium truncate',
              isActive ? 'text-primary' : 'text-foreground'
            )}
          >
            {session.title}
          </p>
          {isActive && (
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          )}
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <span className="font-mono">{session.id.slice(0, 8)}...</span>
          <span>•</span>
          <span>{formatDate(session.createdAt)}</span>
          {session.messageCount > 0 && (
            <>
              <span>•</span>
              <Badge variant="outline" className="text-xs h-4 px-1">
                {session.messageCount}
              </Badge>
            </>
          )}
        </div>
        {session.lastMessagePreview && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {session.lastMessagePreview}
          </p>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onFork}>
            <GitBranch className="w-4 h-4 mr-2" />
            Fork
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDuplicate}>
            <Copy className="w-4 h-4 mr-2" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onDelete} className="text-red-600">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
