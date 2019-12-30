import { concat } from 'iter-tools'
import { Result, ok, err } from '@tsfun/result'
import { Env } from './process'
import { Which } from './which'
import { EditorSet } from './editors'
import { Command } from './command'
import { STR2BOOL } from './str-to-bool'
import { NotFound, NOT_FOUND, IndeterminableTTY, INDETERMINABLE_TTY } from './errors'

export interface ChooseParam {
  readonly env: Env
  readonly which: Which
  readonly editorSet: EditorSet
}

export type ChooseResult = Result<Command, NotFound | IndeterminableTTY>

export async function choose (param: ChooseParam): Promise<ChooseResult> {
  const { env, which, editorSet } = param
  const { FORCE_EDITOR, FORCE_EDITOR_PREFIXES = '[]', ISINTTY } = env
  const prefixes = JSON.parse(FORCE_EDITOR_PREFIXES)

  if (FORCE_EDITOR) {
    return ok({ path: FORCE_EDITOR, args: JSON.parse(FORCE_EDITOR_PREFIXES) })
  }

  const isInTty = STR2BOOL[ISINTTY as any]

  if (typeof isInTty !== 'boolean') return err(INDETERMINABLE_TTY)

  const candidates = isInTty
    ? editorSet.terminal || []
    : concat(editorSet.graphical || [], editorSet.terminal || [])

  for (const editor of candidates) {
    const command = await Command({
      editor,
      which,
      prefixes
    })

    if (command.tag) return command
  }

  return err(NOT_FOUND)
}
