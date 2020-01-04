import { EXEC_OPTIONS } from './constants'

export interface SpawnSync {
  (program: string, args: readonly string[], options: ExecOptions): SpawnSyncReturn
}

export interface SpawnSyncReturn {
  readonly status: number | null
  readonly error: Error | null
}

export type ExecOptions = typeof EXEC_OPTIONS
