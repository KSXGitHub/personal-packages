import { handleChooserValidation } from '@khai96x/choose-text-editor'
import MockedLogger from './lib/mocked-logger'

function setup(chooser: string) {
  const { log, getLogs, getText } = new MockedLogger()
  const result = handleChooserValidation(
    log,
    chooser,
    '@khai96x/choose-text-editor', // not necessary actual package name
    '3.2.1', // not necessary actual package version
    '/path/to/config/file',
  )
  return { chooser, log, getLogs, getText, result }
}

describe('when chooser is valid', () => {
  const chooser = '@khai96x/choose-text-editor@^3.2.1'

  it('does not call logError', () => {
    expect(setup(chooser).log).not.toBeCalled()
  })

  it('does not print anything', () => {
    expect(setup(chooser).getText().trim()).toBe('')
  })

  it('returns true', () => {
    expect(setup(chooser).result).toBe(true)
  })
})

describe('when chooser has invalid package name', () => {
  const chooser = 'invalid-package-name@^3.2.1'

  it('calls logError', () => {
    expect(setup(chooser).getLogs()).toMatchSnapshot()
  })

  it('prints error messages', () => {
    expect(setup(chooser).getText()).toMatchSnapshot()
  })

  it('returns false', () => {
    expect(setup(chooser).result).toBe(false)
  })
})

describe('when chooser has invalid version range', () => {
  const chooser = '@khai96x/choose-text-editor@invalid-version-range'

  it('calls logError', () => {
    expect(setup(chooser).getLogs()).toMatchSnapshot()
  })

  it('prints error messages', () => {
    expect(setup(chooser).getText()).toMatchSnapshot()
  })

  it('returns false', () => {
    expect(setup(chooser).result).toBe(false)
  })
})

describe('when chooser has a path', () => {
  const chooser = '@khai96x/choose-text-editor/lib/index.js@^3.2.1'

  it('calls logError', () => {
    expect(setup(chooser).getLogs()).toMatchSnapshot()
  })

  it('prints error messages', () => {
    expect(setup(chooser).getText()).toMatchSnapshot()
  })

  it('returns false', () => {
    expect(setup(chooser).result).toBe(false)
  })
})

describe('when chooser version is not satisfied', () => {
  const chooser = '@khai96x/choose-text-editor@>3.2.1'

  it('calls logError', () => {
    expect(setup(chooser).getLogs()).toMatchSnapshot()
  })

  it('prints error messages', () => {
    expect(setup(chooser).getText()).toMatchSnapshot()
  })

  it('returns false', () => {
    expect(setup(chooser).result).toBe(false)
  })
})
