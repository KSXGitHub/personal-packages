import { Status } from './status'

export interface Process<ExitReturn> {
  readonly env: Env
  readonly stdout: WritableStream
  readonly stderr: WritableStream
  readonly exit: Exit<ExitReturn>
}

export interface Env {
  readonly FORCE_EDITOR?: string
  readonly FORCE_EDITOR_PREFIXES?: string
  readonly ISINTTY?: 'true' | 'false'
  readonly [_: string]: string | undefined
}

export interface WritableStream {
  readonly write: StreamWriter
}

export interface StreamWriter {
  (chunk: string): void
}

export interface Exit<ExitReturn> {
  (status: Status): ExitReturn
}
