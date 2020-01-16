import { dbg } from 'string-template-format-inspect'
import { validateChooser } from './validate'
import { Logger } from './console'
import { PACKAGE_NAME } from './constants'

export const handleChooserValidation = (
  logError: Logger,
  chooser: string,
  packageName: string,
  packageVersion: string,
  configPath: string
) => validateChooser(chooser, packageName, packageVersion, {
  onInvalidPackageName (config, used) {
    logError('[ERROR] Invalid chooser')
    logError(dbg`* config file: ${configPath}`)
    logError(dbg`* config package: ${config}`)
    logError(dbg`* used package: ${used}`)
  },

  onInvalidVersionRange (versionRange) {
    logError('[ERROR] Invalid version range for chooser')
    logError('help: Read https://docs.npmjs.com/misc/semver#ranges for valid version range syntax')
    logError(dbg`* config file: ${configPath}`)
    logError(dbg`* config version range: ${versionRange}`)
  },

  onNonEmptyPath (path) {
    logError('[ERROR] Package path is expected to NOT be specified, but it was')
    logError(dbg`* config file: ${configPath}`)
    logError(dbg`* package path: ${path}`)
  },

  onUnsatisfiedVersion (expectedVersionRange, receivedVersion) {
    logError('[ERROR] Incompatible chooser')
    logError(`help: This version of ${PACKAGE_NAME} does not satisfied what is required in config`)
    logError(`help: Please update ${PACKAGE_NAME} or your config`)
    logError(dbg`* config file: ${configPath}`)
    logError(dbg`* config version: ${expectedVersionRange}`)
    logError(dbg`* used version: ${receivedVersion}`)
  }
})
