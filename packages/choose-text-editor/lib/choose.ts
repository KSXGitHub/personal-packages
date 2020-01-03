import { safeLoad } from 'js-yaml'
import { tryExec } from '@tsfun/result'
import { concatWithLength } from '@khai96x/utils'
import { Env } from './process'
import { Which } from './which'
import { EditorSet } from './editors'
import { Command } from './command'
import { STR2BOOL } from './str-to-bool'
import { JsonSchemaValidatorResult } from './json-schema'
import { validateCliArguments } from './validate'

import {
  NotFound,
  NoEditor,
  IndeterminableTTY,
  PrefixesParsingFailure,
  Chosen,
  ChooseResult,
  InvalidPrefixes
} from './choose-result'

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

  let validatorResult: JsonSchemaValidatorResult
  if (!validateCliArguments(prefixes, result => {
    validatorResult = result
  })) {
    return InvalidPrefixes(
      // @ts-ignore
      validatorResult,
      prefixes,
      'FORCE_EDITOR_PREFIXES'
    )
  }

  if (FORCE_EDITOR) {
    return Chosen({ path: FORCE_EDITOR, args: prefixes })
  }

  const isInTty = STR2BOOL[ISINTTY as any]

  if (typeof isInTty !== 'boolean') return IndeterminableTTY()

  const candidates = isInTty
    ? editorSet.terminal || []
    : concatWithLength(editorSet.graphical || [], editorSet.terminal || [])

  if (!candidates.length) return NoEditor()

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
