import path from 'path'
import * as TJS from 'typescript-json-schema'
import { project } from '@tools/places'
import { schemas } from '@khai96x/choose-text-editor'

it('CliArguments matches its JSON Schema', () => {
  const compilerOptions: TJS.CompilerOptions = require(path.join(project, 'tsconfig.json'))

  const settings: TJS.PartialArgs = {
    topRef: true,
    ref: true,
    titles: true,
    required: true,
    strictNullChecks: true
  }

  const program = TJS.getProgramFromFiles(
    [require.resolve('@khai96x/choose-text-editor/lib/editors.ts')],
    compilerOptions
  )

  const expected = schemas.CliArguments().schemaObject
  const received = TJS.generateSchema(program, 'CliArguments', settings)

  expect(received).toEqual(expected)
})
