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
  onInvalidPackageName (receivedPackageName: string, expectedPackageName: string): void
  onNonEmptyPath (path: string): void
  onInvalidVersionRange (versionRange: string): void
  onUnsatisfiedVersion (expectedVersionRange: string, receivedVersion: string): void
}

export function validateChooser (
  chooser: string,
  name: string,
  version: string,
  callbacks: ChooserCallbacks
): boolean {
  const expectation = parsePackageName(chooser)

  if (expectation.name !== name) {
    callbacks.onInvalidPackageName(name, expectation.name)
    return false
  }

  if (expectation.path) {
    callbacks.onNonEmptyPath(expectation.path)
    return false
  }

  if (!semver.validRange(expectation.version)) {
    callbacks.onInvalidVersionRange(expectation.version)
    return false
  }

  if (!semver.satisfies(version, expectation.version)) {
    callbacks.onUnsatisfiedVersion(expectation.version, version)
    return false
  }

  return true
}
