# tanstack-acp

TanStack AI adapter for Agent Client Protocol (ACP). Connect your React apps to ACP-compatible AI agents over WebSocket.

## Overview

tanstack-acp bridges TanStack AI with the Agent Client Protocol (ACP), an open protocol for communicating with AI agents. The adapter lets you use TanStack AI's `useChat` hook while connecting to any ACP-compatible agent.

## Installation

```bash
npm install tanstack-acp @tanstack/ai @tanstack/ai-react
# or
pnpm add tanstack-acp @tanstack/ai @tanstack/ai-react
```

## Quick Start

```tsx
import { useAcpSession, createAcpAdapter } from 'tanstack-acp'
import { useChat } from '@tanstack/ai-react'

function App() {
  const { connection, activeSessionId, createSession } = useAcpSession({
    wsUrl: 'ws://localhost:3003',
    autoConnect: true,
  })

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    connection: createAcpAdapter({
      connection,
      sessionId: activeSessionId,
    }),
  })

  return (
    <div>
      <button onClick={() => createSession({ cwd: '/projects' })}>
        New Session
      </button>

      {messages.map(msg => <Message key={msg.id} message={msg} />)}

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          disabled={isLoading || !activeSessionId}
        />
      </form>
    </div>
  )
}
```

## API Reference

### useAcpSession

Manages the ACP connection and session lifecycle.

```tsx
const {
  connection,
  connectionState,
  isConnected,
  sessions,
  activeSessionId,
  activeSessionData,
  isLoading,
  createSession,
  loadSession,
  deleteSession,
  forkSession,
  duplicateSession,
  refreshSessions,
  availableModes,
  currentModeId,
  setSessionMode,
  connect,
  disconnect,
  reconnect,
  pendingPermission,
  resolvePermission,
  rejectPermission,
  persistence,
  appendMessage,
} = useAcpSession({
  wsUrl: string
  cwd?: string
  agentName?: string
  autoConnect?: boolean
  reconnectAttempts?: number
  reconnectDelay?: number
  persistence?: SessionPersistence
  onLifecycleEvent?: LifecycleCallback
})
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `wsUrl` | `string` | required | WebSocket URL to the ACP agent |
| `cwd` | `string` | `/tmp` | Default working directory for sessions |
| `agentName` | `string` | - | Display name for the agent |
| `autoConnect` | `boolean` | `true` | Auto-connect on mount |
| `reconnectAttempts` | `number` | `3` | Maximum reconnection attempts |
| `reconnectDelay` | `number` | `1000` | Delay between reconnections (ms) |
| `persistence` | `SessionPersistence` | `MemoryPersistence` | Custom persistence layer |
| `onLifecycleEvent` | `LifecycleCallback` | - | Event callbacks |

#### Return Values

**Connection:**
- `connection: AcpConnection | null` - The ACP connection instance
- `connectionState: ConnectionState` - Current connection status
- `isConnected: boolean` - Whether connected
- `connect() => Promise<void>` - Establish connection
- `disconnect() => void` - Close connection
- `reconnect() => Promise<void>` - Re-establish connection

**Sessions:**
- `sessions: SessionMetadata[]` - List of available sessions
- `activeSessionId: string | null` - Current session ID
- `activeSessionData: SessionData | null` - Current session data
- `isLoading: boolean` - Loading state
- `createSession(params?) => Promise<NewSessionResponse>` - Create new session
- `loadSession(sessionId, params?) => Promise<LoadSessionResponse>` - Load existing session
- `deleteSession(sessionId) => Promise<void>` - Delete a session
- `forkSession(sessionId) => Promise<ForkSessionResponse>` - Fork a session
- `duplicateSession(sessionId) => Promise<void>` - Duplicate a session
- `refreshSessions() => Promise<void>` - Refresh session list

**Modes:**
- `availableModes: SessionMode[]` - Available session modes
- `currentModeId: string | null` - Current mode ID
- `setSessionMode(modeId) => Promise<SetSessionResponse>` - Change mode

**Permissions:**
- `pendingPermission: IdentifiedPermissionRequest | null` - Pending permission request
- `resolvePermission(id, response) => void` - Allow permission
- `rejectPermission(id, error) => void` - Deny permission

**Persistence:**
- `persistence: SessionPersistence` - Persistence interface
- `appendMessage(message) => Promise<void>` - Add message to session

### createAcpAdapter

Creates a TanStack AI connection adapter for ACP.

```tsx
const adapter = createAcpAdapter({
  connection: AcpConnection
  sessionId?: string | null
  sessionParams?: {
    cwd?: string
    mcpServers?: McpServer[]
  }
  onSessionCreated?: (sessionId: string) => void
  onSessionLoaded?: (sessionId: string) => void
})
```

Pass the adapter to TanStack AI's `useChat`:

```tsx
const { messages, input, handleInputChange, handleSubmit } = useChat({
  connection: adapter,
})
```

### AcpConnection

Low-level connection class for direct WebSocket management.

```tsx
import { AcpConnection } from 'tanstack-acp'

