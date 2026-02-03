import { Terminal, ChevronDown } from "lucide-react"

// import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SessionList } from "./session-list"
import type { SessionsPanelProps } from "./types"

export function SessionsPanel({
  sessions,
  activeSessionId,
  onLoadSession,
  onDeleteSession,
  onForkSession,
  onDuplicateSession,
  onCreateSession,
  availableCommands,
  availableModes,
  currentModeId,
  onSetMode,
  onExecuteCommand,
  isConnected,
  isLoading,
}: SessionsPanelProps) {
  if (!isConnected) {
    return null
  }

  const handleModeChange = (modeId: string) => {
    onSetMode?.(modeId)
  }

  return (
    <div className="flex flex-col h-full w-full bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800">
      {/* Quick Actions Bar */}
      {(availableCommands?.length || availableModes?.length) ? (
        <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
          {availableModes && availableModes.length > 0 && onSetMode && (
            <Select
              value={currentModeId || undefined}
              onValueChange={handleModeChange}
            >
              <SelectTrigger className="flex-1 h-8 text-xs">
                <SelectValue placeholder="Select mode..." />
              </SelectTrigger>
              <SelectContent>
                {availableModes.map((mode) => (
                  <SelectItem key={mode.id} value={mode.id}>
                    {mode.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {availableCommands && availableCommands.length > 0 && onExecuteCommand && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 text-xs"
                >
                  <Terminal className="h-3 w-3" />
                  <span className="hidden sm:inline">Commands</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Quick Commands</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {availableCommands.map((command) => (
                  <DropdownMenuItem
                    key={command.name}
                    onClick={() => onExecuteCommand(command.name)}
                    className="flex flex-col items-start gap-1"
                  >
                    <span className="font-medium">{command.name}</span>
                    {command.description && (
                      <span className="text-xs text-zinc-500">
                        {command.description}
                      </span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      ) : null}

      {/* Session List */}
      <SessionList
        sessions={sessions}
        activeSessionId={activeSessionId}
        onLoadSession={onLoadSession}
        onDeleteSession={onDeleteSession}
        onForkSession={onForkSession}
        onDuplicateSession={onDuplicateSession}
        onCreateSession={onCreateSession}
        isLoading={isLoading}
      />
    </div>
  )
}
