import { Validator, Options } from 'jsonschema'
import once from 'exec-once'

export { Options as JsonSchemaValidationOptions }

export interface SchemaLoader {
  (path: string): () => SchemaContainer
}

export const SchemaLoader =
  (require: NodeRequire): SchemaLoader =>
    path => once(() => new SchemaContainer(path, require))

export class SchemaContainer {
  public readonly schemaObject: any
  private readonly validator = new Validator()

  constructor (path: string, require: NodeRequire) {
    this.schemaObject = require(path)
  }

  public validate (instance: any, options?: Options) {
    return this.validator.validate(instance, this.schemaObject, options)
  }
}
