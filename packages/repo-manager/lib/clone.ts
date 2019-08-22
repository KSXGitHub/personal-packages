import { createGitUrl, getLocationByInfo, unwrapGetLocationByUrl } from './parse'
import { GitUrlInfo, CloneFunc } from './types'

export { ISO_CLONE_FUNC } from './constants'

export async function cloneByInfo (clone: CloneFunc, info: GitUrlInfo, prefix: string) {
  const url = createGitUrl(info)
  const dir = getLocationByInfo(info, prefix)
  await clone({ url, dir })
  return { url, dir }
}

export async function cloneByUrl (clone: CloneFunc, url: string, prefix: string) {
  const dir = unwrapGetLocationByUrl(url, prefix)
  await clone({ url, dir })
  return { url, dir }
}
