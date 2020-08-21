import { ok, err } from '@tsfun/result'
import MockedMainParam from './lib/mocked-main-param'

import {
  Status,
  CacheType,
  Env,
  CommandHandlingMethod,
  SpawnSyncReturn,
  main,
} from '@khai96x/choose-text-editor'

class DefaultParam extends MockedMainParam {
  constructor() {
    super({}, ok(null))
  }
}

async function setup(Param: typeof DefaultParam) {
  const param = new Param()
  const statusCode = await main(param)
  const statusName = Status[statusCode]
  return { param, statusCode, statusName }
}

describe('--clearCache all', () => {
  class Param extends DefaultParam {
    public readonly clearCache = CacheType.All
  }

  it('calls cosmiconfig once', async () => {
    const { param } = await setup(Param)
    expect(param.cosmiconfig).toBeCalledTimes(1)
  })

  it('calls cosmiconfig with expected arguments', async () => {
    const { param } = await setup(Param)
    expect(param.cosmiconfig).toBeCalledWith(param.packageName, {
      searchPlaces: param.searchPlaces,
      packageProp: param.packageProp,
      cache: param.cache,
      stopDir: param.stopDir,
    })
  })

  it('calls explorer.clearCaches once', async () => {
    const { param } = await setup(Param)
    expect(param.mockedCosmiConfig.explorer.clearCaches).toBeCalledTimes(1)
  })

  it('calls explorer.clearCaches with no arguments', async () => {
    const { param } = await setup(Param)
    expect(param.mockedCosmiConfig.explorer.clearCaches).toBeCalledWith()
  })

  it('returns status code of Success', async () => {
    const { statusName } = await setup(Param)
    expect(statusName).toBe(Status[Status.Success])
  })
})

describe('--showStatus', () => {
  class Param extends DefaultParam {
    public readonly showStatus = true
  }

  it('does not call cosmiconfig', async () => {
    const { param } = await setup(Param)
    expect(param.cosmiconfig).not.toBeCalled()
  })

  it('prints a table of status codes and names', async () => {
    const { param } = await setup(Param)
    expect(param.console.getInfoText()).toMatchSnapshot()
  })

  it('returns status code of Success', async () => {
    const { statusName } = await setup(Param)
    expect(statusName).toBe(Status[Status.Success])
  })
})

describe('load configuration file', () => {
  describe('when it fails to load configuration file', () => {
    class Param extends MockedMainParam {
      constructor() {
        super({}, err(new Error('Failed to load configuration file')))
      }
    }

    it('prints error messages', async () => {
      const { param } = await setup(Param)
      expect(param.console.getErrorText()).toMatchSnapshot()
    })

    it('returns status code of ConfigLoadingFailure', async () => {
      const { statusName } = await setup(Param)
      expect(statusName).toBe(Status[Status.ConfigLoadingFailure])
    })
  })

  describe('when no configuration file found', () => {
    class Param extends MockedMainParam {
      constructor() {
        super({}, ok(null))
      }
    }

    it('prints error messages', async () => {
      const { param } = await setup(Param)
      expect(param.console.getErrorText()).toMatchSnapshot()
    })

    it('returns status code of ConfigNotFound', async () => {
      const { statusName } = await setup(Param)
      expect(statusName).toBe(Status[Status.ConfigNotFound])
    })
  })

  describe('when configuration file is empty', () => {
    class Param extends MockedMainParam {
      constructor() {
        super(
          {},
          ok({
            isEmpty: true,
            config: undefined,
            filepath: '/path/to/config',
          }),
        )
      }
    }

    it('prints error messages', async () => {
      const { param } = await setup(Param)
      expect(param.console.getErrorText()).toMatchSnapshot()
    })

    it('returns status code of EmptyConfig', async () => {
      const { statusName } = await setup(Param)
      expect(statusName).toBe(Status[Status.EmptyConfig])
    })
  })
})

describe('validate loaded configuration', () => {
  describe('invalid editor set', () => {
    const invalidEditorSet = {
      chooser: ['not', 'a', 'string'],
      graphical: [
        { program: 123 },
      ],
    }

    class Param extends MockedMainParam {
      constructor() {
        super(
          {},
          ok({
            isEmpty: false,
            config: invalidEditorSet,
            filepath: '/path/to/config',
          }),
        )
      }
    }

    it('prints error messages', async () => {
      const { param } = await setup(Param)
      expect(param.console.getErrorText()).toMatchSnapshot()
    })

    it('returns status code of InvalidEditorSet', async () => {
      const { statusName } = await setup(Param)
      expect(statusName).toBe(Status[Status.InvalidEditorSet])
    })
  })

  describe('invalid chooser', () => {
    const invalidEditorSet = {
      chooser: 'not-valid-chooser',
    }

    class Param extends MockedMainParam {
      constructor() {
        super(
          {},
          ok({
            isEmpty: false,
            config: invalidEditorSet,
            filepath: '/path/to/config',
          }),
        )
      }
    }

    it('prints error messages', async () => {
      const { param } = await setup(Param)
      expect(param.console.getErrorText()).toMatchSnapshot()
    })

    it('returns status code of UnsatisfiedChooser', async () => {
      const { statusName } = await setup(Param)
      expect(statusName).toBe(Status[Status.UnsatisfiedChooser])
    })
  })
})

