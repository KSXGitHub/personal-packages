import semver from 'semver'
import jsonschema from 'jsonschema'
import parsePackageName from 'parse-package-name'
import { schemas } from './schemas'
import { EditorSet } from './editors'
import { PACKAGE_NAME } from './constants'

interface EditorSetCallback {
  (result: jsonschema.ValidatorResult): void
}

export function validateEditorSet (editorSet: unknown, callback: EditorSetCallback): editorSet is EditorSet {
  const result = schemas.EditorSet().validate(editorSet, {
    allowUnknownAttributes: true
  })

  if (!result.valid) {
    callback(result)
    return false
  }

  return true
}

interface ChooserCallbacks {
  readonly onInvalidPackageName: (receivedPackageName: string, expectedPackageName: typeof PACKAGE_NAME) => void
  readonly onNonEmptyPath: (path: string) => void
  readonly onInvalidVersionRange: (versionRange: string) => void
  readonly onUnsatisfiedVersion: (expectedVersionRange: string, receivedVersion: string) => void
}

export function validateChooser (chooser: string, callbacks: ChooserCallbacks): chooser is string {
  const { name, path, version } = parsePackageName(chooser)

  if (name !== PACKAGE_NAME) {
    callbacks.onInvalidPackageName(name, PACKAGE_NAME)
    return false
  }

  if (path) {
    callbacks.onNonEmptyPath(path)
    return false
  }

  if (!semver.validRange(version)) {
    callbacks.onInvalidVersionRange(version)
    return false
  }

  const actualVersion = require('../package.json').version
  if (!semver.satisfies(actualVersion, version)) {
    callbacks.onUnsatisfiedVersion(version, actualVersion)
    return false
  }

  return true
}
