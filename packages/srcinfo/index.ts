import { Result, Ok, Err, ok, err } from '@tsfun/result'
export type { Result, Ok, Err }

const requiredFields = [
  'pkgver',
  'pkgrel',
  'epoch',
] as const

const partialFields = [
  'pkgdesc',
  'url',
  'install',
  'changelog',
] as const

const arrayFields = [
  'arch',
  'groups',
  'license',
  'noextract',
  'options',
  'backup',
  'validgpgkeys',
  'source',
  'depends',
  'checkdepends',
  'makedepends',
  'optdepends',
  'provides',
  'conflicts',
  'replaces',
  'md5sums',
  'sha1sums',
  'sha224sums',
  'sha256sums',
  'sha348sums',
  'sha512sums',
] as const

/** Field that always appear in `.SRCINFO` */
export type RequiredField = typeof requiredFields[number]
/** Field that appears at most once in `.SRCINFO` */
export type PartialField = typeof partialFields[number]
/** Field that may appear multiple times in `.SRCINFO` */
export type ArrayField = typeof arrayFields[number]

/** Interface of `.SRCINFO` */
export type SrcInfo = Readonly<
  & Record<RequiredField, string>
  & Partial<Record<PartialField, string>>
  & Record<ArrayField, readonly string[]>
>

function parseLine(line: string): readonly [string, string] | null {
  const result = /(?<key>[^\s]+)\s*=\s*(?<value>[^\s]+)/.exec(line)
  if (!result) return null
  const { key, value } = result.groups!
  return [key, value]
}

type SrcInfoLines = ReadonlyArray<readonly [string, string]>

const getUnique = (
  source: SrcInfoLines,
  key: RequiredField | PartialField,
) => source.find(pair => key === pair[0])?.[1] ?? null

const getArray = (
  source: SrcInfoLines,
  key: ArrayField,
) => source.filter(pair => key === pair[0]).map(pair => pair[1])

export type SrcInfoError =
  & Readonly<
    | { type: 'Syntax', line: string, index: number }
    | { type: 'MissingRequiredField', field: RequiredField }
  >
  & { readonly message: string }

/** Parse content of a `.SRCINFO` file */
export function parseSrcInfo(source: string): Result<SrcInfo, readonly SrcInfoError[]> {
  const lines = source
    .split('\n') // LF is sufficient, no needs for CRLF
    .map((line, index) => ({ line, index }))
    .filter(x => x.line.trim())
    .map(({ line, index }) => ({ line, index, entry: parseLine(line) }))

  const errors: SrcInfoError[] = []

  for (const { line, index, entry } of lines) {
    if (!entry) {
      errors.push({
        type: 'Syntax',
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
