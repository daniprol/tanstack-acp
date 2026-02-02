# tanstack-acp

TanStack AI adapter for Agent Client Protocol (ACP)

A minimal, zero-abstraction adapter that connects TanStack AI to ACP (Agent Client Protocol) agents over WebSockets.

## Features

- **Zero-abstraction design**: Uses TanStack AI's native `useChat` hook
- **Full ACP protocol support**: Sessions, tool calls, permissions, file operations
- **Session management**: Create, load, fork, and resume sessions
- **WebSocket connection**: Auto-reconnection with configurable attempts
- **Permission handling**: UI-friendly async permission resolution
- **Tool call aggregation**: Merges progressive ACP updates into coherent state
- **TypeScript-first**: Full type safety with ACP SDK types

## Installation

```bash
npm install tanstack-acp @tanstack/ai-react @tanstack/ai
# or
pnpm add tanstack-acp @tanstack/ai-react @tanstack/ai
```

## Quick Start

```tsx
import { useAcpSession, createAcpAdapter } from 'tanstack-acp'
import { useChat } from '@tanstack/ai-react'

function App() {
  // Manage ACP connection and sessions
  const { 
    connection, 
    sessions, 
    activeSessionId, 
    createSession,
    connectionState,
    pendingPermission,
    resolvePermission 
  } = useAcpSession({
    wsUrl: 'ws://localhost:3003',
    autoConnect: true,
  })

  // Use TanStack AI's useChat with ACP adapter
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    connection: createAcpAdapter({
      connection,
      sessionId: activeSessionId, // null = auto-create
    }),
  })

  return (
    <div>
      {/* Session management UI */}
      <button onClick={() => createSession({ cwd: '/projects' })}>
        New Session
      </button>
      
      {/* Chat UI */}
      {messages.map(msg => <Message key={msg.id} message={msg} />)}
      
      <form onSubmit={handleSubmit}>
        <input 
          value={input} 
          onChange={handleInputChange}
          disabled={isLoading || !activeSessionId}
        />
      </form>

      {/* Permission dialog */}
      {pendingPermission && (
        <PermissionDialog 
          request={pendingPermission}
          onAllow={(id) => resolvePermission(id, { outcome: 'allow_once' })}
        />
      )}
    </div>
  )
}
```

## API Reference

### `useAcpSession(options)`

React hook for managing ACP connection and sessions.

**Options:**
- `wsUrl`: WebSocket URL to ACP agent
- `autoConnect`: Auto-connect on mount (default: true)
- `reconnectAttempts`: Max reconnection attempts (default: 3)
- `reconnectDelay`: Delay between reconnections in ms (default: 1000)
- `cwd`: Default working directory
- `onConnectionStateChange`: Connection state callback
- `onPermissionRequest`: Permission request callback
- `onError`: Error callback

**Returns:**
- `connection`: AcpConnection instance
- `connectionState`: { status: 'disconnected' | 'connecting' | 'connected' | 'error', error?: string }
- `sessions`: Array of active sessions
- `activeSessionId`: Currently active session ID
- `createSession(params)`: Create new session
- `loadSession(sessionId)`: Load existing session
- `listSessions()`: List all sessions
- `forkSession(sessionId)`: Fork a session
- `resumeSession(sessionId)`: Resume a session
- `setSessionMode(modeId)`: Change session mode
- `pendingPermission`: Current permission request
- `resolvePermission(id, response)`: Resolve permission
- `rejectPermission(id, error)`: Reject permission

### `createAcpAdapter(options)`

Creates a TanStack AI connection adapter.

**Options:**
- `connection`: AcpConnection instance (required)
- `sessionId`: Session ID to use (null = auto-create)
- `sessionParams`: { cwd, mcpServers }
- `onSessionCreated`: Callback when session auto-created
- `onSessionLoaded`: Callback when session loaded

## ACP Protocol Support

### Session Updates Mapped to TanStack AI StreamChunks

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

### Supported ACP Methods

- `initialize` - Protocol handshake
- `newSession` - Create new session
- `loadSession` - Load existing session
- `listSessions` - List all sessions
- `forkSession` - Fork a session
- `resumeSession` - Resume a session
- `setSessionMode` - Change session mode
- `prompt` - Send message and receive streaming response
- `cancel` - Cancel ongoing prompt
- `requestPermission` - Handle tool permission requests
- `readTextFile` - Read files (optional)
- `writeTextFile` - Write files (optional)

## Demo

A fully functional demo app is included in the `examples/demo` directory:

```bash
cd examples/demo
pnpm install
pnpm dev
```

Features:
- Connect to multiple ACP agents (Claude Code, Gemini, Codex, Custom)
- Session management (create, load, fork, resume)
- Real-time chat with tool calls and reasoning
- Permission request handling
- Slash commands
- Session mode switching
- Beautiful UI with Tailwind CSS

## Architecture

```
Your React App
    ├── useAcpSession() - Session management
    │       └── AcpConnection - WebSocket + ACP protocol
    └── useChat() - TanStack AI
            └── createAcpAdapter() - Bridge layer
                    └── AcpConnection.streamChunks()
```

## License

MIT
