import { encodeCliOptions } from '@khai96x/choose-text-editor'

it('matches snapshot', () => {
  expect(encodeCliOptions({
    stringOption: 'abc',
    numberOption: 123,
    trueOption: true,
    falseOption: false,
    arrayOption: ['abc', 'def', 123, 456],
    a: 'foo',
    b: 456,
    c: true,
    d: false,
    e: ['a', 0, 'b', 1, 2],
  })).toMatchSnapshot()
})

it('works as intended', () => {
  expect(encodeCliOptions({
    stringOption: 'abc',
    numberOption: 123,
    trueOption: true,
    falseOption: false,
    arrayOption: ['abc', 'def', 123, 456],
    a: 'foo',
    b: 456,
    c: true,
    d: false,
    e: ['a', 0, 'b', 1, 2],
  })).toEqual([
    '--stringOption',
    'abc',
    '--numberOption',
    '123',
    '--trueOption',
    '--arrayOption',
    'abc',
    'def',
    '123',
    '456',
    '-a',
    'foo',
    '-b',
    '456',
    '-c',
    '-e',
    'a',
    '0',
    'b',
    '1',
    '2',
  ])
})

it('false boolean does not appear', () => {
  expect(encodeCliOptions({ flag: false })).not.toContain('--flag')
})

it('true boolean appears without value', () => {
  expect(encodeCliOptions({ flag: true })).toEqual(['--flag'])
})
