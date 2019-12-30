import escape from 'shell-escape'
import { Process } from './process'
import { Which } from './which'
import { EditorSet } from './editors'
import { choose } from './choose'
import { INDETERMINABLE_TTY, NOT_FOUND } from './errors'
import { Status } from './status'

export interface MainParam<ExitReturn> {
  readonly process: Process<ExitReturn>
  readonly which: Which
  readonly editorSet: EditorSet
  readonly choose: typeof choose
}

export async function main<Return> (param: MainParam<Return>): Promise<Return> {
  const { process, which, editorSet, choose } = param
  const { env, stdout, stderr, exit } = process
  const result = await choose({ env, which, editorSet })

  if (!result.tag) {
    switch (result.error) {
      case (INDETERMINABLE_TTY):
        stderr.write('[ERROR] Cannot determine whether terminal is graphical or not.')
        return exit(Status.IndeterminableTTY)
      case (NOT_FOUND):
        stderr.write('[ERROR] No editor detected.')
        return exit(Status.NotFound)
    }
  }

  const { path, args } = result.value
  const message = escape([path, ...args])
  stdout.write(message)
  return exit(Status.Success)
}
