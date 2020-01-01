import { SchemaLoader } from '../lib/json-schema'
const loader = SchemaLoader(require)
export const EditorSet = loader('./editor-set.schema.json')
