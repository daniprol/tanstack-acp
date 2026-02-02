/**
 * In-memory persistence implementation
 * 
 * Default persistence provider that stores sessions in memory
 */

import type { Message } from '@tanstack/ai';
import type { SessionData, SessionMetadata, SessionPersistence } from './types.js';

export class MemoryPersistence implements SessionPersistence {
  private sessions = new Map<string, SessionData>();

  async listSessions(): Promise<SessionMetadata[]> {
    const sessions = Array.from(this.sessions.values())
      .map(data => this.extractMetadata(data))
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    
    return sessions;
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    return this.sessions.get(sessionId) || null;
  }

  async saveSession(sessionId: string, data: SessionData): Promise<void> {
    this.sessions.set(sessionId, {
      ...data,
      updatedAt: new Date(),
    });
  }

  async deleteSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }

  async getMessages(sessionId: string): Promise<Message[]> {
    const session = this.sessions.get(sessionId);
    return session?.messages || [];
  }

  async appendMessage(sessionId: string, message: Message): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.messages.push(message);
      session.messageCount = session.messages.length;
      session.updatedAt = new Date();
      
      // Auto-update title and preview if first message
      if (session.messages.length === 1 && message.role === 'user') {
        const content = typeof message.content === 'string' 
          ? message.content 
          : 'New conversation';
        session.title = this.generateTitle(content);
        session.lastMessagePreview = content.slice(0, 100);
      } else if (message.role === 'user') {
        const content = typeof message.content === 'string' 
          ? message.content 
          : '';
        session.lastMessagePreview = content.slice(0, 100);
        session.updatedAt = new Date();
      }
    }
  }

  async clearMessages(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.messages = [];
      session.messageCount = 0;
      session.lastMessagePreview = undefined;
    }
  }

  async forkSession(fromSessionId: string, newSessionId: string): Promise<void> {
    const fromSession = this.sessions.get(fromSessionId);
    if (!fromSession) {
      throw new Error(`Session ${fromSessionId} not found`);
    }

    const newSession: SessionData = {
      ...fromSession,
      id: newSessionId,
      title: `${fromSession.title} (Fork)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [...fromSession.messages], // Copy messages
    };

    this.sessions.set(newSessionId, newSession);
  }

  async duplicateSession(sessionId: string, newSessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const newSession: SessionData = {
      ...session,
      id: newSessionId,
      title: `${session.title} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [...session.messages],
    };

    this.sessions.set(newSessionId, newSession);
  }

  async updateSessionMetadata(
    sessionId: string, 
    metadata: Partial<SessionMetadata>
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      Object.assign(session, metadata, { updatedAt: new Date() });
    }
  }

  private extractMetadata(data: SessionData): SessionMetadata {
    return {
      id: data.id,
      title: data.title,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      messageCount: data.messageCount,
      agentName: data.agentName,
      wsUrl: data.wsUrl,
      modeId: data.modeId,
      modelId: data.modelId,
      lastMessagePreview: data.lastMessagePreview,
    };
  }

  private generateTitle(content: string): string {
    // Extract first 30 chars or first sentence
    const title = content.slice(0, 30).trim();
    return title.length < content.length ? `${title}...` : title;
  }
}
