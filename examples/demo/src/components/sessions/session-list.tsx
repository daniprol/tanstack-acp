import * as React from "react"
import { Plus, RefreshCw, MessageSquare } from "lucide-react"
import { isToday, isYesterday, subDays } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SessionSearch } from "./session-search"
import { SessionGroup } from "./session-group"
import type { SessionListProps } from "./types"
import type { SessionMetadata } from "tanstack-acp"

export function SessionList({
  sessions,
  activeSessionId,
  onLoadSession,
  onDeleteSession,
  onForkSession,
  onDuplicateSession,
  onCreateSession,
  onRefreshSessions,
  isLoading,
}: SessionListProps) {
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredSessions = React.useMemo(() => {
    if (!searchQuery.trim()) return sessions

    const query = searchQuery.toLowerCase()
    return sessions.filter(
      (session) =>
        session.title?.toLowerCase().includes(query) ||
        session.lastMessagePreview?.toLowerCase().includes(query)
    )
  }, [sessions, searchQuery])

  const groupedSessions = React.useMemo(() => {
    const groups = {
      today: [] as SessionMetadata[],
      yesterday: [] as SessionMetadata[],
      last7Days: [] as SessionMetadata[],
      older: [] as SessionMetadata[],
    }

    filteredSessions.forEach((session) => {
      const date = new Date(session.updatedAt)

      if (isToday(date)) {
        groups.today.push(session)
      } else if (isYesterday(date)) {
        groups.yesterday.push(session)
      } else if (date > subDays(new Date(), 7)) {
        groups.last7Days.push(session)
      } else {
        groups.older.push(session)
      }
    })

    // Sort each group by updatedAt (newest first)
    const sortByDate = (a: SessionMetadata, b: SessionMetadata) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()

    groups.today.sort(sortByDate)
    groups.yesterday.sort(sortByDate)
    groups.last7Days.sort(sortByDate)
    groups.older.sort(sortByDate)

    return groups
  }, [filteredSessions])

  const totalSessions = filteredSessions.length
  const hasSessions = sessions.length > 0

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-zinc-500" />
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Conversations
          </h2>
          {totalSessions > 0 && (
            <span className="text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 px-2 py-0.5 rounded-full">
              {totalSessions}
            </span>
          )}
        </div>
        {onRefreshSessions && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-500 hover:text-zinc-900"
            onClick={onRefreshSessions}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <SessionSearch
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      {/* New Conversation Button */}
      <div className="px-4 pb-3">
        <Button
          onClick={onCreateSession}
          className={cn(
            "w-full justify-center gap-2",
            "bg-blue-600 hover:bg-blue-700 text-white",
            "shadow-sm hover:shadow-md transition-all duration-200"
          )}
          disabled={isLoading}
        >
          <Plus className="h-4 w-4" />
          New Conversation
        </Button>
      </div>

      {/* Sessions List */}
      <ScrollArea className="flex-1 px-4">
        {hasSessions ? (
          <div className="pb-4 space-y-1">
            <SessionGroup
              title="Today"
              sessions={groupedSessions.today}
              activeSessionId={activeSessionId}
              onLoadSession={onLoadSession}
              onForkSession={onForkSession}
              onDuplicateSession={onDuplicateSession}
              onDeleteSession={onDeleteSession}
              defaultOpen={true}
              isLoading={isLoading}
            />
            <SessionGroup
              title="Yesterday"
              sessions={groupedSessions.yesterday}
              activeSessionId={activeSessionId}
              onLoadSession={onLoadSession}
              onForkSession={onForkSession}
              onDuplicateSession={onDuplicateSession}
              onDeleteSession={onDeleteSession}
              defaultOpen={true}
              isLoading={isLoading}
            />
            <SessionGroup
              title="Last 7 Days"
              sessions={groupedSessions.last7Days}
              activeSessionId={activeSessionId}
              onLoadSession={onLoadSession}
              onForkSession={onForkSession}
              onDuplicateSession={onDuplicateSession}
              onDeleteSession={onDeleteSession}
              defaultOpen={false}
              isLoading={isLoading}
            />
            <SessionGroup
              title="Older"
              sessions={groupedSessions.older}
              activeSessionId={activeSessionId}
              onLoadSession={onLoadSession}
              onForkSession={onForkSession}
              onDuplicateSession={onDuplicateSession}
              onDeleteSession={onDeleteSession}
              defaultOpen={false}
              isLoading={isLoading}
            />
          </div>
        ) : (
          <EmptyState
            hasSearchQuery={!!searchQuery}
            onCreateSession={onCreateSession}
          />
        )}
      </ScrollArea>
    </div>
  )
}

interface EmptyStateProps {
  hasSearchQuery: boolean
  onCreateSession: () => void
}

function EmptyState({ hasSearchQuery, onCreateSession }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
        <MessageSquare className="h-6 w-6 text-zinc-400" />
      </div>
      <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">
        {hasSearchQuery ? "No conversations found" : "No conversations yet"}
      </h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 max-w-[200px]">
        {hasSearchQuery
          ? "Try adjusting your search terms"
          : "Start a new conversation to get started"}
      </p>
      {!hasSearchQuery && (
        <Button
          variant="outline"
          size="sm"
          onClick={onCreateSession}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Start Conversation
        </Button>
      )}
    </div>
  )
}
