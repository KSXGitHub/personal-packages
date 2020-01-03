import mockedWhichImpl from './lib/mocked-which-impl'

import {
  EditorSet,
  Env,
  JsonSchemaValidatorResult,
  NOT_FOUND,
  NO_EDITOR,
  INDETERMINABLE_TTY,
  PREFIXES_PARSING_FAILURE,
  INVALID_PREFIXES,
  choose
} from '@khai96x/choose-text-editor'

const chooser = '@khai96x/choose-text-editor'

interface SetupParam {
  readonly editorSet: EditorSet
  readonly env: Env
}

async function setup (param: SetupParam) {
  const which = jest.fn(mockedWhichImpl)
  const result = await choose({
    which,
    ...param
  })
  return { ...param, which, result }
}

describe('when there is no editor specified', () => {
  describe('with ISINTTY=true', () => {
    const param: SetupParam = {
      editorSet: { chooser },
      env: { ISINTTY: 'true' }
    }

    it('returns NotFound()', async () => {
      const { result } = await setup(param)
      expect(result).toEqual({ error: NO_EDITOR })
    })

    it('does not call which', async () => {
      const { which } = await setup(param)
      expect(which).not.toBeCalled()
    })
  })

  describe('with ISINTTY=false', () => {
    const param: SetupParam = {
      editorSet: { chooser },
      env: { ISINTTY: 'false' }
    }

    it('returns NotFound()', async () => {
      const { result } = await setup(param)
      expect(result).toEqual({ error: NO_EDITOR })
    })

    it('does not call which', async () => {
      const { which } = await setup(param)
      expect(which).not.toBeCalled()
    })
  })

  describe('with ISINTTY absent', () => {
    const param: SetupParam = {
      editorSet: { chooser },
      env: { ISINTTY: undefined }
    }

    it('returns IndeterminableTTY()', async () => {
      const { result } = await setup(param)
      expect(result).toEqual({ error: INDETERMINABLE_TTY })
    })

    it('does not call which', async () => {
      const { which } = await setup(param)
      expect(which).not.toBeCalled()
    })
  })
})

describe('when no valid terminal editor can be found', () => {
  const editorSet: EditorSet = {
    graphical: [
      { program: 'ghost', flags: ['wait'] },
      { program: 'vampire' },
      { program: 'code', flags: ['wait'] },
      { program: 'zeus' },
      { program: 'atom', flags: ['wait'] },
      { program: 'subl', flags: ['wait'] }
    ],
    terminal: [
      { program: 'unicorn' },
      { program: 'magic' },
      { program: 'god' },
      { program: 'santa' }
    ],
    chooser
  }

  describe('when ISINTTY=true', () => {
    const param: SetupParam = {
      editorSet,
      env: { ISINTTY: 'true' }
    }

    it('returns NotFound()', async () => {
      const { result } = await setup(param)
      expect(result).toEqual({ error: NOT_FOUND })
    })

    it('calls which with non-existent terminal editor names and options', async () => {
      const { which } = await setup(param)
      expect(which.mock.calls).toEqual([
        ['unicorn', { all: false }],
        ['magic', { all: false }],
        ['god', { all: false }],
        ['santa', { all: false }]
      ])
    })
  })

  describe('when ISINTTY=false', () => {
    const param: SetupParam = {
      editorSet,
      env: { ISINTTY: 'false' }
    }

    it('returns Found(<FirstFound>)', async () => {
      const { result } = await setup(param)
      expect(result).toEqual({
        error: null,
        command: {
          path: await mockedWhichImpl('code'),
          args: ['--wait']
        }
      })
    })

    it('calls which till <FirstFound>', async () => {
      const { which } = await setup(param)
      expect(which.mock.calls).toEqual([
        ['ghost', { all: false }],
        ['vampire', { all: false }],
        ['code', { all: false }]
      ])
    })
  })
})

