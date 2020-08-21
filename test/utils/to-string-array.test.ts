import { toStringArray } from '@khai96x/utils'

it('works', () => {
  expect(toStringArray([
    'abc',
    123,
    {},
    Infinity,
    undefined,
    null,
    { toString: () => 'custom toString' },
  ])).toEqual([
    'abc',
    '123',
    '[object Object]',
    'Infinity',
    'undefined',
    'null',
    'custom toString',
  ])
})
