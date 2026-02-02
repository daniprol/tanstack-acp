/**
 * Invariant utility for type narrowing
 */
export function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Invariant failed: ${message}`)
  }
}

export function assertNever(value: never, message?: string): never {
  throw new Error(message || `Unexpected value: ${value}`)
}
