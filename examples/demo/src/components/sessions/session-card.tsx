import * as React from "react"
import { formatDistanceToNow, format } from "date-fns"
import { MoreHorizontal, Copy, GitBranch, Trash2, MessageSquare } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import type { SessionCardProps } from "./types"

export function SessionCard({
  session,
  isActive,
  onLoad,
  onFork,
  onDuplicate,
  onDelete,
  isLoading,
}: SessionCardProps) {
  const handleClick = (_e: React.MouseEvent) => {
    if (isLoading) return
    onLoad(session.id)
  }

  const handleFork = (e: React.MouseEvent) => {
    e.stopPropagation()
    onFork(session.id)
  }

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDuplicate(session.id)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(session.id)
  }

  const formattedDate = React.useMemo(() => {
    const now = new Date()
    const sessionDate = new Date(session.updatedAt)
    const diffInDays = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) {
      return formatDistanceToNow(sessionDate, { addSuffix: true })
    } else if (diffInDays === 1) {
      return "Yesterday"
    } else if (diffInDays < 7) {
      return formatDistanceToNow(sessionDate, { addSuffix: true })
    } else {
      return format(sessionDate, "MMM d, yyyy")
    }
  }, [session.updatedAt])

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg border p-3 transition-all duration-200 cursor-pointer",
        "hover:border-blue-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
        isActive
          ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
          : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950",
        isLoading && "pointer-events-none opacity-50"
      )}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
      )}

      {/* Content */}
      <div className="flex-1 min-w-0 pl-1">
        <div className="flex items-center gap-2">
          <h4
            className={cn(
              "font-medium text-sm truncate",
              isActive
                ? "text-blue-900 dark:text-blue-100"
                : "text-zinc-900 dark:text-zinc-100"
            )}
          >
            {session.title || "Untitled Conversation"}
          </h4>
          {isActive && (
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          )}
        </div>
        
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {formattedDate}
          </span>
          {session.messageCount > 0 && (
            <>
              <span className="text-zinc-300 dark:text-zinc-600">·</span>
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                <MessageSquare className="w-3 h-3 mr-1" />
                {session.messageCount}
              </Badge>
            </>
          )}
        </div>
        
        {session.lastMessagePreview && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 truncate">
            {session.lastMessagePreview}
          </p>
        )}
      </div>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity",
              "focus:opacity-100 focus-visible:ring-2 focus-visible:ring-blue-500"
            )}
            onClick={(_e) => _e.stopPropagation()}
            type="button"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleFork}>
            <GitBranch className="mr-2 h-4 w-4" />
            Fork
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-red-600 focus:text-red-600 focus:bg-red-50"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
