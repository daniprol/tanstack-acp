import type { UIMessage } from '@tanstack/ai';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

// SDK types - using any to avoid resolution issues
export type SessionMode = {
  id: string;
  name: string;
  description?: string | null;
};

export type AvailableCommand = {
  name: string;
  description?: string;
};

export interface ConnectionState {
  status: ConnectionStatus;
  error?: string;
  url?: string;
}

export interface AgentConfig {
  id: string;
  name: string;
  wsUrl: string;
  command: string;
  description: string;
}

export interface SessionMetadata {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  agentName?: string;
  wsUrl?: string;
  modeId?: string | null;
  modelId?: string;
  lastMessagePreview?: string;
}

export interface SessionData extends SessionMetadata {
  messages: UIMessage[];
}

export interface GroupedSessions {
  today: SessionMetadata[];
  yesterday: SessionMetadata[];
  last7Days: SessionMetadata[];
  older: SessionMetadata[];
}

export const AGENT_CONFIGS: AgentConfig[] = [
  {
    id: 'opencode',
    name: 'OpenCode',
    wsUrl: 'ws://localhost:3000',
    command: 'npx -y stdio-to-ws "npx opencode@latest" --port 3000',
    description: 'OpenCode agent with full ACP support',
  },
  {
    id: 'claude',
    name: 'Claude Code',
    wsUrl: 'ws://localhost:3003',
    command: 'npx -y stdio-to-ws "npx @anthropic-ai/claude-code-acp" --port 3003',
    description: 'Anthropic Claude Code with ACP support',
  },
  {
    id: 'gemini',
    name: 'Gemini CLI',
    wsUrl: 'ws://localhost:3004',
    command: 'npx -y stdio-to-ws "npx @google/gemini-cli@latest --experimental-acp" --port 3004',
    description: 'Google Gemini CLI with ACP support',
  },
  {
    id: 'codex',
    name: 'Codex',
    wsUrl: 'ws://localhost:3005',
    command: 'npx -y stdio-to-ws "npx @anthropic-ai/codex-acp" --port 3005',
    description: 'OpenAI Codex with ACP support',
  },
  {
    id: 'custom',
    name: 'Custom Agent',
    wsUrl: 'ws://localhost:8000',
    command: 'Your custom agent command',
    description: 'Connect to any custom ACP agent',
  },
];

export const MODEL_OPTIONS = [
  { id: 'default', name: 'Default', description: 'Standard balanced model' },
  { id: 'fast', name: 'Fast', description: 'Quick responses, good for simple tasks' },
  { id: 'powerful', name: 'Powerful', description: 'Best for complex reasoning' },
  { id: 'creative', name: 'Creative', description: 'More imaginative responses' },
  { id: 'precise', name: 'Precise', description: 'Accurate and factual' },
];
