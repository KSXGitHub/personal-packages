import { SpawnOptions, spawn } from 'child_process'
import { pipe, asyncMap, asyncFlat, asyncSplitLines, asyncFilter, asyncConcat } from 'iter-tools'

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

export async function* untrackedFiles() {
  yield* pipe(
    gitStatus(),
    asyncMap(status => status.name),
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
      cp.stdin.write(line + '\n')
    }
  })
}

export async function program(defaultFuzzyFinder?: string) {
  const { exit } = await import('process')
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
