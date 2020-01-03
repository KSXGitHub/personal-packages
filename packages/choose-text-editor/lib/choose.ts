// TODO ASAP: Handle FORCE_EDITOR_PREFIXES not being valid JSON
// TODO ASAP: Use YAML for FORCE_EDITOR_PREFIXES
// TODO ASAP: Differentiate between when which finds no editor (NOT_FOUND) and editor set being empty (NO_EDITOR)

import { concat } from 'iter-tools'
import { safeLoad } from 'js-yaml'
import { tryExec } from '@tsfun/result'
import { Env } from './process'
import { Which } from './which'
import { EditorSet } from './editors'
import { Command } from './command'
import { STR2BOOL } from './str-to-bool'
import { NotFound, IndeterminableTTY, PrefixesParsingFailure, Chosen, ChooseResult } from './choose-result'

export interface ChooseParam {
  readonly env: Env
  readonly which: Which
  readonly editorSet: EditorSet
}

export async function choose (param: ChooseParam): Promise<ChooseResult> {
  const { env, which, editorSet } = param
  const { FORCE_EDITOR, FORCE_EDITOR_PREFIXES = '[]', ISINTTY } = env

  const prefixesResult = tryExec(() => safeLoad(FORCE_EDITOR_PREFIXES))
  if (!prefixesResult.tag) {
    return PrefixesParsingFailure(
      prefixesResult.error,
      FORCE_EDITOR_PREFIXES,
      'FORCE_EDITOR_PREFIXES'
    )
  }

  const prefixes = prefixesResult.value

  if (FORCE_EDITOR) {
    return Chosen({ path: FORCE_EDITOR, args: prefixes })
  }

  const isInTty = STR2BOOL[ISINTTY as any]

  if (typeof isInTty !== 'boolean') return IndeterminableTTY()

  const candidates = isInTty
    ? editorSet.terminal || []
    : concat(editorSet.graphical || [], editorSet.terminal || [])

  for (const editor of candidates) {
    const command = await Command({
      editor,
      which,
      prefixes
    })

    if (command.tag) return Chosen(command.value)
  }

  return NotFound()
}
