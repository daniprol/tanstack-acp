# tanstack-acp

A minimal, modern TypeScript library that connects TanStack AI to ACP (Agent Client Protocol) agents over WebSockets.

## Quick Start

```bash
# Install dependencies
pnpm install

# Build the library
pnpm build

# Run the demo
pnpm demo
```

## Project Structure

```
tanstack-acp/
├── packages/
│   └── tanstack-acp/          # Core library
├── examples/
│   └── demo/                  # Vite + React demo app
└── README.md
```

## Features

- **useAcpSession()** - React hook for ACP session management
- **createAcpAdapter()** - TanStack AI connection adapter
- **Full ACP Protocol** - Sessions, tool calls, permissions, file operations
- **WebSocket Connection** - Auto-reconnection support
- **TypeScript** - Full type safety

## License

MIT
