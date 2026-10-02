/** Base error for all service-layer failures. */
export class ServiceError extends Error {
  readonly status: number

  constructor(message: string, status = 500) {
    super(message)
    this.name = 'ServiceError'
    this.status = status
  }
}