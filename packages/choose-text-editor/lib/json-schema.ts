import jsonschema from 'jsonschema'
import once from 'exec-once'

export type JsonSchemaValidationOptions = jsonschema.Options

export interface SchemaLoader {
  (path: string): () => SchemaContainer
}

export const SchemaLoader =
  (require: NodeRequire): SchemaLoader =>
    path => once(() => new SchemaContainer(path, require))

export class SchemaContainer {
  public readonly schemaObject: any
  private readonly validator = new jsonschema.Validator()

  constructor (path: string, require: NodeRequire) {
    this.schemaObject = require(path)
  }

  public validate (instance: any, options?: jsonschema.Options) {
    return this.validator.validate(instance, this.schemaObject, options)
  }
}
