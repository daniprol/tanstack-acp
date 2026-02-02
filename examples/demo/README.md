# TanStack ACP Demo

A beautifully designed demo application showcasing the tanstack-acp library with shadcn/ui components.

## Features

- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Type-Safe**: Full TypeScript support
- **Best Practices**: Component separation, custom hooks, clean architecture
- **Full ACP Support**: All protocol features implemented

## Project Structure

```
src/
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── connection-panel.tsx
│   ├── session-panel.tsx
│   ├── chat-message-list.tsx
│   ├── chat-input.tsx
│   ├── chat-status.tsx
│   ├── permission-dialog.tsx
│   ├── message-avatar.tsx
│   └── message-actions.tsx
├── hooks/
│   ├── use-chat-session.ts
│   └── use-chat-input.ts
├── lib/
│   └── utils.ts
├── types/
│   └── index.ts
├── App.tsx
├── main.tsx
└── index.css
```

## Getting Started

1. Start an ACP agent:
```bash
npx -y stdio-to-ws "npx @anthropic-ai/claude-code-acp" --port 3003
```

2. Run the demo:
```bash
pnpm dev
```

3. Open http://localhost:5173
