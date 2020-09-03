import assert from 'assert'
import once from 'exec-once'

interface Base {
  readonly plain: string
}

export interface Status extends Base {
  readonly value: Value
  readonly path: string
}

export interface Value extends Base {
  readonly staged: '?' | 'A' | 'D' | 'M' | ' '
  readonly unstaged: '?' | 'M' | 'D' | ' '
}

export function parsePorcelainStatus(plain: string): Status {
  assert.strictEqual(plain[2], ' ', 'Third character of plain')
  const path = plain.slice(3)
  const valuePlain = plain.slice(0, 2)
  const getValue = once(() => parsePorcelainStatusValue(valuePlain))
  return {
    path,
    value: {
      plain: valuePlain,
      get staged() {
        return getValue().staged
      },
      get unstaged() {
        return getValue().unstaged
      },
    },
    plain,
  }
}

function assertIncludes<Value>(value: any, array: readonly Value[]): asserts value is Value {
  if (array.includes(value)) return
  throw new Error(`[${array.join(', ')}] does not include ${value}`)
}

export function parsePorcelainStatusValue(plain: string): Value {
  const [staged, unstaged, ...rest] = plain
  if (rest.length) throw new Error(`Excessive characters: ${plain}`)
  assertIncludes(staged, ['?', 'A', 'D', 'M', ' '] as const)
  assertIncludes(unstaged, ['?', 'D', 'M', ' '] as const)
  return { staged, unstaged, plain }
}
