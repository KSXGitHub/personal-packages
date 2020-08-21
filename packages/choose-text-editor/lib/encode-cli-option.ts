import { EditorOptions } from './editors'
import encodeCliFlag from './encode-cli-flag'

export function encodeCliOptions(options: EditorOptions) {
  const result = Array<string>()

  for (const [key, value] of Object.entries(options)) {
    const flag = encodeCliFlag(key)

    switch (typeof value) {
      case 'boolean':
        if (value) result.push(flag)
        break
      case 'string':
      case 'number':
        result.push(flag, String(value))
        break
      case 'object':
        result.push(flag)
        for (const item of value) {
          result.push(String(item))
        }
        break
    }
  }

  return result
}

export default encodeCliOptions
