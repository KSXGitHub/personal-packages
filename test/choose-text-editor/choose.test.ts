import { ok, err } from '@tsfun/result'
import { EditorSet, Env, choose, NOT_FOUND, INDETERMINABLE_TTY } from '@khai96x/choose-text-editor'
import mockedWhichImpl from './lib/mocked-which-impl'

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

    it('returns err(NOT_FOUND)', async () => {
      const { result } = await setup(param)
      expect(result).toEqual(err(NOT_FOUND))
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

    it('returns err(NOT_FOUND)', async () => {
      const { result } = await setup(param)
      expect(result).toEqual(err(NOT_FOUND))
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

    it('returns err(INDETERMINABLE_TTY)', async () => {
      const { result } = await setup(param)
      expect(result).toEqual(err(INDETERMINABLE_TTY))
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

    it('returns err(NOT_FOUND)', async () => {
      const { result } = await setup(param)
      expect(result).toEqual(err(NOT_FOUND))
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

    it('returns ok(<FirstFound>)', async () => {
      const { result } = await setup(param)
      expect(result).toEqual(ok({
        path: await mockedWhichImpl('code'),
        args: ['--wait']
      }))
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

    it('returns ok(<FirstFoundTerminalEditor>)', async () => {
      const { result } = await setup(param)
      expect(result).toEqual(ok({
        path: await mockedWhichImpl('vim'),
        args: []
      }))
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

    it('returns ok(<FirstFoundTerminalEditor>)', async () => {
      const { result } = await setup(param)
      expect(result).toEqual(ok({
        path: await mockedWhichImpl('vim'),
        args: []
      }))
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
