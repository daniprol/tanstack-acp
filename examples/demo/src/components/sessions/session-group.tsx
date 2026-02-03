import * as React from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

// import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { SessionCard } from "./session-card"
import type { SessionGroupProps } from "./types"

export function SessionGroup({
  title,
  sessions,
  activeSessionId,
  onLoadSession,
  onForkSession,
  onDuplicateSession,
  onDeleteSession,
  defaultOpen = true,
  isLoading,
}: SessionGroupProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  if (sessions.length === 0) {
    return null
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between py-2 px-3 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <span>{title}</span>
        </div>
        <Badge
          variant="secondary"
          className="text-xs bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
        >
          {sessions.length}
        </Badge>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="space-y-1 pt-1 pb-2">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              isActive={session.id === activeSessionId}
              onLoad={onLoadSession}
              onFork={onForkSession}
              onDuplicate={onDuplicateSession}
              onDelete={onDeleteSession}
              isLoading={isLoading}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
