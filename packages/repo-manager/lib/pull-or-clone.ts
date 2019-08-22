import path from 'path'

import {
  PullCloneOptions,
  PullCloneOptionsByUrl,
  PullCloneOptionsByInfo
} from './types'

import {
  createGitUrl,
  getLocationByInfo,
  unwrapGetLocationByUrl
} from './parse'

export {
  ISO_CLONE_FUNC,
  ISO_PULL_FUNC,
  ISO_CHECKOUT_FUNC
} from './constants'

interface BaseOptions extends PullCloneOptions {
  readonly dir: string
  readonly url: string
}

async function pullOrClone (options: BaseOptions) {
  const { fs, pull, clone, checkout, ref, url, dir } = options

  if (await fs.pathExists(path.join(dir, '.git'))) {
    await pull({ dir, ref, fastForwardOnly: true })
    await checkout({ dir, ref })
  } else {
    await clone({ dir, url })
  }
}

export async function pullOrCloneByInfo (options: PullCloneOptionsByInfo) {
  const dir = getLocationByInfo(options.info, options.prefix)
  const url = createGitUrl(options.info)
  await pullOrClone({ ...options, dir, url })
}

export async function pullOrCloneByUrl (options: PullCloneOptionsByUrl) {
  const dir = unwrapGetLocationByUrl(options.url, options.prefix)
  await pullOrClone({ ...options, dir })
}
