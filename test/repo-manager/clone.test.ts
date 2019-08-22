import path from 'path'

import {
  Host,
  GitUrlInfo,
  cloneByInfo,
  cloneByUrl,
  createGitUrl
} from '@khai96x/repo-manager'

describe('cloneByInfo', () => {
  async function setup () {
    const clone = jest.fn()
    const info: GitUrlInfo = { host: Host.GitHub, owner: 'org', name: 'repo' }
    await cloneByInfo(clone, info, 'prefix')
    return { clone, info }
  }

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
})

describe('cloneByUrl', () => {
  async function setup () {
    const clone = jest.fn()
    const url = 'https://github.com/org/repo'
    await cloneByUrl(clone, url, 'prefix')
    return { clone, url }
  }

  it('calls clone once', async () => {
    const { clone } = await setup()
    expect(clone).toBeCalledTimes(1)
  })

  it('calls clone with url and dir', async () => {
    const { clone, url } = await setup()
    expect(clone).toBeCalledWith({
      url,
      dir: path.join('prefix', 'github', 'org', 'repo')
    })
  })
})
