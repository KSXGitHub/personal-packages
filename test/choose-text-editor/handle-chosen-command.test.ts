import {
  Command,
  CommandHandlingMethod,
  Status,
  SpawnSync,
  handleChosenCommand
} from '@khai96x/choose-text-editor'

import MockedConsole from './lib/mocked-console'

async function setup (
  handle: CommandHandlingMethod,
  spawnSyncImpl: SpawnSync = () => ({ status: 0 })
) {
  const args = ['a', 0, true, 'multiple words']
  const command: Command = {
    path: '/usr/bin/chosen-command',
    args: ['abc', 'def', 'multiple words again']
  }
  const console = new MockedConsole()
  const spawnSync = jest.fn(spawnSyncImpl)

  const result = await handleChosenCommand({
    handle,
    args,
    command,
    spawnSync,
    logInfo: console.info,
    logError: console.error
  })

  const status = Status[result]

  return {
    handle,
    args,
    command,
    console,
    spawnSync,
    result,
    status
  }
}

describe(`when handling method is ${CommandHandlingMethod.PrintSingleLine}`, () => {
  const handle = CommandHandlingMethod.PrintSingleLine

  it('calls logInfo', async () => {
    const { console } = await setup(handle)
    expect(console.getInfoLogs()).toMatchSnapshot()
  })

  it('does not call logError', async () => {
    const { console } = await setup(handle)
    expect(console.error).not.toBeCalled()
  })

  it('does not call spawnSync', async () => {
    const { spawnSync } = await setup(handle)
    expect(spawnSync).not.toBeCalled()
  })

  it('returns status of Success', async () => {
    const { status } = await setup(handle)
    expect(status).toBe(Status[Status.Success])
  })
})

describe(`when handling method is ${CommandHandlingMethod.PrintMultiLine}`, () => {
  const handle = CommandHandlingMethod.PrintMultiLine

  it('calls logInfo', async () => {
    const { console } = await setup(handle)
    expect(console.getInfoLogs()).toMatchSnapshot()
  })

  it('prints message matches snapshot', async () => {
    const { console } = await setup(handle)
    expect(console.getInfoText()).toMatchSnapshot()
  })

  it('does not call logError', async () => {
    const { console } = await setup(handle)
    expect(console.error).not.toBeCalled()
  })

  it('does not call spawnSync', async () => {
    const { spawnSync } = await setup(handle)
    expect(spawnSync).not.toBeCalled()
  })

  it('returns status of Success', async () => {
    const { status } = await setup(handle)
    expect(status).toBe(Status[Status.Success])
  })
})

describe(`when handling method is ${CommandHandlingMethod.PrintJson}`, () => {
  const handle = CommandHandlingMethod.PrintJson

  it('calls logInfo', async () => {
    const { console } = await setup(handle)
    expect(console.getInfoLogs()).toMatchSnapshot()
  })

  it('prints a valid JSON message', async () => {
    const { console } = await setup(handle)
    expect(JSON.parse(console.getInfoText())).toMatchSnapshot()
  })

  it('does not call logError', async () => {
    const { console } = await setup(handle)
    expect(console.error).not.toBeCalled()
  })

  it('does not call spawnSync', async () => {
    const { spawnSync } = await setup(handle)
    expect(spawnSync).not.toBeCalled()
  })

  it('returns status of Success', async () => {
    const { status } = await setup(handle)
    expect(status).toBe(Status[Status.Success])
  })
})

describe(`when handling method is ${CommandHandlingMethod.Execute}`, () => {
  const handle = CommandHandlingMethod.Execute

  describe('when spawnSync returns object with 0 as status code', () => {
    it('does not call logInfo', async () => {
      const { console } = await setup(handle)
      expect(console.info).not.toBeCalled()
    })

    it('does not call logError', async () => {
      const { console } = await setup(handle)
      expect(console.error).not.toBeCalled()
    })

    it('calls spawnSync', async () => {
      const { spawnSync } = await setup(handle)
      expect(spawnSync.mock.calls).toMatchSnapshot()
    })

    it('returns status of Success', async () => {
      const { status } = await setup(handle)
      expect(status).toBe(Status[Status.Success])
    })
  })

  describe('when spawnSync returns object with non-zero status', () => {
    const spawnSyncImpl: SpawnSync = () => ({ status: 123 })

    it('does not call logInfo', async () => {
      const { console } = await setup(handle, spawnSyncImpl)
      expect(console.info).not.toBeCalled()
    })

    it('calls logError', async () => {
      const { console } = await setup(handle, spawnSyncImpl)
      expect(console.getErrorLogs()).toMatchSnapshot()
    })

    it('prints error message matches snapshot', async () => {
      const { console } = await setup(handle, spawnSyncImpl)
      expect(console.getErrorText()).toMatchSnapshot()
    })

    it('calls spawnSync', async () => {
      const { spawnSync } = await setup(handle, spawnSyncImpl)
      expect(spawnSync.mock.calls).toMatchSnapshot()
    })

    it('returns status of ExecutionFailure', async () => {
      const { status } = await setup(handle, spawnSyncImpl)
      expect(status).toBe(Status[Status.ExecutionFailure])
    })
  })

  describe('when spawnSync returns object with non-null error', () => {
    class CustomError {
      errno = -2
      code = 'ENOENT'
      syscall = 'spawnSync'
      path = '{path}'
      spawnargs = []
    }

    const spawnSyncImpl: SpawnSync = () => ({
      status: null,
      error: new CustomError() as any
    })

    it('does not call logInfo', async () => {
      const { console } = await setup(handle, spawnSyncImpl)
      expect(console.info).not.toBeCalled()
    })

    it('calls logError', async () => {
      const { console } = await setup(handle, spawnSyncImpl)
      expect(console.getErrorLogs()).toMatchSnapshot()
    })

    it('prints error message matches snapshot', async () => {
      const { console } = await setup(handle, spawnSyncImpl)
      expect(console.getErrorText()).toMatchSnapshot()
    })

    it('calls spawnSync', async () => {
      const { spawnSync } = await setup(handle, spawnSyncImpl)
      expect(spawnSync.mock.calls).toMatchSnapshot()
    })

    it('returns status of ExecutionFailure', async () => {
      const { status } = await setup(handle, spawnSyncImpl)
      expect(status).toBe(Status[Status.ExecutionFailure])
    })
  })
})
