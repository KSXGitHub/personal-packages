import { spawn } from 'child_process'
import { pipe, asyncFilter, asyncToArray } from 'iter-tools'
import { readFile, writeFile, ensureFile, pathExists } from 'fs-extra'
import { parseQuStream } from './parse-pacman-output'
import { QuLine } from './types'

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

/** Interface of sole parameter of {@link checkForUpdatesSingleCycle} */
export interface SingleCycleUpdateCheckerParams extends UpdateCheckerParams {
  /** File to store due date */
  readonly memoryFile: string
  /** Cycle period (in milliseconds) */
  readonly period: number
}

/** Interface of value yielded by {@link checkForUpdatesSingleCycle} */
export interface SingleCycleUpdateCheckerReturn {
  /** Out-of-date packages that are not ignored */
  readonly updates: readonly QuLine[]
  /** Next intended due date */
  readonly nextDueDate: Date
}

/**
 * If the date is due, check for updates, yield a single result, and update due date.
 *
 * This function is to run in an interval.
 */
export async function* checkForUpdatesSingleCycle(
  params: SingleCycleUpdateCheckerParams,
): AsyncGenerator<SingleCycleUpdateCheckerReturn> {
  const { memoryFile, period } = params
  const currentDate = Date.now()

  if (!await pathExists(memoryFile)) {
    await ensureFile(memoryFile)
    await writeFile(memoryFile, String(currentDate))
  }

  const dueDate = Number(await readFile(memoryFile, 'utf8'))
  if (currentDate >= dueDate) {
    const updates = await pipe(
      checkForUpdates(params),
      asyncFilter(item => !item.ignored),
      asyncToArray,
    )

    const nextDueDate = dueDate + period

    yield {
      updates,
      nextDueDate: new Date(nextDueDate),
    }

    await writeFile(memoryFile, String(nextDueDate))
  }
}
