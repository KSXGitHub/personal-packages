import { EditorOptions } from './editors'
import encodeCliFlag from './encode-cli-flag'

export const encodeCliOptions = (options: EditorOptions) => Object
  .entries(options)
  .map(([key, value]) => encodeSingleCliOption(key, value))

export const encodeSingleCliOption = (key: string, value: string | number | boolean) =>
  encodeCliFlag(key) + (typeof value === 'boolean' ? '' : '=' + value)

export default encodeCliOptions
