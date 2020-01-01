import { EXEC_OPTIONS } from './constants'

export interface ExecSync {
  (program: string, args: readonly string[], options: ExecOptions): void
}

export type ExecOptions = typeof EXEC_OPTIONS
