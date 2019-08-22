export { Result, Ok, Err } from '@tsfun/result'

type MaybePromise<X> = X | Promise<X>

export interface GitUrlInfo {
  readonly host: Host
  readonly owner: string
  readonly name: string
}

export const enum Host {
  GitHub = 'github',
  GitLab = 'gitlab'
}

export interface GitModule {
  readonly clone: CloneFunc
}

export interface CloneFunc {
  (options: CloneFunc.Options): MaybePromise<void>
}

export namespace CloneFunc {
  export interface Options {
    readonly url: string
    readonly dir: string
  }
}

export interface PullFunc {
  (options: PullFunc.Options): MaybePromise<void>
}

export namespace PullFunc {
  export interface Options {
    readonly dir: string
    readonly ref: string
    readonly fastForwardOnly?: boolean
  }
}

export interface CheckoutFunc {
  (options: CheckoutFunc.Options): MaybePromise<void>
}

export namespace CheckoutFunc {
  export interface Options {
    readonly dir: string
    readonly ref: string
  }
}

export interface InitFunc {
  (options: InitFunc.Options): MaybePromise<void>
}

export namespace InitFunc {
  export interface Options {
    readonly dir: string
  }
}

export interface AddRemoteFunc {
  (options: AddRemoteFunc.Options): MaybePromise<void>
}

export namespace AddRemoteFunc {
  export interface Options {
    readonly dir: string
    readonly remote: string
    readonly url: string
  }
}

export interface PullCloneOptions {
  readonly clone: CloneFunc
  readonly checkout: CheckoutFunc
  readonly pull: PullFunc
  readonly ref: string
  readonly fs: PullCloneOptions.FileSystemModule
  readonly prefix: string
}

export namespace PullCloneOptions {
  export interface FileSystemModule {
    readonly pathExists: FileSystem.PathExists
  }
}

export interface PullCloneOptionsByUrl extends PullCloneOptions {
  readonly url: string
}

export interface PullCloneOptionsByInfo extends PullCloneOptions {
  readonly info: GitUrlInfo
}

export interface CreateOptions {
  readonly init: InitFunc
  readonly addRemote: AddRemoteFunc
  readonly apiCreate: CreateOptions.ApiCreate
  readonly fs: CreateOptions.FileSystemModule
  readonly prefix: string
}

export namespace CreateOptions {
  export interface ApiCreate {
    (options: ApiCreate.Options): MaybePromise<void>
  }

  export namespace ApiCreate {
    export interface Options {
      readonly url: string
      readonly info: GitUrlInfo
    }
  }

  export interface FileSystemModule {
    readonly ensureDir: FileSystem.CreateDirectory
  }
}

export interface CreateOptionsByInfo extends CreateOptions {
  readonly info: GitUrlInfo
}

export interface CreateOptionsByUrl extends CreateOptions {
  readonly url: string
}

export interface FileSystem {
  readonly pathExists: FileSystem.PathExists
  readonly ensureDir: FileSystem.CreateDirectory
  readonly mkdir: FileSystem.CreateDirectory
}

export namespace FileSystem {
  export interface PathExists {
    (path: string): MaybePromise<boolean>
  }

  export interface CreateDirectory {
    (dir: string): MaybePromise<void>
  }
}
