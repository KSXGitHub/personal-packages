import { inspect } from 'util'

export interface CustomInspectObject {
  readonly [inspect.custom]: () => string
}

export const CustomInspectObject = (
  msg: string | (() => string),
): CustomInspectObject => typeof msg === 'string' ? CustomInspectObject(() => msg) : { [inspect.custom]: msg }

export default CustomInspectObject
