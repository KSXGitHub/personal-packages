import { concat } from 'iter-tools'

interface IterableWithLength<Element> extends Iterable<Element> {
  readonly length: number
}

class ConcatLengthResult<Element> implements IterableWithLength<Element> {
  constructor(
    private readonly left: IterableWithLength<Element>,
    private readonly right: IterableWithLength<Element>,
  ) {}

  public get length() {
    return this.left.length + this.right.length
  }

  public [Symbol.iterator]() {
    return concat(this.left, this.right)
  }
}

export function concatWithLength<Element>(
  a: IterableWithLength<Element>,
  b: IterableWithLength<Element>,
  ...more: IterableWithLength<Element>[]
): ConcatLengthResult<Element> {
  // 'more as [any, ...any[]]' is a workaround for https://github.com/microsoft/TypeScript/issues/28837
  const bb = more.length !== 0 ? concatWithLength(b, ...more as [any, ...any[]]) : b
  return new ConcatLengthResult(a, bb)
}

export default concatWithLength
