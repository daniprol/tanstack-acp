/**
 * Persistence types
 * 
 * TypeScript type definitions for session persistence
 */

import type { Message } from '@tanstack/ai';

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
  messages: Message[];
  metadata?: Record<string, unknown>;
}

export interface GroupedSessions {
  today: SessionMetadata[];
  yesterday: SessionMetadata[];
  last7Days: SessionMetadata[];
  older: SessionMetadata[];
}

export interface SessionPersistence {
  // Core CRUD
  listSessions(): Promise<SessionMetadata[]>;
  getSession(sessionId: string): Promise<SessionData | null>;
  saveSession(sessionId: string, data: SessionData): Promise<void>;
  deleteSession(sessionId: string): Promise<void>;
  
  // Messages/History
  getMessages(sessionId: string): Promise<Message[]>;
  appendMessage(sessionId: string, message: Message): Promise<void>;
  clearMessages(sessionId: string): Promise<void>;
  
  // Fork/Duplicate
  forkSession(fromSessionId: string, newSessionId: string): Promise<void>;
  duplicateSession(sessionId: string, newSessionId: string): Promise<void>;
  
  // Metadata
  updateSessionMetadata(
    sessionId: string, 
    metadata: Partial<SessionMetadata>
  ): Promise<void>;
}
