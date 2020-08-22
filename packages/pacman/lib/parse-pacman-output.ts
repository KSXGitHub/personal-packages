import { pipe, asyncFlat, asyncMap, asyncFilter, asyncSplitLines } from 'iter-tools'
import { QuLine } from './types'
import { QU } from './utils/regexes'

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

interface ToString {
  toString(this: this): string
}

type Stream = AsyncIterable<ToString> | Iterable<ToString>

/** Parse an stdout stream of `pacman -Qu` */
export function parseQuStream(input: Stream) {
  return pipe(
    input,
    asyncMap(String),
    asyncFlat(1),
    asyncSplitLines,
    asyncMap(parseQuLine),
    asyncFilter((item): item is QuLine => item !== null),
  )
}
