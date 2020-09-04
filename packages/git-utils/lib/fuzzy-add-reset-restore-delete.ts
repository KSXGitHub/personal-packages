import { spawn, spawnSync } from 'child_process'
import { pipe, asyncFilter, asyncMap } from 'iter-tools'
import shellEscape from 'shell-escape'
import { trimNewLinesEnd } from './utils/trim-lf'
import gitStatus from './git-status'
import { Status, parsePorcelainStatus } from './parse-porcelain-status'

const enum ExitStatusCode {
  Success = 0,
  GenericFailure = 1,
  EmptyStdout = 2,
  UserCancellation = 3,
}

export async function fuzzySelectChange(param: fuzzySelectChange.Param): Promise<fuzzySelectChange.Return> {
  const {
    fuzzyFinder,
    when,
  } = param

  const inputLines = pipe(
    gitStatus(),
    asyncFilter(when),
    asyncMap(status => status.plain),
  )

  const [fuzzyFinderProgram, ...fuzzyFinderArgs] = fuzzyFinder.split(/\s+/).filter(Boolean)
  const cp = spawn(fuzzyFinderProgram, fuzzyFinderArgs, {
    stdio: ['pipe', 'pipe', 'inherit'],
  })

  const { status, stdout } = await new Promise<{
    readonly status: number
    readonly stdout: string
  }>(async (resolve, reject) => {
    let stdout = ''
    cp.on('error', reject)
    cp.on('close', status => resolve({ status, stdout: trimNewLinesEnd(stdout) }))
    cp.stdout.on('data', chunk => stdout += String(chunk))

    for await (const line of inputLines) {
      cp.stdin.write(line + '\n')
    }
  })

  if (status) {
    return {
      tag: 'NonZeroReturn',
      cpStatus: status,
      message: `Command '${fuzzyFinder}' exited with code ${status}`,
    }
  }
  if (!stdout) {
    return {
      tag: 'EmptyStdout',
      message: `Command '${fuzzyFinder}' wrote nothing to stdout`,
    }
  }
  return {
    tag: 'Success',
    gitStatus: stdout.split('\n').map(parsePorcelainStatus),
  }
}

export namespace fuzzySelectChange {
  export interface Param {
    readonly fuzzyFinder: string
    readonly when: (status: Status) => boolean
  }

  export type Return = Readonly<
    | { tag: 'NonZeroReturn', cpStatus: number, message: string }
    | { tag: 'EmptyStdout', message: string }
    | { tag: 'Success', gitStatus: readonly Status[] }
  >
}

function executeStringCommand(command: string, suffix: Iterable<string>): number {
  const [program, ...prefix] = command.split(/\s+/).filter(Boolean)
  if (!program) throw new Error('command is empty')
  const { error, status } = spawnSync(command, [...prefix, ...suffix], { stdio: 'inherit' })
  if (error) throw error
  return status!
}

function logStringCommand(command: string, suffix: Iterable<string>): 0 {
  console.info(command.trimEnd(), shellEscape([...suffix]))
  return 0
}

const actionDict = { execute: executeStringCommand, log: logStringCommand } as const

async function fuzzyAddReset(param: fuzzyAddReset.Param) {
  const {
    fuzzyFinder,
    command,
    action,
    when,
  } = param

  const selectionResult = await fuzzySelectChange({
    fuzzyFinder,
    when,
  })

  switch (selectionResult.tag) {
    case 'NonZeroReturn':
      return selectionResult.cpStatus
    case 'EmptyStdout':
      console.error(selectionResult.message)
      return ExitStatusCode.EmptyStdout
    case 'Success':
      break
  }

  const suffix = selectionResult.gitStatus.map(status => status.path)
  return actionDict[action](command, suffix)
}

namespace fuzzyAddReset {
  export interface Param {
    readonly fuzzyFinder: string
    readonly command: string
    readonly action: 'log' | 'execute'
    readonly when: (status: Status) => boolean
  }

  export type CustomizedParam<CommandField extends string> =
    & Pick<Param, 'fuzzyFinder' | 'action'>
    & Readonly<Record<CommandField, string>>
}

export function fuzzyAdd(param: fuzzyAdd.Param) {
  const { addCommand, ...rest } = param
  return fuzzyAddReset({
    command: addCommand,
    when: ({ value }) => value.plain === '??' || value.unstaged !== ' ',
    ...rest,
  })
}

export namespace fuzzyAdd {
  export type Param = fuzzyAddReset.CustomizedParam<'addCommand'>
}

export function fuzzyReset(param: fuzzyReset.Param) {
  const { resetCommand, ...rest } = param
  return fuzzyAddReset({
    command: resetCommand,
    when: ({ value }) => value.plain !== '??' && value.staged !== ' ',
    ...rest,
  })
}