describe('when no valid graphical editor can be found', () => {
  const editorSet: EditorSet = {
    graphical: [
      { program: 'vampire' },
      { program: 'zeus' }
    ],
    terminal: [
      { program: 'unicorn' },
      { program: 'magic' },
      { program: 'vim' },
      { program: 'god' },
      { program: 'nano' },
      { program: 'santa' },
      { program: 'emacs' }
    ],
    chooser
  }

  describe('when ISINTTY=true', () => {
    const param: SetupParam = {
      editorSet,
      env: { ISINTTY: 'true' }
    }

    it('returns Found(<FirstFoundTerminalEditor>)', async () => {
      const { result } = await setup(param)
      expect(result).toEqual({
        error: null,
        command: {
          path: await mockedWhichImpl('vim'),
          args: []
        }
      })
    })

    it('calls which till <FirstFoundTerminalEditor>', async () => {
      const { which } = await setup(param)
      expect(which.mock.calls).toEqual([
        ['unicorn', { all: false }],
        ['magic', { all: false }],
        ['vim', { all: false }]
      ])
    })
  })

  describe('when ISINTTY=false', () => {
    const param: SetupParam = {
      editorSet,
      env: { ISINTTY: 'false' }
    }

    it('returns Found(<FirstFoundTerminalEditor>)', async () => {
      const { result } = await setup(param)
      expect(result).toEqual({
        error: null,
        command: {
          path: await mockedWhichImpl('vim'),
          args: []
        }
      })
    })

    it('calls which till <FirstFoundTerminalEditor>', async () => {
      const { which } = await setup(param)
      expect(which.mock.calls).toEqual([
        ['vampire', { all: false }],
        ['zeus', { all: false }],
        ['unicorn', { all: false }],
        ['magic', { all: false }],
        ['vim', { all: false }]
      ])
    })
  })
})

describe('when FORCE_EDITOR is specified', () => {
  const FORCE_EDITOR = 'Forced Editor'

  describe('without FORCE_EDITOR_PREFIXES', () => {
    const param: SetupParam = {
      editorSet: { chooser },
      env: { FORCE_EDITOR }
    }

    it('returns forced editor', async () => {
      const { result } = await setup(param)
      expect(result).toEqual({
        error: null,
        command: {
          path: FORCE_EDITOR,
          args: []
        }
      })
    })

    it('does not call which', async () => {
      const { which } = await setup(param)
      expect(which).not.toBeCalled()
    })
  })

  describe('with FORCE_EDITOR_PREFIXES being a valid yaml array of primitives', () => {
    const param: SetupParam = {
      editorSet: { chooser },
      env: {
        FORCE_EDITOR,
        FORCE_EDITOR_PREFIXES: '[abc, def, 123, ghi, 456, true, null, false]'
      }
    }

    it('returns Chosen(<Forced Editor>)', async () => {
      const { result } = await setup(param)
      expect(result).toEqual({
        error: null,
        command: {
          path: FORCE_EDITOR,
          args: ['abc', 'def', 123, 'ghi', 456, true, null, false]
        }
      })
    })

    it('does not call which', async () => {
      const { which } = await setup(param)
      expect(which).not.toBeCalled()
    })
  })

  describe('with FORCE_EDITOR_PREFIXES being a valid yaml array of primitives, objects and arrays', () => {
    const param: SetupParam = {
      editorSet: { chooser },
      env: {
        FORCE_EDITOR,
        FORCE_EDITOR_PREFIXES: '[abc, 123, {}, []]'
      }
    }

    it('returns InvalidPrefixes', async () => {
      const { result } = await setup(param)
      expect(result).toEqual({
        error: INVALID_PREFIXES,
        validatorResult: expect.any(JsonSchemaValidatorResult),
        instance: ['abc', 123, {}, []],
        envKey: 'FORCE_EDITOR_PREFIXES'
      })
    })

    it('does not call which', async () => {
      const { which } = await setup(param)
      expect(which).not.toBeCalled()
    })
  })

  describe('with FORCE_EDITOR_PREFIXES being a valid yaml non-array', () => {
    const param: SetupParam = {
      editorSet: { chooser },
      env: {
        FORCE_EDITOR,
        FORCE_EDITOR_PREFIXES: 'abc: 123'
      }
    }

    it('returns InvalidPrefixes', async () => {
      const { result } = await setup(param)
      expect(result).toEqual({
        error: INVALID_PREFIXES,
        validatorResult: expect.any(JsonSchemaValidatorResult),
        instance: { abc: 123 },
        envKey: 'FORCE_EDITOR_PREFIXES'
      })
    })

    it('does not call which', async () => {
      const { which } = await setup(param)
      expect(which).not.toBeCalled()
    })
  })

  describe('with FORCE_EDITOR_PREFIXES not being a valid yaml', () => {
    const param: SetupParam = {
      editorSet: { chooser },
      env: {
        FORCE_EDITOR,
        FORCE_EDITOR_PREFIXES: ': invalid : yaml : syntax :'
      }
    }

    it('returns PrefixesParsingFailure', async () => {
      const { result } = await setup(param)
      expect(result).toEqual({
        error: PREFIXES_PARSING_FAILURE,
        errorObject: expect.anything(),
        envValue: ': invalid : yaml : syntax :',
        envKey: 'FORCE_EDITOR_PREFIXES'
      })
    })

    it('does not call which', async () => {
      const { which } = await setup(param)
      expect(which).not.toBeCalled()
    })
  })
})

