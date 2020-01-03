import { schemas } from '@khai96x/choose-text-editor'
import { schemaTester } from '../lib/test-schema'

it('EditorSet matches its JSON Schema', schemaTester(
  [require.resolve('@khai96x/choose-text-editor/lib/editors.ts')],
  schemas.EditorSet,
  'EditorSet'
))
