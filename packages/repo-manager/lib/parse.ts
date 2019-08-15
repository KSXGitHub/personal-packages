import { URL } from 'url'
import { pipe } from '@tsfun/pipe'
import { ok, unwrap } from '@tsfun/result'
import { Result, GitUrlInfo, Host } from './types'
import { UnsupportedProtocol, UnsupportedHostName, ExcessivePath } from './errors'

type ParseGitUrlErr =
  UnsupportedProtocol |
  UnsupportedHostName |
  ExcessivePath

function classifyHostName (hostname: string): Result<Host, UnsupportedHostName> {
  switch (hostname.toLowerCase()) {
    case 'github.com':
      return ok(Host.GitHub)
    case 'gitlab.com':
      return ok(Host.GitLab)
    default:
      return new UnsupportedHostName(hostname).err()
  }
}

class GitUrlInfoInstance implements GitUrlInfo {
  constructor (
    public readonly host: Host,
    public readonly owner: string,
    public readonly name: string
  ) {}
}

export function parseGitUrl (url: string): Result<GitUrlInfo, ParseGitUrlErr> {
  const { protocol, hostname, pathname } = new URL(url)

  if (protocol !== 'https:' && protocol !== 'http:') {
    return new UnsupportedProtocol(protocol).err()
  }

  const host = classifyHostName(hostname)
  if (!host.tag) return host

  const [owner, repo, ...rest] = pathname.split('/').slice(1)
  if (rest.length) return new ExcessivePath(pathname, rest).err()
  const [name] = repo.split(/\.git$/)
  return ok(new GitUrlInfoInstance(
    host.value,
    decodeURIComponent(owner),
    decodeURIComponent(name)
  ))
}

export const unwrapParseGitUrl = pipe(parseGitUrl).to(unwrap).get

const lookupHostName = class {
  public static readonly [Host.GitHub] = 'github.com'
  public static readonly [Host.GitLab] = 'gitlab.com'
}

export function createGitUrl (info: GitUrlInfo): string {
  const { host, owner, name } = info
  const hostname = lookupHostName[host]
  const org = encodeURIComponent(owner)
  const repo = encodeURIComponent(name)
  return `https://${hostname}/${org}/${repo}.git`
}
