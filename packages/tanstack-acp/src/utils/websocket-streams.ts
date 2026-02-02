/**
 * WebSocket stream utilities
 * 
 * Browser-compatible ReadableStream and WritableStream utilities
 * Uses native browser Streams API
 */

export interface NodeReadableStream extends ReadableStream<Uint8Array> {
  values(): AsyncGenerator<Uint8Array, undefined, unknown>
  [Symbol.asyncIterator](): AsyncGenerator<Uint8Array, undefined, unknown>
}

export function createWebSocketWritableStream(ws: WebSocket): WritableStream<Uint8Array> {
  return new WritableStream({
    write(chunk: Uint8Array) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(chunk)
      }
    },
    close() {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    },
    abort() {
      ws.close()
    },
  })
}

export function createWebSocketReadableStream(ws: WebSocket): NodeReadableStream {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      ws.onmessage = (event) => {
        if (event.data instanceof ArrayBuffer) {
          controller.enqueue(new Uint8Array(event.data))
        } else if (event.data instanceof Uint8Array) {
          controller.enqueue(event.data)
        } else {
          const encoder = new TextEncoder()
          // HACK: append newline b/c of a bug in some ACP servers
          controller.enqueue(encoder.encode(`${event.data}\n`))
        }
      }

      ws.onclose = () => {
        controller.close()
      }

      ws.onerror = (error) => {
        controller.error(error)
      }
    },
    cancel() {
      ws.close()
    },
  }) as NodeReadableStream

  // Add .values() and [Symbol.asyncIterator] for compatibility
  const values = async function* () {
    const reader = stream.getReader()
    try {
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        yield value
      }
    } finally {
      reader.releaseLock()
    }
    return undefined
  }

  stream.values = values
  stream[Symbol.asyncIterator] = values

  return stream
}
