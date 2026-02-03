import type { Session, IdentifiedPermissionRequest } from 'tanstack-acp';
import type { RequestPermissionResponse, SessionMode, AvailableCommand, AgentCapabilities } from '@agentclientprotocol/sdk';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

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

export interface AppSession extends Session {
  agentName?: string;
}

export interface UseAcpSessionReturn {
  // Connection
  connection: import('tanstack-acp').AcpConnection | null;
  
  // Connection state
  connectionState: ConnectionState;
  isConnected: boolean;
  
  // Session data
  sessions: AppSession[];
  activeSessionId: string | null;
  setActiveSessionId: (sessionId: string | null) => void;
  agentCapabilities: AgentCapabilities | null;
  availableCommands: AvailableCommand[];
  currentModeId: string | null;
  availableModes: SessionMode[];
  
  // Session actions
  createSession: (params?: { cwd?: string; mcpServers?: unknown[] }) => Promise<import('@agentclientprotocol/sdk').NewSessionResponse>;
  loadSession: (sessionId: string, params?: { cwd?: string }) => Promise<import('@agentclientprotocol/sdk').LoadSessionResponse>;
  forkSession: (sessionId: string) => Promise<import('@agentclientprotocol/sdk').ForkSessionResponse>;
  setSessionMode: (modeId: string) => Promise<import('@agentclientprotocol/sdk').SetSessionModeResponse>;
  
  // Connection actions
  connect: () => Promise<void>;
  disconnect: () => void;
  reconnect: () => Promise<void>;
  
  // Permission handling
  pendingPermission: IdentifiedPermissionRequest | null;
  resolvePermission: (permissionId: string, response: RequestPermissionResponse) => void;
  rejectPermission: (permissionId: string, error: Error) => void;
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
