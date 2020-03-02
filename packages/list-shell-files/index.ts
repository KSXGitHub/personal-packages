import { stat } from 'fs-extra'
import { shebangCommand } from '@khai96x/shebang'

export interface Logger {
  (message: string): void
}

export interface MainOptions {
  readonly files: string[]
  readonly shells: string[]
  readonly log: Logger
}

export async function main (options: MainOptions) {
  const { files, shells, log } = options
  const promises: Promise<void>[] = []
  for (const filename of files) {
    if (!await stat(filename).then(
      x => x.isFile(),
      () => false
    )) {
      continue
    }

    if (shells.some(sh => filename.endsWith('.' + sh))) {
      log(filename)
    } else {
      promises.push(makePromise(filename))
    }
  }
  await Promise.all(promises)
  async function makePromise (filename: string) {
    const command = await shebangCommand(filename)
    if (command && shells.includes(command)) log(filename)
  }
}
