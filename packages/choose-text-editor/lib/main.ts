import { dbg } from 'string-template-format'
import { ok, err } from '@tsfun/result'
import { Process } from './process'
import { Console } from './console'
import { Which } from './which'
import { SpawnSync } from './spawn-sync'
import { CosmiConfig } from './cosmiconfig'
import { CacheType } from './clear-cache'
import { validateEditorSet, validateChooser } from './validate'
import { logSchemaErrors } from './log-schema-errors'
import { choose } from './choose'
import { CommandHandlingMethod, handleChosenCommand } from './handle-chosen-command'
import { INDETERMINABLE_TTY, NOT_FOUND, PREFIXES_PARSING_FAILURE, INVALID_PREFIXES, NO_EDITOR } from './choose-result'
import { PACKAGE_NAME } from './constants'
import { Status } from './status'

export interface MainParam {
  readonly process: Process
  readonly console: Console
  readonly which: Which
  readonly spawnSync: SpawnSync
  readonly packageName: string
  readonly packageVersion: string
  readonly cosmiconfig: CosmiConfig
  readonly searchPlaces: string[]
  readonly packageProp: string
  readonly cache?: boolean
  readonly stopDir?: string
  readonly clearCache?: CacheType
  readonly showStatus?: boolean
  readonly onChosen: CommandHandlingMethod
  readonly args: readonly string[]
  readonly choose: typeof choose
}

export async function main (param: MainParam): Promise<Status> {
  const { which } = param
  const { env } = param.process
  const { info: logInfo, error: logError } = param.console

  const configExplorer = param.cosmiconfig(param.packageName, {
    searchPlaces: param.searchPlaces,
    packageProp: param.packageProp,
    cache: param.cache,
    stopDir: param.stopDir
  })

  /* UNRELATED COMMANDS */

  if (param.clearCache) {
    const mod = await import('./clear-cache')
    mod.clearCache(configExplorer, param.clearCache)
    return Status.Success
  }

  if (param.showStatus) {
    const mod = await import('./show-status')
    mod.showStatus(logInfo)
    return Status.Success
  }

  /* LOAD CONFIGURATION FILE */

  const searchResult = await configExplorer.search().then(ok, err)

  if (!searchResult.tag) {
    logError('[ERROR] Fail to load configuration file')
    logError(dbg`* message: ${searchResult.error}`)
    return Status.ConfigLoadingFailure
  }

  if (!searchResult.value) {
    logError('[ERROR] No config file found')
    logError(dbg`* search places ${param.searchPlaces}`)
    return Status.ConfigNotFound
  }

  if (searchResult.value.isEmpty) {
    logError('[ERROR] Config is empty')
    logError(dbg`* config file: ${searchResult.value.filepath}`)
    logError(dbg`* config: ${searchResult.value.config}`)
    return Status.EmptyConfig
  }

  /* VERIFY LOADED CONFIGURATION */

  const editorSet = searchResult.value.config

  if (!validateEditorSet(editorSet, validatorResult => {
    logError('[ERROR] Config does not satisfy schema')
    logSchemaErrors(validatorResult, logError)
  })) {
    return Status.InvalidEditorSet
  }

  if (!validateChooser(editorSet.chooser, param.packageName, param.packageVersion, {
    onInvalidPackageName (config, used) {
      logError('[ERROR] Invalid chooser')
      logError(dbg`* config package: ${config}`)
      logError(dbg`* used package: ${used}`)
    },

    onInvalidVersionRange (versionRange) {
      logError('[ERROR] Invalid version range for chooser')
      logError('help: Read https://docs.npmjs.com/misc/semver#ranges for valid version range syntax')
      logError(dbg`* config version range: ${versionRange}`)
    },

    onNonEmptyPath (path) {
      logError('[ERROR] Package path is expected to NOT be specified, but it was')
      logError(dbg`* config path: ${path}`)
    },

    onUnsatisfiedVersion (expectedVersionRange, receivedVersion) {
      logError('[ERROR] Incompatible chooser')
      logError(`help: This version of ${PACKAGE_NAME} does not satisfied what is required in config`)
      logError(`help: Please update ${PACKAGE_NAME} or your config`)
      logError(dbg`* config version: ${expectedVersionRange}`)
      logError(dbg`* used version: ${receivedVersion}`)
    }
  })) {
    return Status.UnsatisfiedChooser
  }

  /* CHOOSE A COMMAND */

  const result = await param.choose({ env, which, editorSet })

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
      logError(`* env key: ${result.envKey}`)
      logError(`* env value: ${result.envValue}`)
      logError(`* error: ${result.errorObject}`)
      return Status.InvalidPrefix
    case (INVALID_PREFIXES):
      logError('[ERROR] Prefixes does not satisfied its schema')
      logError('help: Instance must be an array of strings')
      logError(`* env key: ${result.envKey}`)
      logError(`* instance: ${result.instance}`)
      logSchemaErrors(result.validatorResult, logError)
      return Status.InvalidPrefix
  }

  /* HANDLE CHOSEN COMMAND */

  return handleChosenCommand({
    handle: param.onChosen,
    command: result.command,
    args: param.args,
    logInfo,
    logError,
    spawnSync: param.spawnSync
  })
}
