import { SchemaLoader } from '../lib'
const loader = SchemaLoader(require)
export const EditorSet = loader('./editor-set.schema.json')
