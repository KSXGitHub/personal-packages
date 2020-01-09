import { ok, err } from '@tsfun/result'
import MockedMainParam from './lib/mocked-main-param'

import {
  Status,
  CacheType,
  main
} from '@khai96x/choose-text-editor'

class DefaultParam extends MockedMainParam {
  constructor () {
    super({}, ok(null))
  }
}

async function setup (Param: typeof DefaultParam) {
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
      stopDir: param.stopDir
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
      constructor () {
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
      constructor () {
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
      constructor () {
        super({}, ok({
          isEmpty: true,
          config: undefined,
          filepath: '/path/to/config'
        }))
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
        { program: 123 }
      ]
    }

    class Param extends MockedMainParam {
      constructor () {
        super({}, ok({
          isEmpty: false,
          config: invalidEditorSet,
          filepath: '/path/to/config'
        }))
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
      chooser: 'not-valid-chooser'
    }

    class Param extends MockedMainParam {
      constructor () {
        super({}, ok({
          isEmpty: false,
          config: invalidEditorSet,
          filepath: '/path/to/config'
        }))
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
