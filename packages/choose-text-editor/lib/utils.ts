import { concat } from 'iter-tools'

interface IterableWithLength<Element> extends Iterable<Element> {
  readonly length: number
}

class ConcatLengthResult<Element> implements IterableWithLength<Element> {
  constructor (
    private iterables: readonly IterableWithLength<Element>[]
  ) {}

  public get length () {
    return this.iterables.reduce((acc, cur) => acc + cur.length, 0)
  }

  public [Symbol.iterator] () {
    return concat(...this.iterables)
  }
}

export function concatWithLength<Element> (...iterables: IterableWithLength<Element>[]) {
  return new ConcatLengthResult(iterables)
}

export const toStringArray = (array: readonly unknown[]) => array.map(item => String(item))
