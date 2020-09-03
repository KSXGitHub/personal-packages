import path from 'path'
import { SpawnOptions, spawn } from 'child_process'
import { cwd, exit } from 'process'
import { pipe, asyncMap, asyncFilter, asyncConcat } from 'iter-tools'
import { pathExists } from 'fs-extra'
import lines from './utils/lines'
import gitStatus from './git-status'

const spawnOptions: SpawnOptions = {
  stdio: ['pipe', 'pipe', 'inherit'],
}

export function gitLsFiles() {
  const cp = spawn('git', ['ls-files'], spawnOptions)
  return lines(cp.stdout!)
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

export function browseGitFiles(param: browseGitFiles.Param): Promise<number> {
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

export namespace browseGitFiles {
  export interface Param {
    readonly fuzzyFinder: string
    readonly untracked: boolean
  }
}

export async function browseGitFilesProgram(defaultFuzzyFinder?: string) {
  const { default: yargs } = await import('yargs')

  const param: browseGitFiles.Param = yargs
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

  const status = await browseGitFiles(param)
  return exit(status)
}
