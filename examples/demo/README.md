# TanStack ACP Demo

A complete demonstration application showcasing the tanstack-acp library. This app connects to ACP-compatible AI agents and provides a full chat interface with session management.

## What This Is

This demo app shows how to build a production-ready AI chat interface using tanstack-acp. It demonstrates best practices for:

- Connecting to ACP agents
- Managing chat sessions
- Handling permission requests
- Building a responsive UI with TanStack AI

## Features

**Agent Connection:**
- Connect to multiple ACP agents (OpenCode, Claude Code, Gemini CLI, Codex, Custom)
- Auto-reconnection with status indicators
- Easy agent switching

**Session Management:**
- Create, load, fork, duplicate, and delete sessions
- Sessions grouped by date (Today, Yesterday, Last 7 Days, Older)
- Search through sessions
- Mode switching (Default, Fast, Powerful, Creative, Precise)

**Chat Interface:**
- Real-time streaming responses
- Agent typing indicators
- Model selection
- Markdown-style message display
- Reasoning display for agent thoughts

**Permission Handling:**
- UI for agent permission requests
- Allow once, allow, or deny options
- Visual feedback for pending permissions

## Quick Start

### 1. Start an ACP Agent

Choose one of the following:

```bash
# OpenCode (recommended for testing)
npx -y stdio-to-ws "npx opencode@latest" --port 3000

# Claude Code
npx -y stdio-to-ws "npx @anthropic-ai/claude-code-acp" --port 3003

# Gemini CLI
npx -y stdio-to-ws "npx @google/gemini-cli@latest --experimental-acp" --port 3004
```

### 2. Run the Demo

```bash
# From the monorepo root:
pnpm demo

# Or navigate directly:
cd examples/demo
pnpm install
pnpm dev
```

### 3. Open in Browser

Navigate to `http://localhost:5173`

## Usage Flow

1. **Select an agent** from the sidebar dropdown
2. **Click "Connect to Agent"** to establish the WebSocket connection
3. **Click "New Chat"** to create a session
4. **Type a message** and press Enter or click Send
5. **Manage sessions** using the sidebar:
   - Switch between sessions
   - Fork a session to explore a different direction
   - Delete sessions you no longer need

## Architecture

```
src/
├── components/
│   ├── layout/
│   │   ├── app-header.tsx       # Top navigation bar
│   │   └── app-sidebar.tsx       # Sidebar with agent selector
│   ├── connection/
│   │   ├── agent-selector.tsx   # Agent dropdown
│   │   ├── connect-button.tsx    # Connect/disconnect button
│   │   ├── connection-panel.tsx  # Connection management UI
│   │   └── connection-status.tsx # Status indicator
│   ├── sessions/
│   │   ├── session-card.tsx      # Individual session item
│   │   ├── session-group.tsx     # Date-grouped session list
│   │   ├── session-list.tsx     # Full session sidebar
│   │   ├── session-search.tsx    # Search input
│   │   └── sessions-panel.tsx    # Sessions container
│   ├── chat/
│   │   ├── chat-container.tsx    # Main chat area
│   │   ├── chat-input.tsx         # Message input form
│   │   ├── empty-chat.tsx         # Empty state component
│   │   ├── message-item.tsx       # Individual message
│   │   ├── message-list.tsx       # Message thread display
│   │   └── typing-indicator.tsx   # Agent typing animation
│   └── ui/                        # Shared UI components
├── hooks/
│   ├── use-app-chat.ts           # Chat logic hook
│   └── use-mobile.ts             # Mobile detection hook
├── lib/
│   └── utils.ts                   # Utility functions
├── types/
│   └── index.ts                   # TypeScript types
├── App.tsx                        # Main application component
└── main.tsx                       # Entry point
```

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **TanStack AI** - Chat state management
- **TanStack ACP** - ACP protocol integration
- **Sonner** - Toast notifications

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Type check
pnpm lint
```

## Environment Variables

No environment variables required. The app connects to agents via WebSocket URLs configured in the UI.

## Integrations

The demo supports these ACP-compatible agents:

| Agent | WebSocket Port | Install Command |
|-------|----------------|-----------------|
| OpenCode | 3000 | `npx -y stdio-to-ws "npx opencode@latest" --port 3000` |
| Claude Code | 3003 | `npx -y stdio-to-ws "npx @anthropic-ai/claude-code-acp" --port 3003` |
| Gemini CLI | 3004 | `npx -y stdio-to-ws "npx @google/gemini-cli@latest --experimental-acp" --port 3004` |

For custom agents, provide your own WebSocket URL.

## Customization

### Adding New Agents

Edit `src/types/index.ts` to add agent configurations:

```ts
export const AGENT_CONFIGS = [
  {
    id: 'custom-agent',
    name: 'Custom Agent',
    wsUrl: 'ws://localhost:9000',
    description: 'Your custom agent',
  },
  // ... existing agents
]
```

### Styling

The demo uses Tailwind CSS with a zinc color palette and blue accents. Customize in `tailwind.config.js`.

## Related

- [Core Library README](../../packages/tanstack-acp/README.md) - Full API documentation
- [tanstack-acp on GitHub](https://github.com/daniprol/tanstack-acp)

## License

MIT
