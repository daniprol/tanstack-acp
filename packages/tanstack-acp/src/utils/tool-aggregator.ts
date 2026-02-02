import type { ToolCallState } from '../types/index.js'

/**
 * Aggregate tool call updates from ACP protocol
 * 
 * ACP sends tool calls as a sequence of updates:
 * 1. tool_call - Initial call with name
 * 2. tool_call_update - Progressive arg updates and status changes
 * 
 * This class merges them into a coherent state
 */
export class ToolCallAggregator {
  private calls = new Map<string, ToolCallState>()

  start(toolCallId: string, toolName: string): ToolCallState {
    const state: ToolCallState = {
      toolCallId,
      toolName,
      status: 'pending',
      args: {},
    }
    this.calls.set(toolCallId, state)
    return state
  }

  update(
    toolCallId: string,
    update: {
      status?: 'pending' | 'in_progress' | 'completed' | 'failed'
      rawOutput?: Record<string, unknown>
      locations?: unknown[]
      content?: unknown[]
    }
  ): ToolCallState {
    const existing = this.calls.get(toolCallId)
    if (!existing) {
      throw new Error(`Tool call ${toolCallId} not started`)
    }

    const merged: ToolCallState = {
      ...existing,
      status: update.status || existing.status,
      args: { ...existing.args, ...(update.rawOutput || {}) },
      locations: update.locations || existing.locations,
      content: update.content || existing.content,
    }

    this.calls.set(toolCallId, merged)
    return merged
  }

  get(toolCallId: string): ToolCallState | undefined {
    return this.calls.get(toolCallId)
  }

  getAll(): ToolCallState[] {
    return Array.from(this.calls.values())
  }

  clear(): void {
    this.calls.clear()
  }
}
