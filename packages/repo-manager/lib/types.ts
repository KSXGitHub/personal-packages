export { Result, Ok, Err } from '@tsfun/result'

export interface GitUrlInfo {
  readonly host: Host
  readonly owner: string
  readonly name: string
}

export const enum Host {
  GitHub = 'github',
  GitLab = 'gitlab'
}
