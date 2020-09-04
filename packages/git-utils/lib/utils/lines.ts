import { pipe, asyncMap, asyncFlat, asyncSplitLines } from 'iter-tools'

interface Chunk {
  toString(): string
}

export async function* lines(chunks: AsyncIterable<Chunk>) {
  yield* pipe(
    chunks,
    asyncMap(String),
    asyncFlat(1),
    asyncSplitLines,
  )
}

export default lines
