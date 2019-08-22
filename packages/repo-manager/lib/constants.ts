import * as git from 'isomorphic-git'
import * as fsx from 'fs-extra'

import {
  GitModule,
  CloneFunc,
  PullFunc,
  CheckoutFunc,
  InitFunc,
  AddRemoteFunc,
  FileSystem
} from './types'

export const ISO_GIT_MODULE: GitModule = git
export const ISO_CLONE_FUNC: CloneFunc = git.clone
export const ISO_PULL_FUNC: PullFunc = git.pull
export const ISO_CHECKOUT_FUNC: CheckoutFunc = git.checkout
export const ISO_INIT_FUNC: InitFunc = git.init
export const ISO_ADD_REMOTE_FUNC: AddRemoteFunc = git.addRemote
export const FILE_SYSTEM: FileSystem = fsx