export namespace fuzzyReset {
  export type Param = fuzzyAddReset.CustomizedParam<'resetCommand'>
}

export async function fuzzyRestoreDelete(param: fuzzyRestoreDelete.Param) {
  const {
    fuzzyFinder,
    command,
    action,
    noConfirm,
    when,
    question,
  } = param

  const selectionResult = await fuzzySelectChange({
    fuzzyFinder,
    when,
  })

  switch (selectionResult.tag) {
    case 'NonZeroReturn':
      return selectionResult.cpStatus
    case 'EmptyStdout':
      console.error(selectionResult.message)
      return ExitStatusCode.EmptyStdout
    case 'Success':
      break
  }

  const suffix = selectionResult.gitStatus.map(status => status.path)

  if (!noConfirm) {
    const { askYesNo } = await import('./utils/ask-yes-no')
    console.error(`targets (${suffix.length})`, suffix)
    const userConfirmation = await askYesNo(question)
    if (!userConfirmation) {
      console.error('action aborted by user')
      return ExitStatusCode.UserCancellation
    }
  }

  return actionDict[action](command, suffix)
}

export namespace fuzzyRestoreDelete {
  export interface Param {
    readonly fuzzyFinder: string
    readonly command: string
    readonly action: 'log' | 'execute'
    readonly noConfirm: boolean
    readonly when: (status: Status) => boolean
    readonly question: string
  }

  export type CustomizedParam<CommandField extends string> =
    & Pick<Param, 'fuzzyFinder' | 'action' | 'noConfirm'>
    & Readonly<Record<CommandField, string>>
}

export function fuzzyRestore(param: fuzzyRestore.Param) {
  const { restoreCommand, ...rest } = param
  return fuzzyRestoreDelete({
    command: restoreCommand,
    question: 'Proceed with restoration?',
    when: ({ value }) => value.plain !== '??' && value.unstaged !== ' ',
    ...rest,
  })
}

export namespace fuzzyRestore {
  export type Param = fuzzyRestoreDelete.CustomizedParam<'restoreCommand'>
}

export function fuzzyDelete(param: fuzzyDelete.Param) {
  const { deleteCommand, ...rest } = param
  return fuzzyRestoreDelete({
    command: deleteCommand,
    question: 'Proceed with deletion?',
    when: status => status.value.plain === '??',
    ...rest,
  })
}

export namespace fuzzyDelete {
  export type Param = fuzzyRestoreDelete.CustomizedParam<'deleteCommand'>
}

async function yargsPrefix(defaultAction: 'log' | 'execute') {
  const { default: yargs } = await import('yargs')
  return yargs
    .option('fuzzyFinder', {
      alias: ['P'],
      type: 'string',
      describe: 'Command to spawn fuzzy finder',
      default: 'sk',
    })
    .option('action', {
      alias: ['x'],
      choices: ['log', 'execute'],
      describe: 'Whether to log the command or to execute it',
      default: defaultAction,
    })
}

function yargsPrefix1() {
  return yargsPrefix('execute')
}

async function yargsPrefix2() {
  return (await yargsPrefix('log'))
    .option('noConfirm', {
      alias: ['y'],
      type: 'boolean',
      describe: 'Proceed final action without user answering yes/no question',
      default: false,
    })
}

export async function fuzzyAddProgram() {
  const param: fuzzyAdd.Param = (await yargsPrefix1())
    .option('addCommand', {
      type: 'string',
      describe: 'Substitute to `git add` command',
      default: 'git add -v --',
    })
    .env('GIT_FUZZY')
    .help()
    .argv

  return fuzzyAdd(param)
}

export async function fuzzyResetProgram() {
  const param: fuzzyReset.Param = (await yargsPrefix1())
    .option('resetCommand', {
      type: 'string',
      describe: 'Substitute to `git add` command',
      default: 'git reset --',
    })
    .env('GIT_FUZZY')
    .help()
    .argv

  return fuzzyReset(param)
}

export async function fuzzyRestoreProgram() {
  const param: fuzzyRestore.Param = (await yargsPrefix2())
    .option('restoreCommand', {
      type: 'string',
      describe: 'Substitute to `git restore` command',
      default: 'git restore --',
    })
    .env('GIT_FUZZY')
    .help()
    .argv

  return fuzzyRestore(param)
}

export async function fuzzyDeleteProgram() {
  const param: fuzzyDelete.Param = (await yargsPrefix2())
    .option('deleteCommand', {
      type: 'string',
      describe: 'Substitute to `git restore` command',
      default: 'rm -v --',
    })
    .env('GIT_FUZZY')
    .help()
    .argv

  return fuzzyDelete(param)
}
