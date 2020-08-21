import semver from 'semver'
import jsonschema from 'jsonschema'
import parsePackageName from 'parse-package-name'
import { SchemaContainer } from './json-schema'
import { schemas } from './schemas'
import { EditorSet, CliArguments } from './editors'

interface SchemaValidatorCallback {
  (result: jsonschema.ValidatorResult): void
}

interface SchemaValidator<Type> {
  (instance: unknown, callback: SchemaValidatorCallback): instance is Type
}

const SchemaValidator = <Type>(
  loadSchemaContainer: () => SchemaContainer,
): SchemaValidator<Type> =>
  (instance, callback): instance is Type => {
    const result = loadSchemaContainer().validate(instance, {
      allowUnknownAttributes: true,
    })

    if (!result.valid) {
      callback(result)
      return false
    }

    return true
  }

export const validateEditorSet = SchemaValidator<EditorSet>(schemas.EditorSet)
export const validateCliArguments = SchemaValidator<CliArguments>(schemas.CliArguments)

interface ChooserCallbacks {
  onInvalidPackageName(configPackageName: string, usedPackageName: string): void
  onNonEmptyPath(path: string): void
  onInvalidVersionRange(versionRange: string): void
  onUnsatisfiedVersion(configVersionRange: string, usedVersion: string): void
}

export function validateChooser(
  chooser: string,
  name: string,
  version: string,
  callbacks: ChooserCallbacks,
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
