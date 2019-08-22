import {
  createGitUrl,
  unwrapParseGitUrl,
  getLocationByInfo
} from './parse'

import {
  GitUrlInfo,
  CreateOptions,
  CreateOptionsByInfo,
  CreateOptionsByUrl
} from './types'

export {
  ISO_INIT_FUNC,
  ISO_ADD_REMOTE_FUNC
} from './constants'

interface BaseOptions extends CreateOptions {
  readonly dir: string
  readonly url: string
  readonly info: GitUrlInfo
}

async function create (options: BaseOptions) {
  const { dir, url, info, fs, init, addRemote, apiCreate } = options
  const apiCreatePromise = apiCreate({ info, url })
  await fs.ensureDir(dir)
  await init({ dir })
  await addRemote({ dir, url, remote: 'origin' })
  await apiCreatePromise
}

export async function createByInfo (options: CreateOptionsByInfo) {
  const url = createGitUrl(options.info)
  const dir = getLocationByInfo(options.info, options.prefix)
  await create({ ...options, dir, url })
}

export async function createByUrl (options: CreateOptionsByUrl) {
  const info = unwrapParseGitUrl(options.url)
  const dir = getLocationByInfo(info, options.prefix)
  await create({ ...options, dir, info })
}
