import { ChangeType, ExitStatus, bumpPackageVersions } from '@khai96x/bump-package-versions'
import createFileSystem from './filesystem'

class FileSystem {
  public readonly core = createFileSystem({
    'public/0.0.0/package.json': {
      version: '0.0.0',
    },
    'public/0.0.1/package.json': {
      version: '0.0.1',
    },
    'public/0.1.2/package.json': {
      version: '0.1.2',
    },
    'public/1.2.3/package.json': {
      version: '1.2.3',
    },
    'private/0.0.0/package.json': {
      private: true,
      version: '0.0.0',
    },
    'private/0.0.1/package.json': {
      private: true,
      version: '0.0.1',
    },
    'private/0.1.2/package.json': {
      private: true,
      version: '0.1.2',
    },
    'private/1.2.3/package.json': {
      name: 'a',
      private: true,
      version: '1.2.3',
    },
    'invalid/no-version/package.json': {},
    'invalid/version-null/package.json': {
      version: null,
    },
    'invalid/version-number/package.json': {
      version: 123,
    },
    'invalid/version-not-semver/package.json': {
      version: 'abcdef',
    },
    'invalid/null/package.json': null,
    'invalid/true/package.json': true,
    'invalid/false/package.json': false,
    'invalid/string/package.json': 'string',
    'invalid/number/package.json': 123,
    'invalid/array/package.json': [0, 1, 2, 3],
  })

  public readonly readFile = this.core.readFile
  public readonly writeFile = this.core.writeFile
}

class Console {
  public readonly logs = Array<readonly ['out' | 'err', string]>()
  public readonly getLogs = () => '\n' + this.logs.map(([a, b]) => a + ' │ ' + b).join('\n') + '\n'
  public readonly info = jest.fn((message: string) => void this.logs.push(['out', message]))
  public readonly error = jest.fn((message: string) => void this.logs.push(['err', message]))
}

class Process {
  public static readonly value = Symbol('value')
  public readonly exit = jest.fn(() => Process.value)
}

const DEFAULT_OPTIONS = {
  finalNewLines: 1,
  jsonIndent: 2,
  skipPrivate: false,
} as const

describe('when filenames is empty', () => {
  async function setup() {
    const { core, ...fs } = new FileSystem()
    const console = new Console()
    const process = new Process()
    const oldFsObj = core.snapshotObject()
    const oldFsYaml = core.snapshotYaml(oldFsObj)

    const result = await bumpPackageVersions({
      ...DEFAULT_OPTIONS,
      filenames: [],
      changeType: ChangeType.OfficialRelease,
      fs,
      console,
      process,
    })

    const newFsObj = core.snapshotObject()
    const newFsYaml = core.snapshotYaml(newFsObj)

    return {
      oldFsObj,
      oldFsYaml,
      newFsObj,
      newFsYaml,
      result,
      ...fs,
      ...console,
      ...process,
    }
  }

  it('does not call fs.readFile', async () => {
    const { readFile } = await setup()
    expect(readFile).not.toBeCalled()
  })

  it('does not call fs.writeFile', async () => {
    const { writeFile } = await setup()
    expect(writeFile).not.toBeCalled()
  })

  it('does not call console.info', async () => {
    const { info } = await setup()
    expect(info).not.toBeCalled()
  })

  it('does not call console.error', async () => {
    const { error } = await setup()
    expect(error).not.toBeCalled()
  })

  it('calls process.exit once', async () => {
    const { exit } = await setup()
    expect(exit).toHaveBeenCalledTimes(1)
  })

  it('calls process.exit with ExitStatus.Success', async () => {
    const { exit } = await setup()
    expect(exit).toBeCalledWith(ExitStatus.Success)
  })

  it('no logs', async () => {
    const { getLogs } = await setup()
    expect(getLogs().trim()).toBe('')
  })

  it('does not mutate filesystem', async () => {
    const { oldFsObj, newFsObj } = await setup()
    expect(newFsObj).toEqual(oldFsObj)
  })

  it('returns result of process.exit', async () => {
    const { result } = await setup()
    expect(result).toBe(Process.value)
  })
})

