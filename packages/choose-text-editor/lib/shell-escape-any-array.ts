import lib from 'shell-escape'
import { toStringArray } from '@khai96x/utils'
export const shellEscape = (args: readonly unknown[]) => lib(toStringArray(args))
