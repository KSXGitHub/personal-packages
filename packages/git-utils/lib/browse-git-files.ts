import path from 'path'
import { SpawnOptions, spawn } from 'child_process'
import { cwd, exit } from 'process'
import { pipe, asyncMap, asyncFlat, asyncSplitLines, asyncFilter, asyncConcat } from 'iter-tools'
import { pathExists } from 'fs-extra'

const spawnOptions: SpawnOptions = {
  stdio: ['pipe', 'pipe', 'inherit'],
}

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

export function gitLsFiles() {
  const cp = spawn('git', ['ls-files'], spawnOptions)
  return lines(cp.stdout!)
}

export interface GitStatus {
  readonly status: string
  readonly name: string
}

const PORCELAIN_STATUS_REGEX = /^(?<status>..) (?<name>.*)$/

export function parsePorcelainLine(line: string): GitStatus | null {
  const result = PORCELAIN_STATUS_REGEX.exec(line)
  if (!result) return null
  return result.groups as any
}

export async function* gitStatus() {
  const cp = spawn('git', ['status', '--porcelain=v1'], spawnOptions)
  yield* pipe(
    cp.stdout!,
    lines,
    asyncMap(parsePorcelainLine),
    asyncFilter((status): status is GitStatus => status !== null),
  )
}

export async function findRepoRoot() {
  let current = cwd()
  while (!await pathExists(path.resolve(current, '.git'))) {
    const parent = path.dirname(current)
    if (parent === current) throw new Error('Not a git repo')
    current = parent
  }
  return current
}

export async function* untrackedFiles() {
  const workingDirectory = cwd()
  const repoRoot = await findRepoRoot()
  let prefix: string
  if (workingDirectory.startsWith(repoRoot)) {
    prefix = workingDirectory.slice(repoRoot.length)
  } else {
    throw new Error(`Working directory (${workingDirectory}) does not belong to repo root (${repoRoot})`)
  }

  yield* pipe(
    gitStatus(),
    asyncMap(status => status.name),
    asyncFilter(name => name.startsWith(prefix)),
    asyncMap(name => name.slice(prefix.length)),
  )
}

export interface Param {
  readonly fuzzyFinder: string
  readonly untracked: boolean
}

export function main(param: Param): Promise<number> {
  const {
    fuzzyFinder,
    untracked,
  } = param

  const inputLines = asyncConcat(
    gitLsFiles(),
    untracked ? untrackedFiles() : [],
  )

  const [program, ...args] = fuzzyFinder.split(/\s+/).filter(Boolean)
  const cp = spawn(program, args, {
    stdio: ['pipe', 'inherit', 'inherit'],
  })

  return new Promise(async (resolve, reject) => {
    cp.on('error', reject)
    cp.on('close', resolve)

    for await (const line of inputLines) {
      if (line.trim()) cp.stdin.write(line + '\n')
    }
  })
}

export async function program(defaultFuzzyFinder?: string) {
  const { default: yargs } = await import('yargs')

  const param: Param = yargs
    .option('fuzzyFinder', {
      alias: ['P'],
      type: 'string',
      describe: 'Command to spawn fuzzy finder',
      ...defaultFuzzyFinder ? { default: defaultFuzzyFinder } : { required: true },
    })
    .option('untracked', {
      alias: ['u'],
      type: 'boolean',
      describe: 'Also list untracked files',
      default: false,
    })
    .help()
    .argv

  const status = await main(param)
  return exit(status)
}
