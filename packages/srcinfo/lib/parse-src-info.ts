import { Result, ok, err } from '@tsfun/result'
import { RequiredField, PartialField, ArrayField, SrcInfo, ParseError } from './types'
import { requiredFields, partialFields, arrayFields } from '../utils/fields'

function parseLine(line: string): readonly [string, string] | null {
  const result = /^\s*(?<key>[^\s]+)\s*=\s*(?<value>.+)\s*$/.exec(line)
  if (!result) return null
  const { key, value } = result.groups!
  return [key, value]
}

type SrcInfoLines = ReadonlyArray<readonly [string, string]>

const getUnique = (
  source: SrcInfoLines,
  key: RequiredField | PartialField,
) => source.find(pair => key === pair[0])?.[1]

const getArray = (
  source: SrcInfoLines,
  key: ArrayField,
) => source.filter(pair => key === pair[0]).map(pair => pair[1])

/** Parse content of a `.SRCINFO` file */
export function parseSrcInfo(source: string): Result<SrcInfo, readonly ParseError[]> {
  const lines = source
    .split('\n') // LF is sufficient, no needs for CRLF
    .map((line, index) => ({ line, index }))
    .filter(x => x.line.trim())
    .map(({ line, index }) => ({ line, index, entry: parseLine(line) }))

  const errors: ParseError[] = []

  for (const { line, index, entry } of lines) {
    if (!entry) {
      errors.push({
        type: 'InvalidSyntax',
        line,
        index,
        message: `Line ${index + 1} is invalid`,
      })
    }
  }

  for (const field of requiredFields) {
    if (!lines.some(x => field === x.entry![0])) {
      errors.push({
        type: 'MissingRequiredField',
        field,
        message: `Field "${field}" is required but not found`,
      })
    }
  }

  if (errors.length) return err(errors)

  const parsedSource: SrcInfoLines = lines.map(x => x.entry!)

  const uniques = Object.fromEntries(
    [...requiredFields, ...partialFields].map(field => [field, getUnique(parsedSource, field)]),
  )

  const arrays = Object.fromEntries(
    arrayFields.map(field => [field, getArray(parsedSource, field)]),
  )

  return ok({ ...uniques, ...arrays } as any)
}

export default parseSrcInfo
