// TODO: Update this to use verification-stack once it is available

import semver from 'semver'
import parsePackageName from 'parse-package-name'
import { dbg } from 'string-template-format'
import { EditorSet, Editor, EditorOptions } from './editors'
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
  assertObject(editorSet)
  assertKey(editorSet, 'chooser')
  assertChooser(editorSet.chooser)
  if (checkKey(editorSet, 'graphical')) assertEditorArray(editorSet.graphical)
  if (checkKey(editorSet, 'terminal')) assertEditorArray(editorSet.terminal)
}

export function assertChooser (chooser: unknown): asserts chooser is string {
  if (typeof chooser !== 'string') {
    throw new TypeError(dbg`Expecting a string but received ${chooser} instead`)
  }

  const { name, path, version } = parsePackageName(chooser)

  if (name !== PACKAGE_NAME) {
    throw new RangeError(dbg`Expecting chooser's package name to be ${PACKAGE_NAME} but received ${name} instead`)
  }

  if (path) {
    throw new RangeError(dbg`Expecting chooser's path to be empty but received ${path} instead`)
  }

  if (!semver.validRange(version)) {
    throw new RangeError(dbg`Invalid version range: ${version}`)
  }

  const actualVersion = require('../package.json').version
  if (!semver.satisfies(actualVersion, version)) {
    throw new Error(dbg`Incompatible version: ${actualVersion} does not satisfy ${version}`)
  }
}

export function assertEditorArray (editorArray: unknown): asserts editorArray is readonly Editor[] {
  if (!Array.isArray(editorArray)) {
    throw new TypeError(dbg`Expecting an array but received ${editorArray} instead`)
  }

  for (const editor of editorArray) {
    assertEditor(editor)
  }
}

export function assertEditor (editor: unknown): asserts editor is Editor {
  assertObject(editor)

  assertKey(editor, 'program')
  if (typeof editor.program !== 'string') {
    throw new TypeError(dbg`Expecting property 'program' to be a string but found ${editor.program} instead`)
  }

  if (checkKey(editor, 'flags')) {
    if (!Array.isArray(editor.flags)) {
      throw new TypeError(dbg`Expecting property 'flags' to be an array but found ${editor.flags} instead`)
    }

    for (const x of editor.flags) {
      if (typeof x !== 'string') {
        throw new TypeError(dbg`Expecting property 'flags' to contain only string but found ${x}`)
      }
    }
  }

  if (checkKey(editor, 'options')) {
    assertEditorOptions(editor.options)
  }

  if (checkKey(editor, 'suffix')) {
    if (!Array.isArray(editor.suffix)) {
      throw new TypeError(dbg`Expecting property 'suffix' to be an array but found ${editor.suffix} instead`)
    }

    for (const item of editor.suffix) {
      if (typeof item !== 'string') {
        throw new TypeError(dbg`Expecting array of 'suffix' to contain only strings but found ${item}`)
      }
    }
  }
}

export function assertEditorOptions (options: unknown): asserts options is EditorOptions {
  assertObject(options)

  for (const [key, value] of Object.entries(options)) {
    if (typeof value === 'string') continue
    if (typeof value === 'number') continue
    if (typeof value === 'boolean') continue

    if (!Array.isArray(value)) {
      throw new TypeError(dbg`Expecting property ${key} to be either a string, a number, a boolean, or an array but received ${value} instead`)
    }

    for (const item of value) {
      if (typeof item === 'string') continue
      if (typeof item === 'number') continue
      throw new TypeError(dbg`Expecting array of ${key} to contain only strings and numbers but found ${item}`)
    }
  }
}
