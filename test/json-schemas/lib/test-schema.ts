import path from 'path'
import * as TJS from 'typescript-json-schema'
import { project } from '@tools/places'
import { SchemaContainer } from '@khai96x/choose-text-editor'

const compilerOptions: TJS.CompilerOptions = {
  ...require(path.join(project, 'tsconfig.json')),
  strictNullChecks: true // workaround
}

const settings: TJS.PartialArgs = {
  topRef: true,
  ref: true,
  titles: true,
  required: true,
  strictNullChecks: true
}

export function testSchema (
  files: string[],
  loadSchemaContainer: () => SchemaContainer,
  typeName: string
) {
  const program = TJS.getProgramFromFiles(files, compilerOptions)
  const received = loadSchemaContainer().schemaObject
  const expected = TJS.generateSchema(program, typeName, settings)
  expect(received).toEqual(expected)
}

export const schemaTester = (
  files: string[],
  loadSchemaContainer: () => SchemaContainer,
  typeName: string
) => () => testSchema(files, loadSchemaContainer, typeName)
