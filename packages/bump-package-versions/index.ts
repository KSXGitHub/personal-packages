import semver from 'semver'
import { dbg } from 'string-template-format-inspect'

export type SemVer = semver.SemVer

export const enum ChangeType {
  OfficialRelease = 'official',
  BreakingChange = 'break',
  FeatureAddition = 'feature',
  Patch = 'patch'
}

export const enum ReleaseType {
  Major = 'major',
  Minor = 'minor',
  Patch = 'patch'
}

export function getReleaseType (version: SemVer, change: ChangeType): ReleaseType {
  switch (change) {
    case ChangeType.OfficialRelease:
      if (version.major) return ReleaseType.Patch
      return ReleaseType.Major
    case ChangeType.BreakingChange:
      if (version.major) return ReleaseType.Major
      if (version.minor) return ReleaseType.Minor
      return ReleaseType.Patch
    case ChangeType.FeatureAddition:
      if (version.major) return ReleaseType.Minor
      return ReleaseType.Patch
    case ChangeType.Patch:
      return ReleaseType.Patch
  }
}

export function incSemVer (version: SemVer, change: ChangeType): SemVer {
  return version.inc(getReleaseType(version, change))
}

export interface FileSystem {
  readFile (filename: string, encoding: 'utf8'): string | Promise<string>
  writeFile (filename: string, content: string): void | Promise<void>
}

export interface Console {
  info (message: string): void
  error (message: string): void
}

export interface Process<Return> {
  exit (status: ExitStatus): Return
}

export const enum ExitStatus {
  Success = 0,
  Failure = 1
}

export interface Options<ExitReturn> {
  readonly filenames: Iterable<string> | AsyncIterable<string>
  readonly changeType: ChangeType
  readonly skipPrivate: boolean
  readonly jsonIndent: number
  readonly finalNewLines: number
  readonly fs: FileSystem
  readonly console: Console
  readonly process: Process<ExitReturn>
}

export async function bumpPackageVersions<ExitReturn> (options: Options<ExitReturn>) {
  const { parse } = await import('semver')
  const { load, dump } = await import('just-json-type')

  const {
    filenames,
    changeType,
    skipPrivate,
    jsonIndent,
    finalNewLines,
    fs,
    console,
    process
  } = options

  const inc = (ver: SemVer) => incSemVer(ver, changeType)

  let errorCount = 0

  function addError (message: string, filename: string, content: any) {
    console.error(`[ERROR] ${message}`)
    console.error(dbg`[INFO] filename: ${filename}`)
    console.error(dbg`[INFO] content: ${content}`)
    errorCount += 1
  }

  let act = async () => undefined as void
  function addAct (
    filename: string,
    jsonObject: import('just-json-type').WritableJsonObject<never>,
    oldVer: string,
    newVer: string
  ): void {
    console.info(dbg`bump> ${filename}: ${oldVer} → ${newVer}`)

    const prev = act
    act = async () => {
      jsonObject.version = newVer
      const outputText = dump(jsonObject, undefined, jsonIndent) + '\n'.repeat(finalNewLines)
      const promise = fs.writeFile(filename, outputText)
      await prev()
      await promise
    }
  }

  for await (const filename of filenames) {
    const inputText = await fs.readFile(filename, 'utf8')
    const jsonObject = load(inputText)

    if (!jsonObject || typeof jsonObject !== 'object' || jsonObject instanceof Array) {
      addError('JSON content is not an object', filename, jsonObject)
      continue
    }

    const { version } = jsonObject
    if (typeof version !== 'string') {
      addError(`"version" value is not a string`, filename, version)
      continue
    }

    const semver = parse(version)
    if (!semver) {
      addError(`"version" value is not a valid semver`, filename, version)
      continue
    }

    if (skipPrivate && jsonObject.private) {
      console.info(dbg`skip> ${filename} ("private": ${jsonObject.private})`)
      continue
    }

    const newVer = inc(semver).raw
    addAct(filename, jsonObject, version, newVer)
  }

  if (errorCount) {
    console.info(`[SUMMARY] Encountered ${errorCount} errors`)
    return process.exit(ExitStatus.Failure)
  }

  await act()
  return process.exit(ExitStatus.Success)
}

export default bumpPackageVersions
