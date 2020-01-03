import { JsonSchemaValidatorResult as ValidatorResult } from './json-schema'
import { Logger } from './console'

const indent = ' '.repeat(4)
export function logSchemaErrors (validatorResult: ValidatorResult, logError: Logger): void {
  logError('* stack:')

  for (const line of validatorResult.toString().split('\n')) {
    logError(indent + line)
  }
}
