import { EditorOptions } from './editors'
import flag2arg from './flag-to-arg'

export const opts2args = (options: EditorOptions) => Object
  .entries(options)
  .map(([key, value]) => flag2arg(key) + '=' + value)

export default opts2args
