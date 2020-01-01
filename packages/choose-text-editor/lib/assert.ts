// TODO: Update this to use verification-stack once it is available

import { dbg } from 'string-template-format'
import { EditorSet, Editor, EditorOptions } from './editors'

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
  if (checkKey(editorSet, 'graphical')) assertEditorArray(editorSet.graphical)
  if (checkKey(editorSet, 'terminal')) assertEditorArray(editorSet.terminal)
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
}

export function assertEditorOptions (options: unknown): asserts options is EditorOptions {
  assertObject(options)

  for (const [key, value] of Object.entries(options)) {
    if (typeof value === 'string') continue
    if (typeof value === 'number') continue
    if (typeof value === 'boolean') continue
    throw new TypeError(dbg`Expecting property ${key} to be either a string, a number, or a boolean but received ${value} instead`)
  }
}