describe('when filenames includes path that point to invalid file', () => {
  const filenames = [
    'public/0.0.0/package.json',
    'public/0.0.1/package.json',
    'public/0.1.2/package.json',
    'public/1.2.3/package.json',
    'private/0.0.0/package.json',
    'private/0.0.1/package.json',
    'private/0.1.2/package.json',
    'private/1.2.3/package.json',
    'invalid/no-version/package.json',
    'invalid/version-null/package.json',
    'invalid/version-number/package.json',
    'invalid/version-not-semver/package.json',
    'invalid/null/package.json',
    'invalid/true/package.json',
    'invalid/false/package.json',
    'invalid/string/package.json',
    'invalid/number/package.json',
    'invalid/array/package.json',
  ]

  async function setup() {
    const { core, ...fs } = new FileSystem()
    const console = new Console()
    const process = new Process()
    const oldFsObj = core.snapshotObject()
    const oldFsYaml = core.snapshotYaml(oldFsObj)

    const result = await bumpPackageVersions({
      ...DEFAULT_OPTIONS,
      changeType: ChangeType.OfficialRelease,
      filenames,
      fs,
      console,
      process,
    })

    const newFsObj = core.snapshotObject()
    const newFsYaml = core.snapshotYaml(newFsObj)

    return {
      oldFsObj,
      oldFsYaml,
      newFsObj,
      newFsYaml,
      result,
      ...fs,
      ...console,
      ...process,
    }
  }

  it('calls fs.readFile multiple times', async () => {
    const { readFile } = await setup()
    expect(readFile.mock.calls).toMatchSnapshot()
  })

  it('does not call fs.writeFile', async () => {
    const { writeFile } = await setup()
    expect(writeFile).not.toBeCalled()
  })

  it('calls console.info multiple times', async () => {
    const { info } = await setup()
    expect(info).not.toBeCalled()
  })

  it('calls console.error multiple times', async () => {
    const { error } = await setup()
    expect(error.mock.calls).toMatchSnapshot()
  })

  it('calls process.exit once', async () => {
    const { exit } = await setup()
    expect(exit).toHaveBeenCalledTimes(1)
  })

  it('calls process.exit with ExitStatus.Failure', async () => {
    const { exit } = await setup()
    expect(exit).toBeCalledWith(ExitStatus.Failure)
  })

  it('logs', async () => {
    const { getLogs } = await setup()
    expect(getLogs()).toMatchSnapshot()
  })

  it('does not mutate filesystem', async () => {
    const { oldFsObj, newFsObj } = await setup()
    expect(newFsObj).toEqual(oldFsObj)
  })

  it('returns result of process.exit', async () => {
    const { result } = await setup()
    expect(result).toBe(Process.value)
  })
})

