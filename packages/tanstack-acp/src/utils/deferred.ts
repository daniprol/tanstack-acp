/**
 * Deferred promise utility
 * 
 * Allows creating a promise that can be resolved/rejected externally
 */
export class Deferred<T> {
  public promise: Promise<T>
  public resolve!: (value: T | PromiseLike<T>) => void
  public reject!: (reason?: unknown) => void
  public resolved = false
  public rejected = false

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = (value) => {
        this.resolved = true
        resolve(value)
      }
      this.reject = (reason) => {
        this.rejected = true
        reject(reason)
      }
    })
  }
}
