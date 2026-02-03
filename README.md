# tanstack-acp

TanStack AI adapter for Agent Client Protocol (ACP). Connect your React apps to ACP-compatible AI agents over WebSocket.

## What is tanstack-acp?

tanstack-acp is a minimal React library that bridges TanStack AI with the Agent Client Protocol (ACP). ACP is an open protocol for communicating with AI agents - agents like Claude Code, OpenCode, Gemini CLI, and Google Codex all support ACP.

This adapter lets you use TanStack AI's familiar hooks (`useChat`) while connecting to any ACP-compatible agent via WebSocket.

## Key Features

- **Familiar API** - Use TanStack AI's `useChat` hook with ACP agents
- **Session Management** - Create, load, fork, resume, and manage sessions
- **Permission Handling** - Built-in support for agent permission requests
- **Streaming** - Full streaming support for text, reasoning, and tool calls
- **TypeScript** - Full type safety with re-exported ACP types

## Quick Start

```bash
# Install the package
npm install tanstack-acp @tanstack/ai @tanstack/ai-react

# Or with pnpm
pnpm add tanstack-acp @tanstack/ai @tanstack/ai-react
```

```tsx
import { useAcpSession, createAcpAdapter } from 'tanstack-acp'
import { useChat } from '@tanstack/ai-react'

function App() {
  const { connection, activeSessionId, createSession } = useAcpSession({
    wsUrl: 'ws://localhost:3003',
    autoConnect: true,
  })

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    connection: createAcpAdapter({
      connection,
      sessionId: activeSessionId,
    }),
  })

  return (
    <div>
      {messages.map(msg => <Message key={msg.id} message={msg} />)}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
      </form>
    </div>
  )
}
```

## Project Structure

```
tanstack-acp/
├── packages/tanstack-acp/    # Core library
│   ├── README.md              # Full API documentation
│   └── src/                   # TypeScript source
├── examples/demo/             # Demo application
│   ├── README.md              # Demo usage guide
│   └── src/                   # React app source
└── README.md                  # This file
```

## Demo Application

A fully functional demo app is included to showcase the library:

```bash
# Start an ACP agent first (choose one):
npx -y stdio-to-ws "npx opencode@latest" --port 3000
# or
npx -y stdio-to-ws "npx @anthropic-ai/claude-code-acp" --port 3003

# Run the demo:
pnpm demo
```

Then open `http://localhost:5173` in your browser.

See `examples/demo/README.md` for full demo documentation.

## Documentation

- [Core Library README](./packages/tanstack-acp/README.md) - Full API reference and usage guide
- [Demo App README](./examples/demo/README.md) - Demo features and development guide

## Requirements

- React 18+
- TanStack AI 0.3.0+
- An ACP-compatible agent running with WebSocket support

## License

MIT
