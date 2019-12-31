import { WritableStream } from './process'

export interface Logger {
  (message: string): void
}

export const Logger = (stream: WritableStream): Logger => message => stream.write(message + '\n')

export interface WritableStreamPair {
  readonly stdout: WritableStream
  readonly stderr: WritableStream
}

export interface LoggerPair {
  readonly info: Logger
  readonly error: Logger
}

export const LoggerPair = (stream: WritableStreamPair): LoggerPair => ({
  info: Logger(stream.stdout),
  error: Logger(stream.stderr)
})
