import { err } from '@tsfun/result'
import { Err } from './types'

abstract class ErrorBase extends Error {
  protected abstract readonly NAME: string

  get name () {
    return this.NAME
  }

  public err (): Err<this> {
    return err(this)
  }
}

export class UnsupportedProtocol extends ErrorBase {
  readonly NAME = 'UnsupportedProtocol'

  constructor (public readonly protocol: string) {
    super(`Protocol "${protocol}" is not supported`)
  }
}

export class UnsupportedHostName extends ErrorBase {
  readonly NAME = 'UnsupportedHostName'

  constructor (public readonly hostname: string) {
    super(`Hostname "${hostname}" is not supported`)
  }
}

export class ExcessivePath extends ErrorBase {
  readonly NAME = 'ExcessivePath'

  constructor (
    public readonly pathname: string,
    public readonly excess: readonly string[]
  ) {
    super(`Path too long: ${pathname}`)
  }
}
