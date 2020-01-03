import lib from 'shell-escape'
import { toStringArray } from './utils'
export const shellEscape = (args: readonly unknown[]) => lib(toStringArray(args))
