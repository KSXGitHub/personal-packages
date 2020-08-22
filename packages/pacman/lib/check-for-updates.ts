import { spawn } from 'child_process'
import { parseQuStream } from './parse-pacman-output'

/** Interface of sole parameter of {@link checkForUpdates} */
export interface UpdateCheckerParams {
  /** Package Manager to use, default is `"pacman"` */
  readonly packageManager?: string
  /** Arguments to add after `-Qu`, default is `[]` */
  readonly additionalArguments?: Iterable<string>
}

/** Run `pacman -Qu` and return a stream of results */
export function checkForUpdates(params: UpdateCheckerParams = {}) {
  const {
    packageManager = 'pacman',
    additionalArguments = [],
  } = params

  const cp = spawn(packageManager, ['-Qu', ...additionalArguments])
  return parseQuStream(cp.stdout)
}
