export interface Console {
  readonly info: Logger
  readonly error: Logger
}

export interface Logger {
  (...message: any[]): void
}
