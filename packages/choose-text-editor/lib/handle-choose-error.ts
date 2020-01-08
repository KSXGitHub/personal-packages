import { dbg } from 'string-template-format'
import { Logger } from './console'
import { Status } from './status'

import {
  ChooseResult,
  Chosen,
  INDETERMINABLE_TTY,
  NOT_FOUND,
  PREFIXES_PARSING_FAILURE,
  INVALID_PREFIXES,
  NO_EDITOR
} from './choose-result'

export type ChooseError = Exclude<ChooseResult, Chosen>

export async function handleChooseError (logError: Logger, result: ChooseError) {
  switch (result.error) {
    case (INDETERMINABLE_TTY):
      logError('[ERROR] Cannot determine whether terminal is graphical or not')
      logError('help: You may set ISINTTY=true to use terminal editors, or ISINTTY=false to use graphical editors')
      return Status.IndeterminableTTY
    case (NOT_FOUND):
      logError('[ERROR] No editor detected')
      logError('help: Check if (at least one of) your editors are installed')
      logError('help: Check if there is any typo in your config')
      return Status.NotFound
    case (NO_EDITOR):
      logError('[ERROR] No suitable editor')
      logError('help: When ISINTTY=true, "terminal" property of your config must not be empty')
      logError('help: When ISINTTY=false, either "graphical" or "terminal" property of your config must not be empty')
      return Status.EmptyEditorSet
    case (PREFIXES_PARSING_FAILURE):
      logError('[ERROR] Failed to parse prefixes')
      logError('help: Content must be a valid yaml array of strings')
      logError(dbg`* env key: ${result.envKey}`)
      logError(dbg`* env value: ${result.envValue}`)
      logError(dbg`* error: ${String(result.errorObject)}`)
      return Status.InvalidPrefix
    case (INVALID_PREFIXES):
      logError('[ERROR] Prefixes does not satisfy its schema')
      logError('help: Instance must be an array of strings')
      logError(dbg`* env key: ${result.envKey}`)
      logError(dbg`* instance: ${result.instance}`)
      const { logSchemaErrors } = await import('./log-schema-errors')
      logSchemaErrors(result.validatorResult, logError)
      return Status.InvalidPrefix
  }
}
