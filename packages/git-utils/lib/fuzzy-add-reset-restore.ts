import { spawn, spawnSync } from 'child_process'
import { pipe, asyncFilter, asyncMap } from 'iter-tools'
import shellEscape from 'shell-escape'
import { trimNewLinesEnd } from './utils/trim-lf'
import gitStatus from './git-status'
import { Status, parsePorcelainStatus } from './parse-porcelain-status'

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
      return 2
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
      return 2
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
      return 3
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
  const { restoreCommand, ...rest } = param
  return fuzzyRestoreDelete({
    command: restoreCommand,
    question: 'Proceed with deletion?',
    when: status => status.value.plain === '??',
    ...rest,
  })
}

export namespace fuzzyDelete {
  export type Param = fuzzyRestoreDelete.CustomizedParam<'restoreCommand'>
}
