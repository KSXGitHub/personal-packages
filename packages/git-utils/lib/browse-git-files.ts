import path from 'path'
import { SpawnOptions, spawn } from 'child_process'
import { cwd, exit } from 'process'
import { pipe, asyncMap, asyncFlat, asyncSplitLines, asyncFilter, asyncConcat } from 'iter-tools'
import { pathExists } from 'fs-extra'
import { parsePorcelainStatus } from './parse-porcelain-status'

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

export async function* gitStatus() {
  const cp = spawn('git', ['status', '--porcelain=v1'], spawnOptions)
  yield* pipe(
    cp.stdout!,
    lines,
    asyncFilter(line => Boolean(line)),
    asyncMap(parsePorcelainStatus),
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

export async function* changedFiles() {
  const prefix = path.relative(await findRepoRoot(), cwd())

  yield* pipe(
    gitStatus(),
    asyncMap(status => status.path),
    asyncFilter(name => name.startsWith(prefix)),
    asyncMap(name => path.relative(prefix, name)),
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
    untracked ? changedFiles() : [],
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