describe('fail to choose', () => {
  const env: Env = {
    ISINTTY: 'true',
  }

  const editorSet = {
    chooser: '@khai96x/choose-text-editor@^3.2.1',
    terminal: [
      { program: 'magic' },
    ],
  }

  class Param extends MockedMainParam {
    constructor() {
      super(
        env,
        ok({
          isEmpty: false,
          config: editorSet,
          filepath: 'path/to/config',
        }),
      )
    }
  }

  it('prints error messages', async () => {
    const { param } = await setup(Param)
    expect(param.console.getErrorText()).toMatchSnapshot()
  })

  it('returns non-zero status code', async () => {
    const { statusCode } = await setup(Param)
    expect(statusCode).not.toBe(Status.Success)
  })
})

describe('handle chosen command', () => {
  const env: Env = {
    ISINTTY: 'false',
  }

  const editorSet = {
    chooser: '@khai96x/choose-text-editor@^3.2.1',
    graphical: [
      { program: 'code', flags: ['wait'] },
    ],
  }

  class DefaultParam extends MockedMainParam {
    constructor() {
      super(
        env,
        ok({
          isEmpty: false,
          config: editorSet,
          filepath: 'path/to/config',
        }),
      )
    }
  }

  describe('default --onChosen', () => {
    class Param extends DefaultParam {}

    it('prints chosen command', async () => {
      const { param } = await setup(Param)
      expect(param.console.getInfoText()).toMatchSnapshot()
    })

    it('returns status code of Success', async () => {
      const { statusName } = await setup(Param)
      expect(statusName).toBe(Status[Status.Success])
    })
  })

  describe('--onChosen exec (child process exits with code 0)', () => {
    class Param extends DefaultParam {
      public readonly onChosen = CommandHandlingMethod.Execute
      public readonly spawnSync = jest.fn((): SpawnSyncReturn => ({ status: 0 }))
    }

    it('does not print anything to stdout', async () => {
      const { param } = await setup(Param)
      expect(param.console.info).not.toBeCalled()
    })

    it('does not print anything to stderr', async () => {
      const { param } = await setup(Param)
      expect(param.console.error).not.toBeCalled()
    })

    it('calls spawnSync once', async () => {
      const { param } = await setup(Param)
      expect(param.spawnSync).toBeCalledTimes(1)
    })

    it('calls spawnSync with expected arguments', async () => {
      const { mockedWhichImpl: which } = await import('./lib/mocked-which-impl')
      const { param } = await setup(Param)
      expect(param.spawnSync).toBeCalledWith(
        await which('code'),
        ['--wait', 'args from cli command'],
        { stdio: 'inherit' },
      )
    })

    it('returns status code of Success', async () => {
      const { statusName } = await setup(Param)
      expect(statusName).toBe(Status[Status.Success])
    })
  })
})

describe('consider exiting early', () => {
  const editorSet = {
    chooser: '@khai96x/choose-text-editor@^3.2.1',
    terminal: [
      { program: 'vim' },
    ],
  }

  describe('when FORCE_EDITOR environment variable is set', () => {
    const FORCE_EDITOR = 'FORCE_EDITOR'

    class Param extends MockedMainParam {
      constructor() {
        super(
          { FORCE_EDITOR },
          ok({
            isEmpty: false,
            config: editorSet,
            filepath: '/path/to/config',
          }),
        )
      }
    }

    it('calls choose', async () => {
      const { param } = await setup(Param)
      expect(param.choose.mock.calls).toMatchSnapshot()
    })

    it('prints command of FORCE_EDITOR', async () => {
      const { param } = await setup(Param)
      expect(param.console.getInfoText()).toMatchSnapshot()
    })

    it('does not call cosmiconfig', async () => {
      const { param } = await setup(Param)
      expect(param.cosmiconfig).not.toBeCalled()
    })

    it('returns status code of Success', async () => {
      const { statusName } = await setup(Param)
      expect(statusName).toBe(Status[Status.Success])
    })
  })

  describe('when FORCE_EDITOR environment variable is not set', () => {
    class Param extends MockedMainParam {
      constructor() {
        super(
          { ISINTTY: 'false' },
          ok({
            isEmpty: false,
            config: editorSet,
            filepath: '/path/to/config',
          }),
        )
      }
    }

    it('calls choose', async () => {
      const { param } = await setup(Param)
      expect(param.choose.mock.calls).toMatchSnapshot()
    })

    it('prints command of found editor', async () => {
      const { param } = await setup(Param)
      expect(param.console.getInfoText()).toMatchSnapshot()
    })

    it('calls cosmiconfig', async () => {
      const { param } = await setup(Param)
      expect(param.cosmiconfig.mock.calls).toMatchSnapshot()
    })

    it('returns status code of Success', async () => {
      const { statusName } = await setup(Param)
      expect(statusName).toBe(Status[Status.Success])
    })
  })
})
