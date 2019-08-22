import path from 'path'

import {
  Host,
  GitUrlInfo,
  createByInfo,
  createByUrl,
  createGitUrl
} from '@khai96x/repo-manager'

const info: GitUrlInfo = {
  host: Host.GitHub,
  owner: 'org',
  name: 'repo'
}

function mockedFunctions () {
  const history = Array<any>()
  const mkfn = (func: string) => jest.fn((arg: any) => void history.push({ func, arg }))
  const init = mkfn('init')
  const addRemote = mkfn('addRemote')
  const apiCreate = mkfn('apiCreate')
  const ensureDir = mkfn('ensureDir')
  const fs = { ensureDir }
  return { history, init, addRemote, apiCreate, fs }
}

describe('createByInfo', () => {
  async function setup () {
    const { history, ...fns } = mockedFunctions()
    await createByInfo({
      ...fns,
      info,
      prefix: 'prefix'
    })
    return { history, ...fns }
  }

  describe('calls apiCreate', () => {
    it('once', async () => {
      const { apiCreate } = await setup()
      expect(apiCreate).toBeCalledTimes(1)
    })

    it('with info and url', async () => {
      const { apiCreate } = await setup()
      expect(apiCreate).toBeCalledWith({
        info,
        url: createGitUrl(info)
      })
    })
  })

  describe('calls fs.ensureDir', () => {
    it('once', async () => {
      const { fs } = await setup()
      expect(fs.ensureDir).toBeCalledTimes(1)
    })

    it('with dir', async () => {
      const { fs } = await setup()
      expect(fs.ensureDir).toBeCalledWith(
        path.join('prefix', 'github', 'org', 'repo')
      )
    })
  })

  describe('calls init', () => {
    it('once', async () => {
      const { init } = await setup()
      expect(init).toBeCalledTimes(1)
    })

    it('with dir', async () => {
      const { init } = await setup()
      expect(init).toBeCalledWith({
        dir: path.join('prefix', 'github', 'org', 'repo')
      })
    })
  })

  describe('calls addRemote', () => {
    it('once', async () => {
      const { addRemote } = await setup()
      expect(addRemote).toBeCalledTimes(1)
    })

    it('with dir, url, and remote', async () => {
      const { addRemote } = await setup()
      expect(addRemote).toBeCalledWith({
        dir: path.join('prefix', 'github', 'org', 'repo'),
        url: createGitUrl(info),
        remote: 'origin'
      })
    })
  })

  it('history matches snapshot', async () => {
    const { history } = await setup()
    expect(history).toMatchSnapshot()
  })
})

describe('createByUrl', () => {
  async function setup () {
    const { history, ...fns } = mockedFunctions()
    await createByUrl({
      ...fns,
      url: 'https://github.com/org/repo.git',
      prefix: 'prefix'
    })
    return { history, ...fns }
  }

  describe('calls apiCreate', () => {
    it('once', async () => {
      const { apiCreate } = await setup()
      expect(apiCreate).toBeCalledTimes(1)
    })

    it('with info and url', async () => {
      const { apiCreate } = await setup()
      expect(apiCreate).toBeCalledWith({
        info,
        url: 'https://github.com/org/repo.git'
      })
    })
  })

  describe('calls fs.ensureDir', () => {
    it('once', async () => {
      const { fs } = await setup()
      expect(fs.ensureDir).toBeCalledTimes(1)
    })

    it('with dir', async () => {
      const { fs } = await setup()
      expect(fs.ensureDir).toBeCalledWith(
        path.join('prefix', 'github', 'org', 'repo')
      )
    })
  })

  describe('calls init', () => {
    it('once', async () => {
      const { init } = await setup()
      expect(init).toBeCalledTimes(1)
    })

    it('with dir', async () => {
      const { init } = await setup()
      expect(init).toBeCalledWith({
        dir: path.join('prefix', 'github', 'org', 'repo')
      })
    })
  })

  describe('calls addRemote', () => {
    it('once', async () => {
      const { addRemote } = await setup()
      expect(addRemote).toBeCalledTimes(1)
    })

    it('with dir, url, and remote', async () => {
      const { addRemote } = await setup()
      expect(addRemote).toBeCalledWith({
        dir: path.join('prefix', 'github', 'org', 'repo'),
        url: 'https://github.com/org/repo.git',
        remote: 'origin'
      })
    })
  })

  it('history matches snapshot', async () => {
    const { history } = await setup()
    expect(history).toMatchSnapshot()
  })
})