describe('when filenames contains only paths that point to valid files', () => {
  const filenames = [
    'public/0.0.0/package.json',
    'public/0.0.1/package.json',
    'public/0.1.2/package.json',
    'public/1.2.3/package.json',
    'private/0.0.0/package.json',
    'private/0.0.1/package.json',
    'private/0.1.2/package.json',
    'private/1.2.3/package.json',
  ] as const

  describe('changeType = ChangeType.OfficialRelease; skipPrivate = false', () => {
    const changeType = ChangeType.OfficialRelease
    const skipPrivate = false

    async function setup() {
      const { core, ...fs } = new FileSystem()
      const console = new Console()
      const process = new Process()
      const oldFsObj = core.snapshotObject()
      const oldFsYaml = core.snapshotYaml(oldFsObj)

      const result = await bumpPackageVersions({
        ...DEFAULT_OPTIONS,
        filenames,
        changeType,
        skipPrivate,
        fs,
        console,
        process,
      })

      const newFsObj = core.snapshotObject()
      const newFsYaml = core.snapshotYaml(newFsObj)

      return {
        oldFsObj,
        oldFsYaml,
        newFsObj,
        newFsYaml,
        result,
        ...fs,
        ...console,
        ...process,
      }
    }

    it('calls fs.readFile multiple times', async () => {
      const { readFile } = await setup()
      expect(readFile.mock.calls).toMatchSnapshot()
    })

    it('calls fs.writeFile multiple times', async () => {
      const { writeFile } = await setup()
      expect(writeFile.mock.calls).toMatchSnapshot()
    })

    it('calls fs.writeFile on files that do not have "private": true', async () => {
      const { writeFile } = await setup()
      expect(writeFile).toBeCalledWith(
        expect.anything(),
        expect.not.stringContaining('"private": true'),
      )
    })

    it('calls fs.writeFile on files that have "private": true', async () => {
      const { writeFile } = await setup()
      expect(writeFile).toBeCalledWith(
        expect.anything(),
        expect.stringContaining('"private": true'),
      )
    })

    it('calls console.info multiple times', async () => {
      const { info } = await setup()
      expect(info.mock.calls).toMatchSnapshot()
    })

    it('does not call console.error', async () => {
      const { error } = await setup()
      expect(error).not.toBeCalled()
    })

    it('calls process.exit once', async () => {
      const { exit } = await setup()
      expect(exit).toHaveBeenCalledTimes(1)
    })

    it('calls process.exit with ExitStatus.Success', async () => {
      const { exit } = await setup()
      expect(exit).toBeCalledWith(ExitStatus.Success)
    })

    it('logs', async () => {
      const { getLogs } = await setup()
      expect(getLogs()).toMatchSnapshot()
    })

    it('mutates the filesystem', async () => {
      const { diffLines } = await import('diff')
      const { prettify } = await import('./pretty-diff')
      const { oldFsYaml, newFsYaml } = await setup()
      expect(prettify(diffLines(oldFsYaml, newFsYaml))).toMatchSnapshot()
    })

    it('returns result of process.exit', async () => {
      const { result } = await setup()
      expect(result).toBe(Process.value)
    })
  })

  describe('changeType = ChangeType.BreakingChange; skipPrivate = false', () => {
    const changeType = ChangeType.BreakingChange
    const skipPrivate = false

    async function setup() {
      const { core, ...fs } = new FileSystem()
      const console = new Console()
      const process = new Process()
      const oldFsObj = core.snapshotObject()
      const oldFsYaml = core.snapshotYaml(oldFsObj)

      const result = await bumpPackageVersions({
        ...DEFAULT_OPTIONS,
        filenames,
        changeType,
        skipPrivate,
        fs,
        console,
        process,
      })

      const newFsObj = core.snapshotObject()
      const newFsYaml = core.snapshotYaml(newFsObj)

      return {
        oldFsObj,
        oldFsYaml,
        newFsObj,
        newFsYaml,
        result,
        ...fs,
        ...console,
        ...process,
      }
    }

    it('calls fs.readFile multiple times', async () => {
      const { readFile } = await setup()
      expect(readFile.mock.calls).toMatchSnapshot()
    })

    it('calls fs.writeFile multiple times', async () => {
      const { writeFile } = await setup()
      expect(writeFile.mock.calls).toMatchSnapshot()
    })

    it('calls fs.writeFile on files that do not have "private": true', async () => {
      const { writeFile } = await setup()
      expect(writeFile).toBeCalledWith(
        expect.anything(),
        expect.not.stringContaining('"private": true'),
      )
    })

    it('calls fs.writeFile on files that have "private": true', async () => {
      const { writeFile } = await setup()
      expect(writeFile).toBeCalledWith(
        expect.anything(),
        expect.stringContaining('"private": true'),
      )
    })

    it('calls console.info multiple times', async () => {
      const { info } = await setup()
      expect(info.mock.calls).toMatchSnapshot()
    })

    it('does not call console.error', async () => {
      const { error } = await setup()
      expect(error).not.toBeCalled()
    })

    it('calls process.exit once', async () => {
      const { exit } = await setup()
      expect(exit).toHaveBeenCalledTimes(1)
    })

    it('calls process.exit with ExitStatus.Success', async () => {
      const { exit } = await setup()
      expect(exit).toBeCalledWith(ExitStatus.Success)
    })

    it('logs', async () => {
      const { getLogs } = await setup()
      expect(getLogs()).toMatchSnapshot()
    })

    it('mutates the filesystem', async () => {
      const { diffLines } = await import('diff')
      const { prettify } = await import('./pretty-diff')
      const { oldFsYaml, newFsYaml } = await setup()
      expect(prettify(diffLines(oldFsYaml, newFsYaml))).toMatchSnapshot()
    })

    it('returns result of process.exit', async () => {
      const { result } = await setup()
      expect(result).toBe(Process.value)
    })
  })

  describe('changeType = ChangeType.FeatureAddition; skipPrivate = false', () => {
    const changeType = ChangeType.FeatureAddition
    const skipPrivate = false

    async function setup() {
      const { core, ...fs } = new FileSystem()
      const console = new Console()
      const process = new Process()
      const oldFsObj = core.snapshotObject()
      const oldFsYaml = core.snapshotYaml(oldFsObj)

      const result = await bumpPackageVersions({
        ...DEFAULT_OPTIONS,
        filenames,
        changeType,
        skipPrivate,
        fs,
        console,
        process,
      })

      const newFsObj = core.snapshotObject()
      const newFsYaml = core.snapshotYaml(newFsObj)

      return {
        oldFsObj,
        oldFsYaml,
        newFsObj,
        newFsYaml,
        result,
        ...fs,
        ...console,
        ...process,
      }
    }

    it('calls fs.readFile multiple times', async () => {
      const { readFile } = await setup()
      expect(readFile.mock.calls).toMatchSnapshot()
    })

    it('calls fs.writeFile multiple times', async () => {
      const { writeFile } = await setup()
      expect(writeFile.mock.calls).toMatchSnapshot()
    })

    it('calls fs.writeFile on files that do not have "private": true', async () => {
      const { writeFile } = await setup()
      expect(writeFile).toBeCalledWith(
        expect.anything(),
        expect.not.stringContaining('"private": true'),
      )
    })

    it('calls fs.writeFile on files that have "private": true', async () => {
      const { writeFile } = await setup()
      expect(writeFile).toBeCalledWith(
        expect.anything(),
        expect.stringContaining('"private": true'),
      )
    })

    it('calls console.info multiple times', async () => {
      const { info } = await setup()
      expect(info.mock.calls).toMatchSnapshot()
    })

    it('does not call console.error', async () => {
      const { error } = await setup()
      expect(error).not.toBeCalled()
    })

    it('calls process.exit once', async () => {
      const { exit } = await setup()
      expect(exit).toHaveBeenCalledTimes(1)
    })

    it('calls process.exit with ExitStatus.Success', async () => {
      const { exit } = await setup()
      expect(exit).toBeCalledWith(ExitStatus.Success)
    })

    it('logs', async () => {
      const { getLogs } = await setup()
      expect(getLogs()).toMatchSnapshot()
    })

    it('mutates the filesystem', async () => {
      const { diffLines } = await import('diff')
      const { prettify } = await import('./pretty-diff')
      const { oldFsYaml, newFsYaml } = await setup()
      expect(prettify(diffLines(oldFsYaml, newFsYaml))).toMatchSnapshot()
    })

    it('returns result of process.exit', async () => {
      const { result } = await setup()
      expect(result).toBe(Process.value)
    })
  })

  describe('changeType = ChangeType.Patch; skipPrivate = false', () => {
    const changeType = ChangeType.Patch
    const skipPrivate = false

    async function setup() {
      const { core, ...fs } = new FileSystem()
      const console = new Console()
      const process = new Process()
      const oldFsObj = core.snapshotObject()
      const oldFsYaml = core.snapshotYaml(oldFsObj)

      const result = await bumpPackageVersions({
        ...DEFAULT_OPTIONS,
        filenames,
        changeType,
        skipPrivate,
        fs,
        console,
        process,
      })

      const newFsObj = core.snapshotObject()
      const newFsYaml = core.snapshotYaml(newFsObj)

      return {
        oldFsObj,
        oldFsYaml,
        newFsObj,
        newFsYaml,
        result,
        ...fs,
        ...console,
        ...process,
      }
    }

    it('calls fs.readFile multiple times', async () => {
      const { readFile } = await setup()
      expect(readFile.mock.calls).toMatchSnapshot()
    })

    it('calls fs.writeFile multiple times', async () => {
      const { writeFile } = await setup()
      expect(writeFile.mock.calls).toMatchSnapshot()
    })

    it('calls fs.writeFile on files that do not have "private": true', async () => {
      const { writeFile } = await setup()
      expect(writeFile).toBeCalledWith(
        expect.anything(),
        expect.not.stringContaining('"private": true'),
      )
    })

    it('calls fs.writeFile on files that have "private": true', async () => {
      const { writeFile } = await setup()
      expect(writeFile).toBeCalledWith(
        expect.anything(),
        expect.stringContaining('"private": true'),
      )
    })

    it('calls console.info multiple times', async () => {
      const { info } = await setup()
      expect(info.mock.calls).toMatchSnapshot()
    })

    it('does not call console.error', async () => {
      const { error } = await setup()
      expect(error).not.toBeCalled()
    })

    it('calls process.exit once', async () => {
      const { exit } = await setup()
      expect(exit).toHaveBeenCalledTimes(1)
    })

    it('calls process.exit with ExitStatus.Success', async () => {
      const { exit } = await setup()
      expect(exit).toBeCalledWith(ExitStatus.Success)
    })

    it('logs', async () => {
      const { getLogs } = await setup()
      expect(getLogs()).toMatchSnapshot()
    })

    it('mutates the filesystem', async () => {
      const { diffLines } = await import('diff')
      const { prettify } = await import('./pretty-diff')
      const { oldFsYaml, newFsYaml } = await setup()
      expect(prettify(diffLines(oldFsYaml, newFsYaml))).toMatchSnapshot()
    })

    it('returns result of process.exit', async () => {
      const { result } = await setup()
      expect(result).toBe(Process.value)
    })
  })

  describe('changeType = ChangeType.OfficialRelease; skipPrivate = true', () => {
    const changeType = ChangeType.OfficialRelease
    const skipPrivate = true

    async function setup() {
      const { core, ...fs } = new FileSystem()
      const console = new Console()
      const process = new Process()
      const oldFsObj = core.snapshotObject()
      const oldFsYaml = core.snapshotYaml(oldFsObj)

      const result = await bumpPackageVersions({
        ...DEFAULT_OPTIONS,
        filenames,
        changeType,
        skipPrivate,
        fs,
        console,
        process,
      })

      const newFsObj = core.snapshotObject()
      const newFsYaml = core.snapshotYaml(newFsObj)

      return {
        oldFsObj,
        oldFsYaml,
        newFsObj,
        newFsYaml,
        result,
        ...fs,
        ...console,
        ...process,
      }
    }

    it('calls fs.readFile multiple times', async () => {
      const { readFile } = await setup()
      expect(readFile.mock.calls).toMatchSnapshot()
    })

    it('calls fs.writeFile multiple times', async () => {
      const { writeFile } = await setup()
      expect(writeFile.mock.calls).toMatchSnapshot()
    })

    it('calls fs.writeFile on files that do not have "private": true', async () => {
      const { writeFile } = await setup()
      expect(writeFile).toBeCalledWith(
        expect.anything(),
        expect.not.stringContaining('"private": true'),
      )
    })

    it('does not call fs.writeFile on files that have "private": true', async () => {
      const { writeFile } = await setup()
      expect(writeFile).not.toBeCalledWith(
        expect.anything(),
        expect.stringContaining('"private": true'),
      )
    })

    it('calls console.info multiple times', async () => {
      const { info } = await setup()
      expect(info.mock.calls).toMatchSnapshot()
    })

    it('does not call console.error', async () => {
      const { error } = await setup()
      expect(error).not.toBeCalled()
    })

    it('calls process.exit once', async () => {
      const { exit } = await setup()
      expect(exit).toHaveBeenCalledTimes(1)
    })

    it('calls process.exit with ExitStatus.Success', async () => {
      const { exit } = await setup()
      expect(exit).toBeCalledWith(ExitStatus.Success)
    })

    it('logs', async () => {
      const { getLogs } = await setup()
      expect(getLogs()).toMatchSnapshot()
    })

    it('mutates the filesystem', async () => {
      const { diffLines } = await import('diff')
      const { prettify } = await import('./pretty-diff')
      const { oldFsYaml, newFsYaml } = await setup()
      expect(prettify(diffLines(oldFsYaml, newFsYaml))).toMatchSnapshot()
    })

    it('returns result of process.exit', async () => {
      const { result } = await setup()
      expect(result).toBe(Process.value)
    })
  })

  describe('changeType = ChangeType.BreakingChange; skipPrivate = true', () => {
    const changeType = ChangeType.BreakingChange
    const skipPrivate = true

    async function setup() {
      const { core, ...fs } = new FileSystem()
      const console = new Console()
      const process = new Process()
      const oldFsObj = core.snapshotObject()
      const oldFsYaml = core.snapshotYaml(oldFsObj)

      const result = await bumpPackageVersions({
        ...DEFAULT_OPTIONS,
        filenames,
        changeType,
        skipPrivate,
        fs,
        console,
        process,
      })

      const newFsObj = core.snapshotObject()
      const newFsYaml = core.snapshotYaml(newFsObj)

      return {
        oldFsObj,
        oldFsYaml,
        newFsObj,
        newFsYaml,
        result,
        ...fs,
        ...console,
        ...process,
      }
    }

    it('calls fs.readFile multiple times', async () => {
      const { readFile } = await setup()
      expect(readFile.mock.calls).toMatchSnapshot()
    })

    it('calls fs.writeFile multiple times', async () => {
      const { writeFile } = await setup()
      expect(writeFile.mock.calls).toMatchSnapshot()
    })

    it('calls fs.writeFile on files that do not have "private": true', async () => {
      const { writeFile } = await setup()
      expect(writeFile).toBeCalledWith(
        expect.anything(),
        expect.not.stringContaining('"private": true'),
      )
    })

    it('does not call fs.writeFile on files that have "private": true', async () => {
      const { writeFile } = await setup()
      expect(writeFile).not.toBeCalledWith(
        expect.anything(),
        expect.stringContaining('"private": true'),
      )
    })

    it('calls console.info multiple times', async () => {
      const { info } = await setup()
      expect(info.mock.calls).toMatchSnapshot()
    })

    it('does not call console.error', async () => {
      const { error } = await setup()
      expect(error).not.toBeCalled()
    })

    it('calls process.exit once', async () => {
      const { exit } = await setup()
      expect(exit).toHaveBeenCalledTimes(1)
    })

    it('calls process.exit with ExitStatus.Success', async () => {
      const { exit } = await setup()
      expect(exit).toBeCalledWith(ExitStatus.Success)
    })

    it('logs', async () => {
      const { getLogs } = await setup()
      expect(getLogs()).toMatchSnapshot()
    })

    it('mutates the filesystem', async () => {
      const { diffLines } = await import('diff')
      const { prettify } = await import('./pretty-diff')
      const { oldFsYaml, newFsYaml } = await setup()
      expect(prettify(diffLines(oldFsYaml, newFsYaml))).toMatchSnapshot()
    })

    it('returns result of process.exit', async () => {
      const { result } = await setup()
      expect(result).toBe(Process.value)
    })
  })

  describe('changeType = ChangeType.FeatureAddition; skipPrivate = true', () => {
    const changeType = ChangeType.FeatureAddition
    const skipPrivate = true

    async function setup() {
      const { core, ...fs } = new FileSystem()
      const console = new Console()
      const process = new Process()
      const oldFsObj = core.snapshotObject()
      const oldFsYaml = core.snapshotYaml(oldFsObj)

      const result = await bumpPackageVersions({
        ...DEFAULT_OPTIONS,
        filenames,
        changeType,
        skipPrivate,
        fs,
        console,
        process,
      })

      const newFsObj = core.snapshotObject()
      const newFsYaml = core.snapshotYaml(newFsObj)

      return {
        oldFsObj,
        oldFsYaml,
        newFsObj,
        newFsYaml,
        result,
        ...fs,
        ...console,
        ...process,
      }
    }

    it('calls fs.readFile multiple times', async () => {
      const { readFile } = await setup()
      expect(readFile.mock.calls).toMatchSnapshot()
    })

    it('calls fs.writeFile multiple times', async () => {
      const { writeFile } = await setup()
      expect(writeFile.mock.calls).toMatchSnapshot()
    })

    it('calls fs.writeFile on files that do not have "private": true', async () => {
      const { writeFile } = await setup()
      expect(writeFile).toBeCalledWith(
        expect.anything(),
        expect.not.stringContaining('"private": true'),
      )
    })

    it('does not call fs.writeFile on files that have "private": true', async () => {
      const { writeFile } = await setup()
      expect(writeFile).not.toBeCalledWith(
        expect.anything(),
        expect.stringContaining('"private": true'),
      )
    })

    it('calls console.info multiple times', async () => {
      const { info } = await setup()
      expect(info.mock.calls).toMatchSnapshot()
    })

    it('does not call console.error', async () => {
      const { error } = await setup()
      expect(error).not.toBeCalled()
    })

    it('calls process.exit once', async () => {
      const { exit } = await setup()
      expect(exit).toHaveBeenCalledTimes(1)
    })

    it('calls process.exit with ExitStatus.Success', async () => {
      const { exit } = await setup()
      expect(exit).toBeCalledWith(ExitStatus.Success)
    })

    it('logs', async () => {
      const { getLogs } = await setup()
      expect(getLogs()).toMatchSnapshot()
    })

    it('mutates the filesystem', async () => {
      const { diffLines } = await import('diff')
      const { prettify } = await import('./pretty-diff')
      const { oldFsYaml, newFsYaml } = await setup()
      expect(prettify(diffLines(oldFsYaml, newFsYaml))).toMatchSnapshot()
    })

    it('returns result of process.exit', async () => {
      const { result } = await setup()
      expect(result).toBe(Process.value)
    })
  })

  describe('changeType = ChangeType.Patch; skipPrivate = true', () => {
    const changeType = ChangeType.Patch
    const skipPrivate = true

    async function setup() {
      const { core, ...fs } = new FileSystem()
      const console = new Console()
      const process = new Process()
      const oldFsObj = core.snapshotObject()
      const oldFsYaml = core.snapshotYaml(oldFsObj)

      const result = await bumpPackageVersions({
        ...DEFAULT_OPTIONS,
        filenames,
        changeType,
        skipPrivate,
        fs,
        console,
        process,
      })

      const newFsObj = core.snapshotObject()
      const newFsYaml = core.snapshotYaml(newFsObj)

      return {
        oldFsObj,
        oldFsYaml,
        newFsObj,
        newFsYaml,
        result,
        ...fs,
        ...console,
        ...process,
      }
    }

    it('calls fs.readFile multiple times', async () => {
      const { readFile } = await setup()
      expect(readFile.mock.calls).toMatchSnapshot()
    })

    it('calls fs.writeFile multiple times', async () => {
      const { writeFile } = await setup()
      expect(writeFile.mock.calls).toMatchSnapshot()
    })

    it('calls fs.writeFile on files that do not have "private": true', async () => {
      const { writeFile } = await setup()
      expect(writeFile).toBeCalledWith(
        expect.anything(),
        expect.not.stringContaining('"private": true'),
      )
    })

    it('does not call fs.writeFile on files that have "private": true', async () => {
      const { writeFile } = await setup()
      expect(writeFile).not.toBeCalledWith(
        expect.anything(),
        expect.stringContaining('"private": true'),
      )
    })

    it('calls console.info multiple times', async () => {
      const { info } = await setup()
      expect(info.mock.calls).toMatchSnapshot()
    })

    it('does not call console.error', async () => {
      const { error } = await setup()
      expect(error).not.toBeCalled()
    })

    it('calls process.exit once', async () => {
      const { exit } = await setup()
      expect(exit).toHaveBeenCalledTimes(1)
    })

    it('calls process.exit with ExitStatus.Success', async () => {
      const { exit } = await setup()
      expect(exit).toBeCalledWith(ExitStatus.Success)
    })

    it('logs', async () => {
      const { getLogs } = await setup()
      expect(getLogs()).toMatchSnapshot()
    })

    it('mutates the filesystem', async () => {
      const { diffLines } = await import('diff')
      const { prettify } = await import('./pretty-diff')
      const { oldFsYaml, newFsYaml } = await setup()
      expect(prettify(diffLines(oldFsYaml, newFsYaml))).toMatchSnapshot()
    })

    it('returns result of process.exit', async () => {
      const { result } = await setup()
      expect(result).toBe(Process.value)
    })
  })
})