describe('when FORCE_EDITOR_PREFIXES is specified', () => {
  const editorSet: EditorSet = {
    graphical: [
      {
        program: 'code',
        flags: ['prefix'],
        options: { abc: 123, def: 456 },
        suffixes: ['suffix']
      }
    ],
    terminal: [],
    chooser
  }

  const ISINTTY = 'false'

  describe('valid yaml array of primitives', () => {
    const param: SetupParam = {
      editorSet,
      env: {
        ISINTTY,
        FORCE_EDITOR_PREFIXES: '[abc, def, 123, ghi, 456, true, null, false]'
      }
    }

    it('returns chosen editor', async () => {
      const { result } = await setup(param)
      expect(result).toEqual({
        error: null,
        command: {
          path: await mockedWhichImpl('code'),
          args: [
            'abc', 'def', 123, 'ghi', 456, true, null, false,
            '--prefix',
            '--abc', '123', '--def', '456',
            'suffix'
          ]
        }
      })
    })

    it('calls which till chosen one', async () => {
      const { which } = await setup(param)
      expect(which.mock.calls).toEqual([
        ['code', { all: false }]
      ])
    })
  })

  describe('valid yaml array of primitives and non-primitives', () => {
    const param: SetupParam = {
      editorSet,
      env: {
        ISINTTY,
        FORCE_EDITOR_PREFIXES: '[abc, 123, {}, []]'
      }
    }

    it('returns InvalidPrefixes', async () => {
      const { result } = await setup(param)
      expect(result).toEqual({
        error: INVALID_PREFIXES,
        validatorResult: expect.any(JsonSchemaValidatorResult),
        instance: ['abc', 123, {}, []],
        envKey: 'FORCE_EDITOR_PREFIXES'
      })
    })

    it('does not call which', async () => {
      const { which } = await setup(param)
      expect(which).not.toBeCalled()
    })
  })

  describe('valid yaml non-array', () => {
    const param: SetupParam = {
      editorSet,
      env: {
        ISINTTY,
        FORCE_EDITOR_PREFIXES: 'abc: 123'
      }
    }

    it('returns InvalidPrefixes', async () => {
      const { result } = await setup(param)
      expect(result).toEqual({
        error: INVALID_PREFIXES,
        validatorResult: expect.any(JsonSchemaValidatorResult),
        instance: { abc: 123 },
        envKey: 'FORCE_EDITOR_PREFIXES'
      })
    })

    it('does not call which', async () => {
      const { which } = await setup(param)
      expect(which).not.toBeCalled()
    })
  })

  describe('invalid yaml', () => {
    const param: SetupParam = {
      editorSet,
      env: {
        ISINTTY,
        FORCE_EDITOR_PREFIXES: ': not : valid : yaml :'
      }
    }

    it('returns PrefixesParsingFailure', async () => {
      const { result } = await setup(param)
      expect(result).toEqual({
        error: PREFIXES_PARSING_FAILURE,
        errorObject: expect.anything(),
        envValue: ': not : valid : yaml :',
        envKey: 'FORCE_EDITOR_PREFIXES'
      })
    })

    it('does not call which', async () => {
      const { which } = await setup(param)
      expect(which).not.toBeCalled()
    })
  })
})
