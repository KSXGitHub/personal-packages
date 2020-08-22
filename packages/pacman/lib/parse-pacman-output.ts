import { pipe, asyncFlat, asyncMap, asyncFilter, asyncSplitLines } from 'iter-tools'
import { QU } from './utils/regexes'

/** Interface of a single line of `pacman -Qu` */
export interface QuLine {
  readonly packageName: string
  readonly oldVersion: string
  readonly newVersion: string
  readonly ignored: boolean
}

/** Parse a single line of `pacman -Qu` */
export function parseQuLine(line: string): QuLine | null {
  const execResult = QU.exec(line)
  if (!execResult) return null
  const { groups } = execResult
  return {
    packageName: groups!.name,
    oldVersion: groups!.old,
    newVersion: groups!.new,
    ignored: Boolean(groups!.ignored),
  }
}

/** Parse an stdout stream of `pacman -Qu` */
export function parseQuStream(input: AsyncIterable<string> | Iterable<string>) {
  return pipe(
    input,
    asyncFlat(1),
    asyncSplitLines,
    asyncMap(parseQuLine),
    asyncFilter((item): item is QuLine => item !== null),
  )
}
