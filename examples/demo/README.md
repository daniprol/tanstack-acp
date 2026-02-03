# TanStack ACP Demo

A beautiful, world-class demo application for the TanStack ACP library featuring a modern AI chat interface with full Agent Client Protocol support.

## ✨ Features

### Design
- **Zinc Theme**: Professional zinc base with blue brand accents
- **Mobile-First**: Fully responsive from mobile to desktop
- **Subtle Animations**: Smooth transitions and micro-interactions
- **Dark Mode**: Full dark mode support via CSS variables

### Functionality
- **Multiple Agents**: OpenCode (default), Claude, Gemini, Codex, Custom
- **Session Management**: Create, load, fork, duplicate, delete conversations
- **Smart Grouping**: Sessions grouped by date (Today, Yesterday, Last 7 Days, Older)
- **Model Selection**: Choose between Default, Fast, Powerful, Creative, Precise
- **Real-time Chat**: Full streaming support with typing indicators
- **Permission Handling**: UI for agent permission requests
- **Toast Notifications**: Beautiful feedback for all actions

### Components
- **Layout**: Responsive sidebar with mobile sheet, sticky header
- **Connection**: Status indicators, agent selector, connect/disconnect
- **Sessions**: Searchable list with collapsible groups, context menus
- **Chat**: Message display, input with model selector, typing animation

## 🚀 Quick Start

### 1. Start an Agent

```bash
# Option 1: OpenCode (default)
npx -y stdio-to-ws "npx opencode@latest" --port 3000

# Option 2: Claude Code
npx -y stdio-to-ws "npx @anthropic-ai/claude-code-acp" --port 3003

# Option 3: Gemini CLI
npx -y stdio-to-ws "npx @google/gemini-cli@latest --experimental-acp" --port 3004
```

### 2. Run the Demo

```bash
# Navigate to demo
cd examples/demo

# Install dependencies (if needed)
pnpm install

# Start dev server
pnpm dev
```

### 3. Open in Browser

Navigate to `http://localhost:5173`

## 🎨 Design System

### Colors
- **Primary**: Zinc grays for UI, Blue (#2563eb) for brand/actions
- **Success**: Green for connected states
- **Warning**: Amber for loading/connecting states
- **Error**: Red for error states

### Typography
- **Font**: Inter (system fallback)
- **Scale**: xs (12px) → 2xl (24px)
- **Weights**: 400 (normal) → 700 (bold)

### Spacing
- **Base**: 4px grid system
- **Components**: 8px-16px internal padding
- **Sections**: 24px gaps

### Animations
- **Fast**: 150ms (hovers)
- **Normal**: 200ms (transitions)
- **Slow**: 300ms (page transitions)
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1)

## 📱 Responsive Breakpoints

- **Mobile**: < 768px (single column, sheet sidebar)
- **Tablet**: 768px - 1024px (adjusted spacing)
- **Desktop**: >= 1024px (full layout, fixed sidebar)

## 🏗️ Architecture

```
src/
├── components/
│   ├── layout/          # App shell components
│   │   ├── app-header.tsx
│   │   └── app-sidebar.tsx
│   ├── connection/      # Connection management
│   │   ├── agent-selector.tsx
│   │   ├── connect-button.tsx
│   │   ├── connection-panel.tsx
│   │   └── connection-status.tsx
│   ├── sessions/        # Session management
│   │   ├── session-card.tsx
│   │   ├── session-group.tsx
│   │   ├── session-list.tsx
│   │   ├── session-search.tsx
│   │   └── sessions-panel.tsx
│   ├── chat/           # Chat interface
│   │   ├── chat-container.tsx
│   │   ├── chat-input.tsx
│   │   ├── empty-chat.tsx
│   │   ├── message-item.tsx
│   │   ├── message-list.tsx
│   │   └── typing-indicator.tsx
│   └── ui/             # shadcn components
├── hooks/
│   ├── use-app-chat.ts
│   └── use-mobile.ts
├── lib/
│   └── utils.ts        # cn() helper
├── types/
│   └── index.ts        # TypeScript types
└── App.tsx             # Main application
```

## 🎯 Usage Flow

1. **Open App**: See "Not Connected" state with prominent CTA
2. **Select Agent**: Choose from dropdown (OpenCode default)
3. **Connect**: Click "Connect to Agent" button
4. **Create Session**: Click "New Conversation"
5. **Chat**: Type messages, use Shift+Enter for new lines
6. **Manage**: Use sidebar to switch/fork/delete sessions

## 🛠️ Development

### Tech Stack
- **React 18**: Functional components, hooks
- **TypeScript**: Full type safety
- **Vite**: Fast development build
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Beautiful, accessible components
- **TanStack AI**: Chat state management
- **TanStack ACP**: Agent Client Protocol integration

### Code Standards
- 1 component per file
- Proper TypeScript interfaces
- Custom hooks for logic
- Mobile-first responsive design
- Accessible (ARIA labels, keyboard nav)

## 📝 License

MIT
