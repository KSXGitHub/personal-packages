import { encodeCliFlag } from '@khai96x/choose-text-editor'

it('matches snapshot', () => {
  const result = [
    'foo',
    'foo-bar',
    'fooBar',
    'f',
    'a',
  ].map(input => ({
    input,
    output: encodeCliFlag(input),
  }))

  expect(result).toMatchSnapshot()
})

it('works as intended', () => {
  expect([
    'foo',
    'foo-bar',
    'fooBar',
    'f',
    'a',
  ].map(encodeCliFlag)).toEqual([
    '--foo',
    '--foo-bar',
    '--fooBar',
    '-f',
    '-a',
  ])
})
