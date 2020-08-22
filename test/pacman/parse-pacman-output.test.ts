import { pipe, map, asyncToArray, interpose } from 'iter-tools'
import { QuLine, parseQuLine, parseQuStream } from '@khai96x/pacman'

describe('parseQuLine', () => {
  it('invalid', () => {
    expect(parseQuLine('invalid')).toBe(null)
  })

  it('with "[ignored]"', () => {
    expect(parseQuLine('foo 1.2.3-4 -> 2.4.6-8 [ignored]')).toEqual({
      packageName: 'foo',
      oldVersion: '1.2.3-4',
      newVersion: '2.4.6-8',
      ignored: true,
    })
  })

  it('without "[ignored]"', () => {
    expect(parseQuLine('foo 1.2.3-4 -> 2.4.6-8')).toEqual({
      packageName: 'foo',
      oldVersion: '1.2.3-4',
      newVersion: '2.4.6-8',
      ignored: false,
    })
  })
})

describe('parseQuStream', () => {
  const streamSource = [
    'foo 1.2.3-4 -> 2.4.6-8 [ignored]',
    'bar 3.2.1-0 -> 9.7.3-1',
    'baz 1.3.5-0 -> 1.3.5-1 [ignored]',
    'qux 0.0.0-0 -> 1:1.1.1-1',
  ]

  const expectedOutput: readonly QuLine[] = [
    {
      packageName: 'foo',
      oldVersion: '1.2.3-4',
      newVersion: '2.4.6-8',
      ignored: true,
    },
    {
      packageName: 'bar',
      oldVersion: '3.2.1-0',
      newVersion: '9.7.3-1',
      ignored: false,
    },
    {
      packageName: 'baz',
      oldVersion: '1.3.5-0',
      newVersion: '1.3.5-1',
      ignored: true,
    },
    {
      packageName: 'qux',
      oldVersion: '0.0.0-0',
      newVersion: '1:1.1.1-1',
      ignored: false,
    },
  ]

  it('one huge chunk', async () => {
    expect(
      await pipe(
        [streamSource.join('\n')],
        parseQuStream,
        asyncToArray,
      ),
    ).toEqual(expectedOutput)
  })

  it('every chunk is a line', async () => {
    expect(
      await pipe(
        streamSource,
        map(line => line + '\n'),
        parseQuStream,
        asyncToArray,
      ),
    ).toEqual(expectedOutput)
  })

  it('every chunk is a line followed by a newline', async () => {
    expect(
      await pipe(
        streamSource,
        interpose('\n'),
        parseQuStream,
        asyncToArray,
      ),
    ).toEqual(expectedOutput)
  })

  it('every chunk is a character', async () => {
    expect(
      await pipe(
        streamSource.join('\n'),
        Array.from,
        parseQuStream,
        asyncToArray,
      ),
    ).toEqual(expectedOutput)
  })

  it('every chunk is a buffer', async () => {
    expect(
      await pipe(
        streamSource,
        map(line => line + '\n'),
        map(Buffer.from),
        parseQuStream,
        asyncToArray,
      )
    ).toEqual(expectedOutput)
  })
})
