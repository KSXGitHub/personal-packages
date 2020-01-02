import { Status } from './status'

export interface Process<ExitReturn> {
  readonly env: Env
  readonly exit: Exit<ExitReturn>
}

export interface Env {
  readonly FORCE_EDITOR?: string
  readonly FORCE_EDITOR_PREFIXES?: string
  readonly ISINTTY?: 'true' | 'false'
  readonly [_: string]: string | undefined
}

export interface Exit<ExitReturn> {
  (status: Status): ExitReturn
}
