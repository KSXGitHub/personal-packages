import path from 'path'

import {
  Host,
  GitUrlInfo,
  FileSystem,
  PullCloneOptionsByInfo,
  PullCloneOptionsByUrl,
  pullOrCloneByInfo,
  pullOrCloneByUrl,
  createGitUrl
} from '@khai96x/repo-manager'

function mockedFunctions () {
  const history = Array<any>()
  const mkfn = (func: string) => jest.fn((arg: any) => void history.push({ func, arg }))
  const clone = mkfn('clone')
  const pull = mkfn('pull')
  const checkout = mkfn('checkout')
  return { history, clone, pull, checkout }
}

describe('pullOrCloneByInfo', () => {
  const info: GitUrlInfo = {
    host: Host.GitHub,
    owner: 'org',
    name: 'repo'
  }

  async function setupBase (pathExists: FileSystem.PathExists) {
    const { history, ...fns } = mockedFunctions()
    const options: PullCloneOptionsByInfo = {
      ...fns,
      info,
      prefix: 'prefix',
      ref: 'master',
      fs: { pathExists }
    }
    await pullOrCloneByInfo(options)
    return { history, info, options, ...fns }
  }

  describe('when directory has yet to exist', () => {
    const setup = () => setupBase(() => false)

    it('calls clone once', async () => {
      const { clone } = await setup()
      expect(clone).toBeCalledTimes(1)
    })

    it('calls clone with url and dir', async () => {
      const { clone, info } = await setup()
      expect(clone).toBeCalledWith({
        url: createGitUrl(info),
        dir: path.join('prefix', 'github', 'org', 'repo')
      })
    })

    it('does not call pull', async () => {
      const { pull } = await setup()
      expect(pull).not.toBeCalled()
    })

    it('does not call checkout', async () => {
      const { checkout } = await setup()
      expect(checkout).not.toBeCalled()
    })

    it('history matches snapshot', async () => {
      const { history } = await setup()
      expect(history).toMatchSnapshot()
    })
  })

  describe('when directory already exists', () => {
    const setup = () => setupBase(() => true)

    it('does not call clone', async () => {
      const { clone } = await setup()
      expect(clone).not.toBeCalled()
    })

    it('calls pull once', async () => {
      const { pull } = await setup()
      expect(pull).toBeCalledTimes(1)
    })

    it('calls pull with dir, ref, and fastForwardOnly', async () => {
      const { pull } = await setup()
      expect(pull).toBeCalledWith({
        dir: path.join('prefix', 'github', 'org', 'repo'),
        ref: 'master',
        fastForwardOnly: true
      })
    })

    it('calls checkout once', async () => {
      const { checkout } = await setup()
      expect(checkout).toBeCalledTimes(1)
    })

    it('calls checkout with dir and ref', async () => {
      const { checkout } = await setup()
      expect(checkout).toBeCalledWith({
        dir: path.join('prefix', 'github', 'org', 'repo'),
        ref: 'master'
      })
    })

    it('history matches snapshot', async () => {
      const { history } = await setup()
      expect(history).toMatchSnapshot()
    })
  })
})

describe('pullOrCloneByUrl', () => {
  async function setupBase (pathExists: FileSystem.PathExists) {
    const { history, ...fns } = mockedFunctions()
    const options: PullCloneOptionsByUrl = {
      ...fns,
      url: 'https://github.com/org/repo.git',
      prefix: 'prefix',
      ref: 'master',
      fs: { pathExists }
    }
    await pullOrCloneByUrl(options)
    return { history, options, ...fns }
  }

  describe('when directory has yet to exist', () => {
    const setup = () => setupBase(() => false)

    it('calls clone once', async () => {
      const { clone } = await setup()
      expect(clone).toBeCalledTimes(1)
    })

    it('calls clone with url and dir', async () => {
      const { clone } = await setup()
      expect(clone).toBeCalledWith({
        url: 'https://github.com/org/repo.git',
        dir: path.join('prefix', 'github', 'org', 'repo')
      })
    })

    it('does not call pull', async () => {
      const { pull } = await setup()
      expect(pull).not.toBeCalled()
    })

    it('does not call checkout', async () => {
      const { checkout } = await setup()
      expect(checkout).not.toBeCalled()
    })

    it('history matches snapshot', async () => {
      const { history } = await setup()
      expect(history).toMatchSnapshot()
    })
  })

  describe('when directory already exists', () => {
    const setup = () => setupBase(() => true)

    it('does not call clone', async () => {
      const { clone } = await setup()
      expect(clone).not.toBeCalled()
    })

    it('calls pull once', async () => {
      const { pull } = await setup()
      expect(pull).toBeCalledTimes(1)
    })

    it('calls pull with dir, ref, and fastForwardOnly', async () => {
      const { pull } = await setup()
      expect(pull).toBeCalledWith({
        dir: path.join('prefix', 'github', 'org', 'repo'),
        ref: 'master',
        fastForwardOnly: true
      })
    })

    it('calls checkout once', async () => {
      const { checkout } = await setup()
      expect(checkout).toBeCalledTimes(1)
    })

    it('calls checkout with dir and ref', async () => {
      const { checkout } = await setup()
      expect(checkout).toBeCalledWith({
        dir: path.join('prefix', 'github', 'org', 'repo'),
        ref: 'master'
      })
    })

    it('history matches snapshot', async () => {
      const { history } = await setup()
      expect(history).toMatchSnapshot()
    })
  })
})
