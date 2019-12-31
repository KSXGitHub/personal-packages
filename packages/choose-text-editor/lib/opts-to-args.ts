import { EditorOptions } from './editors'
import flag2arg from './flag-to-arg'

export const opts2args = (options: EditorOptions) => Object
  .entries(options)
  .map(([key, value]) => encodeSingleOption(key, value))

export const encodeSingleOption = (key: string, value: string | number | boolean) =>
  flag2arg(key) + (typeof value === 'boolean' ? '' : '=' + value)

export default opts2args
