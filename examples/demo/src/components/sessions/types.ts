import type { SessionMetadata } from 'tanstack-acp'

// Local SDK types
interface AvailableCommand {
  name: string
  description?: string
}

interface SessionMode {
  id: string
  name: string
  description?: string | null
}

export interface SessionCardProps {
  session: SessionMetadata
  isActive: boolean
  onLoad: (id: string) => void
  onFork: (id: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  isLoading?: boolean
}

export interface SessionGroupProps {
  title: string
  sessions: SessionMetadata[]
  activeSessionId: string | null
  onLoadSession: (id: string) => void
  onForkSession: (id: string) => void
  onDuplicateSession: (id: string) => void
  onDeleteSession: (id: string) => void
  defaultOpen?: boolean
  isLoading?: boolean
}

export interface SessionSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export interface SessionListProps {
  sessions: SessionMetadata[]
  activeSessionId: string | null
  onLoadSession: (id: string) => void
  onDeleteSession: (id: string) => void
  onForkSession: (id: string) => void
  onDuplicateSession: (id: string) => void
  onCreateSession: () => void
  onRefreshSessions?: () => void
  isLoading?: boolean
}

export interface SessionsPanelProps {
  sessions: SessionMetadata[]
  activeSessionId: string | null
  onLoadSession: (id: string) => void
  onDeleteSession: (id: string) => void
  onForkSession: (id: string) => void
  onDuplicateSession: (id: string) => void
  onCreateSession: () => void
  onRefreshSessions?: () => void
  availableCommands?: AvailableCommand[]
  availableModes?: SessionMode[]
  currentModeId?: string | null
  onSetMode?: (modeId: string) => void
  onExecuteCommand?: (command: string) => void
  isConnected: boolean
  isLoading?: boolean
}
