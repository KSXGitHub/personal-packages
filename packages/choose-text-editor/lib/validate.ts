import semver from 'semver'
import jsonschema from 'jsonschema'
import parsePackageName from 'parse-package-name'
import { schemas } from './schemas'
import { EditorSet } from './editors'

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
  onInvalidPackageName (configPackageName: string, usedPackageName: string): void
  onNonEmptyPath (path: string): void
  onInvalidVersionRange (versionRange: string): void
  onUnsatisfiedVersion (configVersionRange: string, usedVersion: string): void
}

export function validateChooser (
  chooser: string,
  name: string,
  version: string,
  callbacks: ChooserCallbacks
): boolean {
  const config = parsePackageName(chooser)

  if (config.name !== name) {
    callbacks.onInvalidPackageName(config.name, name)
    return false
  }

  if (config.path) {
    callbacks.onNonEmptyPath(config.path)
    return false
  }

  if (!semver.validRange(config.version)) {
    callbacks.onInvalidVersionRange(config.version)
    return false
  }

  if (!semver.satisfies(version, config.version)) {
    callbacks.onUnsatisfiedVersion(config.version, version)
    return false
  }

  return true
}
