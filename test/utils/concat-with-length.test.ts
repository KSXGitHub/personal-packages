import { concatWithLength } from '@khai96x/utils'

describe('concatenation of arrays', () => {
  describe('when no operand are mutated after concatenation', () => {
    function init() {
      const a = [0, 1, 2, 3]
      const b = [4, 5]
      const c = [7, 8, 9]
      const abc = concatWithLength(a, b, c)
      return { a, b, c, abc }
    }

    it('makes an iterable object', () => {
      const { a, b, c, abc } = init()
      expect(Array.from(abc)).toEqual([...a, ...b, ...c])
    })

    it('makes a "length" property', () => {
      const { a, b, c, abc } = init()
      expect(abc).toHaveProperty('length', a.length + b.length + c.length)
    })
  })

  describe('when some operands are mutated after concatenation', () => {
    function init() {
      const a = [0, 1, 2, 3]
      const b = [4, 5]
      const c = [7, 8, 9]
      const abc = concatWithLength(a, b, c)
      a.push(123, 456)
      b.pop()
      return { a, b, c, abc }
    }

    it('updates its elements', () => {
      const { a, b, c, abc } = init()
      expect(Array.from(abc)).toEqual([...a, ...b, ...c])
    })

    it('updates its "length"', () => {
      const { a, b, c, abc } = init()
      expect(abc).toHaveProperty('length', a.length + b.length + c.length)
    })
  })
})

describe('concatenation of concatenations', () => {
  describe('when no operand are mutated after concatenation', () => {
    function init() {
      const a = [0, 1, 2, 3]
      const b = [4, 5]
      const c = [7, 8, 9]
      const d = ['abc', 'def', 'ghi']
      const e = ['jkl']
      const f = 'abc'
      const abc = concatWithLength(a, b, c)
      const de = concatWithLength(d, e)
      const abcdef = concatWithLength<string | number>(abc, de, f)
      return { a, b, c, d, e, f, abc, de, abcdef }
    }

    it('makes an iterable object', () => {
      const { a, b, c, d, e, f, abcdef } = init()
      expect(Array.from(abcdef)).toEqual([...a, ...b, ...c, ...d, ...e, ...f])
    })

    it('makes a "length" property', () => {
      const { a, b, c, d, e, f, abcdef } = init()
      const expectedLength = a.length + b.length + c.length + d.length + e.length + f.length
      expect(Array.from(abcdef)).toHaveProperty('length', expectedLength)
    })
  })

  describe('when some operands are mutated after concatenation', () => {
    function init() {
      const a = [0, 1, 2, 3]
      const b = [4, 5]
      const c = [7, 8, 9]
      const d = ['abc', 'def', 'ghi']
      const e = ['jkl']
      const f = 'abc'
      const abc = concatWithLength(a, b, c)
      const de = concatWithLength(d, e)
      const abcdef = concatWithLength<string | number>(abc, de, f)
      a.push(123, 456, 789)
      d.pop()
      e.unshift('a', 'b', 'c')
      return { a, b, c, d, e, f, abc, de, abcdef }
    }

    it('makes an iterable object', () => {
      const { a, b, c, d, e, f, abcdef } = init()
      expect(Array.from(abcdef)).toEqual([...a, ...b, ...c, ...d, ...e, ...f])
    })

    it('makes a "length" property', () => {
      const { a, b, c, d, e, f, abcdef } = init()
      const expectedLength = a.length + b.length + c.length + d.length + e.length + f.length
      expect(Array.from(abcdef)).toHaveProperty('length', expectedLength)
    })
  })
})
