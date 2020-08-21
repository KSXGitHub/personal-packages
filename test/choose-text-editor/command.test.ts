import { some, none } from '@tsfun/option'
import { Command } from '@khai96x/choose-text-editor'

describe('when which returns a promise that resolves', () => {
  describe('without editor.flags, editor.options, and editor.suffixes', () => {
    async function setup() {
      const program = 'expected-program'
      const whichReturn = '/full/path/to/expected-program'
      const which = jest.fn(async () => whichReturn)
      const prefixes = [...'prefixes']

      const result = await Command({
        editor: {
          program,
        },
        which,
        prefixes,
      })

      return { program, whichReturn, which, prefixes, result }
    }

    it('calls which exactly once', async () => {
      const { which } = await setup()
      expect(which).toBeCalledTimes(1)
    })

    it('calls which with expected arguments', async () => {
      const { program, which } = await setup()
      expect(which).toBeCalledWith(program, { all: false })
    })

    it('returns expected result', async () => {
      const { whichReturn, prefixes, result } = await setup()
      expect(result).toEqual(some({
        path: whichReturn,
        args: prefixes,
      }))
    })
  })

  describe('with editor.flags, editor.options, and editor.suffixes', () => {
    async function setup() {
      const program = 'expected-program'
      const whichReturn = '/full/path/to/expected-program'
      const which = jest.fn(async () => whichReturn)
      const prefixes = [...'prefixes']

      const result = await Command({
        editor: {
          program,
          flags: ['a', 'foo', 'b', 'c', 'bar'],
          options: {
            abc: 123,
            def: 456,
          },
          suffixes: ['suffix1', 'suffix2'],
        },
        which,
        prefixes,
      })

      return { program, whichReturn, which, prefixes, result }
    }

    it('calls which exactly once', async () => {
      const { which } = await setup()
      expect(which).toBeCalledTimes(1)
    })

    it('calls which with expected arguments', async () => {
      const { program, which } = await setup()
      expect(which).toBeCalledWith(program, { all: false })
    })

    it('returns expected result', async () => {
      const { result } = await setup()
      expect(result).toMatchSnapshot()
    })
  })
})

describe('when which returns a promise that rejects', () => {
  async function setup() {
    const program = 'expected-program'
    const which = jest.fn(() => Promise.reject())
    const prefixes = [...'prefixes']

    const result = await Command({
      editor: {
        program,
      },
      which,
      prefixes,
    })

    return { program, which, prefixes, result }
  }

  it('calls which exactly once', async () => {
    const { which } = await setup()
    expect(which).toBeCalledTimes(1)
  })

  it('calls which with expected arguments', async () => {
    const { program, which } = await setup()
    expect(which).toBeCalledWith(program, { all: false })
  })

  it('returns expected result', async () => {
    const { result } = await setup()
    expect(result).toEqual(none())
  })
})
