// TODO: Convert this to something else with better error messages
// TODO: Actually use assertChooser

import semver from 'semver'
import parsePackageName from 'parse-package-name'
import { dbg } from 'string-template-format'
import { schemas } from './schemas'
import { EditorSet } from './editors'
import { PACKAGE_NAME } from './constants'

export function assertObject (object: unknown): asserts object is object {
  if (typeof object !== 'object') {
    throw new TypeError(dbg`Expecting an object but received ${object}`)
  }

  if (object === null) {
    throw new TypeError('Expecting an object but received null')
  }
}

export function assertArray (array: unknown): asserts array is readonly unknown[] {
  if (Array.isArray(array)) return
  throw new TypeError(dbg`Expecting an array but received ${array} instead`)
}

export function checkKey<
  Object extends object,
  Key extends string | number | symbol
> (object: Object, key: Key): object is Object & { readonly [_ in Key]: unknown } {
  return key in object
}

export function assertKey<
  Object extends object,
  Key extends string | number | symbol
> (object: Object, key: Key): asserts object is Object & { readonly [_ in Key]: unknown } {
  if (!checkKey(object, key)) {
    throw new TypeError(dbg`Expecting object to have property ${key} but it hasn't`)
  }
}

export function assertEditorSet (editorSet: unknown): asserts editorSet is EditorSet {
  const result = schemas.EditorSet().validate(editorSet, {
    allowUnknownAttributes: true
  })

  if (!result.valid) throw new RangeError(dbg`Object is not a valid EditorSet: ${editorSet}`)
}

export const enum ChooserError {
  NotAString,
  PackageName,
  HasPath,
  InvalidVersionRange,
  UnsatisfiedVersion
}

export interface ChooserErrorReceiver {
  (error: ChooserError): void
}

export function validateChooser (chooser: unknown, callback: ChooserErrorReceiver): chooser is string {
  if (typeof chooser !== 'string') {
    callback(ChooserError.NotAString)
    return false
  }

  const { name, path, version } = parsePackageName(chooser)

  if (name !== PACKAGE_NAME) {
    callback(ChooserError.PackageName)
    return false
  }

  if (path) {
    callback(ChooserError.HasPath)
    return false
  }

  if (!semver.validRange(version)) {
    callback(ChooserError.InvalidVersionRange)
    return false
  }

  const actualVersion = require('../package.json').version
  if (!semver.satisfies(actualVersion, version)) {
    callback(ChooserError.UnsatisfiedVersion)
    return false
  }

  return true
}
