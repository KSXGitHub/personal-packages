export interface Process {
  readonly env: Env
}

export interface Env {
  readonly FORCE_EDITOR?: string
  readonly FORCE_EDITOR_PREFIXES?: string
  readonly ISINTTY?: 'true' | 'false'
  readonly [_: string]: string | undefined
}