const connection = new AcpConnection({
  wsUrl: 'ws://localhost:3003',
  reconnectAttempts: 3,
  reconnectDelay: 1000,
  onConnectionStateChange: (state) => console.log(state),
  onError: (error) => console.error(error),
})

await connection.connect()
await connection.initialize()
await connection.newSession({ cwd: '/tmp' })

// Stream events
for await (const chunk of connection.streamChunks()) {
  console.log(chunk)
}
```

## ACP Protocol Events

The adapter maps ACP protocol events to TanStack AI stream chunks:

| ACP Event | TanStack AI Chunk |
|-----------|------------------|
| `agent_message_chunk` | `type: 'text'` |
| `agent_thought_chunk` | `type: 'reasoning'` |
| `tool_call` | `type: 'tool-call'` |
| `tool_call_update` | `type: 'tool-call'` (progressive) |
| `tool_call_update` (completed) | `type: 'tool-result'` |
| `plan` | `type: 'reasoning'` |
| `available_commands_update` | `type: 'data'` |
| `current_mode_update` | `type: 'data'` |

## Persistence

The library includes a built-in `MemoryPersistence` for development. For production, implement the `SessionPersistence` interface:

```tsx
import type { SessionPersistence, SessionMetadata, SessionData } from 'tanstack-acp'

class CustomPersistence implements SessionPersistence {
  async saveSession(id: string, data: SessionData): Promise<void> {
    // Save to your storage (localStorage, IndexedDB, database, etc.)
  }

  async getSession(id: string): Promise<SessionData | null> {
    // Retrieve session
  }

  async listSessions(): Promise<SessionMetadata[]> {
    // List all sessions
  }

  async deleteSession(id: string): Promise<void> {
    // Delete session
  }

  // ... other methods
}

const persistence = new CustomPersistence()
const { ... } = useAcpSession({ persistence })
```

## Re-exported Types

The library re-exports ACP SDK types for convenience:

```tsx
import type {
  NewSessionRequest,
  LoadSessionRequest,
  ForkSessionRequest,
  ResumeSessionRequest,
  SetSessionModeRequest,
  RequestPermissionRequest,
  AgentCapabilities,
  SessionMode,
  AvailableCommand,
  SessionInfo,
  McpServer,
  StopReason,
} from 'tanstack-acp'
```

## Demo Application

A full-featured demo app is available in `examples/demo/`. It demonstrates:
- Connecting to multiple ACP agents
- Session management (create, load, fork, resume, delete)
- Real-time chat with reasoning and tool calls
- Permission request handling
- Mode switching

Run the demo:

```bash
# Start an ACP agent
npx -y stdio-to-ws "npx opencode@latest" --port 3000

# Run demo
pnpm demo
```

## Architecture

```
Your React App
├── useAcpSession()          # Connection + session management
│   └── AcpConnection        # WebSocket + ACP protocol
└── useChat()                # TanStack AI chat UI
    └── createAcpAdapter()   # Bridge layer
        └── streamChunks()   # ACP event stream
```

## Requirements

- React 18+
- TanStack AI 0.3.0+
- An ACP-compatible agent with WebSocket support

## License

MIT
