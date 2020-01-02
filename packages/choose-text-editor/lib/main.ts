import { dbg } from 'string-template-format'
import { ok, err } from '@tsfun/result'
import { Process } from './process'
import { Console } from './console'
import { Which } from './which'
import { ExecSync } from './exec-sync'
import { CosmiConfig } from './cosmiconfig'
import { CacheType } from './clear-cache'
import { validateEditorSet, validateChooser } from './validate'
import { choose } from './choose'
import { CommandHandlingMethod, handleChosenCommand } from './handle-chosen-command'
import { INDETERMINABLE_TTY, NOT_FOUND } from './errors'
import { PACKAGE_NAME } from './constants'
import { Status } from './status'

export interface MainParam<ExitReturn> {
  readonly process: Process<ExitReturn>
  readonly console: Console
  readonly which: Which
  readonly execSync: ExecSync
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

export async function main<Return> (param: MainParam<Return>): Promise<Return> {
  const { which } = param
  const { env, exit } = param.process
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
    return exit(Status.Success)
  }

  if (param.showStatus) {
    const mod = await import('./show-status')
    mod.showStatus(logInfo)
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
    logError(dbg`* search places ${param.searchPlaces}`)
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

  if (!validateEditorSet(editorSet, validatorResult => {
    logError('[ERROR] Config does not satisfy schema')

    for (const error of validatorResult.errors) {
      logError(' '.repeat(4) + error.message)
    }

    logError(dbg`* validator result: ${validatorResult}`)
  })) {
    return exit(Status.InvalidEditorSet)
  }

  if (!validateChooser(editorSet.chooser, param.packageName, param.packageVersion, {
    onInvalidPackageName (config, used) {
      logError('[ERROR] Invalid chooser')
      logError(dbg`* config package: ${config}`)
      logError(dbg`* used package: ${used}`)
    },

    onInvalidVersionRange (versionRange) {
      logError('[ERROR] Invalid version range for chooser')
      logError('help: read https://docs.npmjs.com/misc/semver#ranges for valid version range syntax')
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
    return exit(Status.UnsatisfiedChooser)
  }

  /* CHOOSE A COMMAND */

  const result = await param.choose({ env, which, editorSet })

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

  /* HANDLE CHOSEN COMMAND */

  return handleChosenCommand({
    handle: param.onChosen,
    command: result.value,
    args: param.args,
    exit,
    logInfo,
    logError,
    execSync: param.execSync
  })
}
