import escape from 'shell-escape'
import { dbg } from 'string-template-format'
import { ok, err } from '@tsfun/result'
import { Process } from './process'
import { Which } from './which'
import { ExecSync } from './exec-sync'
import { CosmiConfig } from './cosmiconfig'
import { CacheType } from './clear-cache'
import { validateEditorSet, validateChooser } from './validate'
import { choose } from './choose'
import { INDETERMINABLE_TTY, NOT_FOUND } from './errors'
import { PACKAGE_NAME, EXEC_OPTIONS } from './constants'
import { Status } from './status'
import { LoggerPair } from './utils'

export interface MainParam<ExitReturn> {
  readonly process: Process<ExitReturn>
  readonly which: Which
  readonly execSync: ExecSync
  readonly cosmiconfig: CosmiConfig
  readonly searchPlaces: string[]
  readonly packageProp: string
  readonly cache?: boolean
  readonly stopDir?: string
  readonly clearCache?: CacheType
  readonly showStatus?: boolean
  readonly open?: boolean
  readonly args: readonly string[]
  readonly choose: typeof choose
}

export async function main<Return> (param: MainParam<Return>): Promise<Return> {
  const { process, which } = param
  const { env, exit } = process
  const { info: logInfo, error: logError } = LoggerPair(process)

  const configExplorer = param.cosmiconfig(PACKAGE_NAME, {
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

  if (!validateChooser(editorSet.chooser, {
    onInvalidPackageName (received, expected) {
      logError('[ERROR] Invalid chooser')
      logError(dbg`* expected: ${expected}`)
      logError(dbg`* received: ${received}`)
    },

    onInvalidVersionRange (versionRange) {
      logError('[ERROR] Invalid version range for chooser')
      logError('help: read https://docs.npmjs.com/misc/semver#ranges for valid version range syntax')
      logError(dbg`* version range: ${versionRange}`)
    },

    onNonEmptyPath (path) {
      logError('[ERROR] Package path is expected to NOT be specified, but it was')
      logError(dbg`* path: ${path}`)
    },

    onUnsatisfiedVersion (expectedVersionRange, receivedVersion) {
      logError('[ERROR] Incompatible chooser')
      logError(`help: This version of ${PACKAGE_NAME} does not satisfied what is required in config`)
      logError(`help: Please update ${PACKAGE_NAME} or your config`)
      logError(dbg`* in config: ${expectedVersionRange}`)
      logError(dbg`* package version: ${receivedVersion}`)
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

  const command = result.value
  const finalArgs = [...command.args, ...param.args]

  if (param.open) {
    try {
      param.execSync(command.path, finalArgs, EXEC_OPTIONS)
    } catch (error) {
      logError('[ERROR] Execution of command resulted in failure')
      logError(dbg`* executable: ${command.path}`)
      logError(dbg`* arguments: ${finalArgs}`)
      logError(dbg`* error: ${error}`)
      logError(dbg`* status: ${error.status}`)
      return exit(Status.ExecutionFailure)
    }
  } else {
    const message = escape([command.path, ...finalArgs])
    logInfo(message)
  }

  return exit(Status.Success)
}
