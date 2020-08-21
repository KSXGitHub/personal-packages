import { createReadStream } from 'fs'
import { createInterface } from 'readline'

const READ_STREAM_OPTIONS = { encoding: 'utf8' } as const

export function firstLine(filename: string) {
  const stream = createReadStream(filename, READ_STREAM_OPTIONS)
  const reader = createInterface(stream)
  let result: string
  reader.once('line', line => {
    result = line
    reader.close()
  })
  return new Promise<string>(resolve => {
    reader.once('close', () => resolve(result))
  })
}

export default firstLine
