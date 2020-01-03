import { addIndentation } from '@khai96x/utils'

it('works', () => {
  const original = [
    'abc def',
    ' foo bar',
    '  123 456',
    'ghi jkl',
    ' 7 8 9'
  ].join('\n')

  const expected = [
    '  abc def',
    '   foo bar',
    '    123 456',
    '  ghi jkl',
    '   7 8 9'
  ].join('\n')

  const received = addIndentation(original, 2)
  expect(received).toBe(expected)
})
