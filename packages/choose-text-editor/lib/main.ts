import { dbg } from 'string-template-format'
import { ok, err } from '@tsfun/result'
import { Process } from './process'
import { Console } from './console'
import { Which } from './which'
import { SpawnSync } from './spawn-sync'
import { CosmiConfig } from './cosmiconfig'
import { CacheType } from './clear-cache'
import { validateEditorSet } from './validate'
import { logSchemaErrors } from './log-schema-errors'
import { choose } from './choose'
import { handleChooseError } from './handle-choose-error'
import { handleChooserValidation } from './handle-chooser-validation'
import { CommandHandlingMethod, handleChosenCommand } from './handle-chosen-command'
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

  // NOTE:
  //   * This function should be called only once for each branch
  //   * Add test to guarantee this!
  //   * Should this be called more than once, exec-once will be needed
  const configExplorer = () => param.cosmiconfig(param.packageName, {
    searchPlaces: param.searchPlaces,
    packageProp: param.packageProp,
    cache: param.cache,
    stopDir: param.stopDir
  })

  /* UNRELATED COMMANDS */

  if (param.clearCache) {
    const mod = await import('./clear-cache')
    mod.clearCache(configExplorer(), param.clearCache)
    return Status.Success
  }

  if (param.showStatus) {
    const mod = await import('./show-status')
    mod.showStatus(logInfo)
    return Status.Success
  }

  /* LOAD CONFIGURATION FILE */

  const searchResult = await configExplorer().search().then(ok, err)

  if (!searchResult.tag) {
    logError('[ERROR] Fail to load configuration file')
    logError(dbg`* message: ${String(searchResult.error)}`)
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

  if (!handleChooserValidation(logError, editorSet.chooser, param.packageName, param.packageVersion)) {
    return Status.UnsatisfiedChooser
  }

  /* CHOOSE A COMMAND */

  const result = await param.choose({ env, which, editorSet })
  if (result.error) return handleChooseError(logError, result)

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
