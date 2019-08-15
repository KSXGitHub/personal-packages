import path from 'path'
import { ok, err, unwrap } from '@tsfun/result'
import {
  parseGitUrl,
  createGitUrl,
  getLocationByInfo,
  getLocationByUrl,
  GitUrlInfo,
  Host
} from '@khai96x/repo-manager'

describe('parseGitURL', () => {
  describe('valid links', () => {
    describe('https://github.com/org/repo.git', () => {
      const get = () => parseGitUrl('https://github.com/org/repo.git')

      it('returns expected result', () => {
        expect(get()).toEqual(ok<GitUrlInfo>({
          host: Host.GitHub,
          owner: 'org',
          name: 'repo'
        }))
      })

      it('matches snapshot', () => {
        expect(get()).toMatchSnapshot()
      })
    })

    describe('https://github.com/org/repo', () => {
      const get = () => parseGitUrl('https://github.com/org/repo')

      it('returns expected result', () => {
        expect(get()).toEqual(ok<GitUrlInfo>({
          host: Host.GitHub,
          owner: 'org',
          name: 'repo'
        }))
      })

      it('matches snapshot', () => {
        expect(get()).toMatchSnapshot()
      })
    })

    describe('https://gitlab.com/org/repo.git', () => {
      const get = () => parseGitUrl('https://gitlab.com/org/repo.git')

      it('returns expected result', () => {
        expect(get()).toEqual(ok<GitUrlInfo>({
          host: Host.GitLab,
          owner: 'org',
          name: 'repo'
        }))
      })

      it('matches snapshot', () => {
        expect(get()).toMatchSnapshot()
      })
    })

    describe('https://gitlab.com/org/repo', () => {
      const get = () => parseGitUrl('https://gitlab.com/org/repo')

      it('returns expected result', () => {
        expect(get()).toEqual(ok<GitUrlInfo>({
          host: Host.GitLab,
          owner: 'org',
          name: 'repo'
        }))
      })

      it('matches snapshot', () => {
        expect(get()).toMatchSnapshot()
      })
    })

    it('supports http', () => {
      expect(
        parseGitUrl('http://github.com/org/repo.git')
      ).toEqual(
        ok(expect.anything())
      )
    })
  })

  describe('invalid links', () => {
    describe('unknown protocol', () => {
      const get = () => parseGitUrl('unknown://github.com/org/repo.git')

      it('returns an err', () => {
        expect(get()).toEqual(err(expect.any(Error)))
      })

      it('contains expected properties', () => {
        expect(get()).toEqual(err(expect.objectContaining({
          protocol: 'unknown:'
        })))
      })

      it('matches snapshot', () => {
        expect(get()).toMatchSnapshot()
      })
    })

    describe('unknown host', () => {
      const get = () => parseGitUrl('https://unknown.com/org/repo.git')

      it('returns an err', () => {
        expect(get()).toEqual(err(expect.any(Error)))
      })

      it('contains expected properties', () => {
        expect(get()).toEqual(err(expect.objectContaining({
          hostname: 'unknown.com'
        })))
      })

      it('matches snapshot', () => {
        expect(get()).toMatchSnapshot()
      })
    })

    describe('insufficient path', () => {
      describe('missing org', () => {
        const get = () => parseGitUrl('https://github.com')

        it('returns an err', () => {
          expect(get()).toEqual(err(expect.any(Error)))
        })

        it('contains expected properties', () => {
          expect(get()).toEqual(err(expect.objectContaining({
            pathname: '/'
          })))
        })

        it('matches snapshot', () => {
          expect(get()).toMatchSnapshot()
        })
      })

      describe('missing name', () => {
        const get = () => parseGitUrl('https://github.com/org')

        it('returns an err', () => {
          expect(get()).toEqual(err(expect.any(Error)))
        })

        it('contains expected properties', () => {
          expect(get()).toEqual(err(expect.objectContaining({
            pathname: '/org'
          })))
        })

        it('matches snapshot', () => {
          expect(get()).toMatchSnapshot()
        })
      })
    })

    describe('excessive path', () => {
      const get = () => parseGitUrl('https://github.com/org/repo/tree/master/README.md')

      it('returns an err', () => {
        expect(get()).toEqual(err(expect.any(Error)))
      })

      it('contains expected properties', () => {
        expect(get()).toEqual(err(expect.objectContaining({
          pathname: '/org/repo/tree/master/README.md',
          excess: ['tree', 'master', 'README.md']
        })))
      })

      it('matches snapshot', () => {
        expect(get()).toMatchSnapshot()
      })
    })
  })
})

describe('createGitUrl', () => {
  it('host = GitHub', () => {
    expect(createGitUrl({
      host: Host.GitHub,
      owner: 'org',
      name: 'repo'
    })).toBe('https://github.com/org/repo.git')
  })

  it('host = GitLab', () => {
    expect(createGitUrl({
      host: Host.GitLab,
      owner: 'org',
      name: 'repo'
    })).toBe('https://gitlab.com/org/repo.git')
  })
})

describe('encode - decode', () => {
  describe('invalid characters', () => {
    const info: GitUrlInfo = {
      host: Host.GitHub,
      owner: 'abc/def ghi',
      name: 'foo bar/baz'
    }

    const url = 'https://github.com/abc%2Fdef%20ghi/foo%20bar%2Fbaz.git'

    it('info → createGitUrl', () => {
      expect(createGitUrl(info)).toBe(url)
    })

    it('info → createGitUrl → parseGitUrl', () => {
      expect(unwrap(parseGitUrl(createGitUrl(info)))).toEqual(info)
    })

    it('url → parseGitUrl', () => {
      expect(unwrap(parseGitUrl(url))).toEqual(info)
    })

    it('url → parseGitUrl → createGitUrl', () => {
      expect(createGitUrl(unwrap(parseGitUrl(url)))).toBe(url)
    })
  })

  describe('valid characters', () => {
    const info: GitUrlInfo = {
      host: Host.GitHub,
      owner: 'org',
      name: 'repo'
    }

    const url = 'https://github.com/org/repo.git'

    it('info → createGitUrl', () => {
      expect(createGitUrl(info)).toBe(url)
    })

    it('info → createGitUrl → parseGitUrl', () => {
      expect(unwrap(parseGitUrl(createGitUrl(info)))).toEqual(info)
    })

    it('url → parseGitUrl', () => {
      expect(unwrap(parseGitUrl(url))).toEqual(info)
    })

    it('url → parseGitUrl → createGitUrl', () => {
      expect(createGitUrl(unwrap(parseGitUrl(url)))).toBe(url)
    })
  })
})

describe('getLocationByInfo', () => {
  const get = (prefix?: string) => getLocationByInfo({
    host: Host.GitHub,
    owner: 'org',
    name: 'repo'
  }, prefix)

  it('without prefix', () => {
    expect(get()).toBe(path.join(Host.GitHub, 'org', 'repo'))
  })

  it('with prefix', () => {
    expect(get('prefix')).toBe(path.join('prefix', Host.GitHub, 'org', 'repo'))
  })
})

describe('getLocationByUrl', () => {
  const get = (prefix?: string) => getLocationByUrl(
    'https://github.com/org/repo.git',
    prefix
  )

  it('without prefix', () => {
    expect(get()).toEqual(ok(path.join(Host.GitHub, 'org', 'repo')))
  })

  it('with prefix', () => {
    expect(get('prefix')).toEqual(ok(path.join('prefix', Host.GitHub, 'org', 'repo')))
  })

  it('invalid url', () => {
    expect(getLocationByUrl('invalid://invalid')).toEqual(err(expect.any(Error)))
  })
})