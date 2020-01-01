import escape from 'shell-escape'
import { dbg } from 'string-template-format'
import { ok, err } from '@tsfun/result'
import { name as MODULE_NAME } from '../package.json'
import { Process } from './process'
import { Which } from './which'
import { CosmiConfig } from './cosmiconfig'
import { CacheType } from './clear-cache'
import { assertEditorSet } from './assert'
import { choose } from './choose'
import { INDETERMINABLE_TTY, NOT_FOUND } from './errors'
import { Status } from './status'
import { LoggerPair } from './utils'

export interface MainParam<ExitReturn> {
  readonly process: Process<ExitReturn>
  readonly which: Which
  readonly cosmiconfig: CosmiConfig
  readonly searchPlaces: string[]
  readonly packageProp: string
  readonly cache?: boolean
  readonly stopDir?: string
  readonly clearCache?: CacheType
  readonly choose: typeof choose
}

export async function main<Return> (param: MainParam<Return>): Promise<Return> {
  const { process, which, cosmiconfig, clearCache, choose, ...configParam } = param
  const { env, exit } = process
  const { info: logInfo, error: logError } = LoggerPair(process)

  const configExplorer = cosmiconfig(MODULE_NAME, configParam)

  /* UNRELATED COMMANDS */

  if (clearCache) {
    const mod = await import('./clear-cache')
    mod.clearCache(configExplorer, clearCache)
    return exit(Status.Success)
  }

  /* LOAD CONFIGURATION FILE */

  const searchResult = await configExplorer.search().then(ok, err)

  if (!searchResult.tag) {
    logError('[ERROR] Fail to load configuration file')
    logError(dbg`* message: ${searchResult.error}`)
    return exit(Status.ConfigLoadingFailure)
  }

  if (!searchResult.value) {
    logError('[ERROR] No config file found')
    logError(dbg`* search places ${configParam.searchPlaces}`)
    return exit(Status.ConfigNotFound)
  }

  if (searchResult.value.isEmpty) {
    logError('[ERROR] Config is empty')
    logError(dbg`* config file: ${searchResult.value.filepath}`)
    logError(dbg`* config: ${searchResult.value.config}`)
    return exit(Status.EmptyConfig)
  }

  /* VERIFY LOADED CONFIGURATION */

  const editorSet = searchResult.value.config

  try {
    assertEditorSet(editorSet)
  } catch (error) {
    logError('[ERROR] Received object does not match schema')
    logError(dbg`* content: ${editorSet}`)
    logError(dbg`* message: ${error}`)
    return exit(Status.InvalidEditorSet)
  }

  /* CHOOSE A COMMAND */

  const result = await choose({ env, which, editorSet })

  if (!result.tag) {
    switch (result.error) {
      case (INDETERMINABLE_TTY):
        logError('[ERROR] Cannot determine whether terminal is graphical or not.')
        return exit(Status.IndeterminableTTY)
      case (NOT_FOUND):
        logError('[ERROR] No editor detected.')
        return exit(Status.NotFound)
    }
  }

  /* PRINT CHOSEN COMMAND */

  const { path, args } = result.value
  const message = escape([path, ...args])
  logInfo(message)
  return exit(Status.Success)
}
