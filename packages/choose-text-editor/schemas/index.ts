import { SchemaLoader } from '../lib/json-schema'
const loader = SchemaLoader(require)
export const CliArguments = loader('./cli-arguments.schema.json')
export const EditorSet = loader('./editor-set.schema.json')
