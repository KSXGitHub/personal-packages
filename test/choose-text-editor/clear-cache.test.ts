import { CacheType, CosmiConfigExplorer, clearCache } from '@khai96x/choose-text-editor'

function NEVER_CALL(): never {
  throw new Error('This function is not to be called')
}

class Explorer implements CosmiConfigExplorer {
  public readonly clearSearchCache = jest.fn()
  public readonly clearLoadCache = jest.fn()
  public readonly clearCaches = jest.fn()
  public readonly search = NEVER_CALL
}

function setup(type: CacheType) {
  const explorer = new Explorer()
  clearCache(explorer, type)
  return { type, explorer }
}

describe('when cache type is "search"', () => {
  const cacheType = CacheType.Search

  it('calls explorer.clearSearchCache exactly once', () => {
    expect(setup(cacheType).explorer.clearSearchCache).toBeCalledTimes(1)
  })

  it('calls explorer.clearSearchCache with no arguments', () => {
    expect(setup(cacheType).explorer.clearSearchCache).toBeCalledWith()
  })

  it('does not call explorer.clearLoadCache', () => {
    expect(setup(cacheType).explorer.clearLoadCache).not.toBeCalled()
  })

  it('does not call explorer.clearCaches', () => {
    expect(setup(cacheType).explorer.clearCaches).not.toBeCalled()
  })
})

describe('when cache type is "load"', () => {
  const cacheType = CacheType.Load

  it('does not call explorer.clearSearchCache', () => {
    expect(setup(cacheType).explorer.clearSearchCache).not.toBeCalled()
  })

  it('calls explorer.clearLoadCache exactly once', () => {
    expect(setup(cacheType).explorer.clearLoadCache).toBeCalledTimes(1)
  })

  it('calls explorer.clearLoadCache with no arguments', () => {
    expect(setup(cacheType).explorer.clearLoadCache).toBeCalledWith()
  })

  it('does not call explorer.clearCaches', () => {
    expect(setup(cacheType).explorer.clearCaches).not.toBeCalled()
  })
})

describe('when cache type is "all"', () => {
  const cacheType = CacheType.All

  it('does not call explorer.clearSearchCache', () => {
    expect(setup(cacheType).explorer.clearSearchCache).not.toBeCalled()
  })

  it('does not call explorer.clearLoadCache', () => {
    expect(setup(cacheType).explorer.clearLoadCache).not.toBeCalled()
  })

  it('calls explorer.clearCaches exactly once', () => {
    expect(setup(cacheType).explorer.clearCaches).toBeCalledTimes(1)
  })

  it('calls explorer.clearCaches exactly with no arguments', () => {
    expect(setup(cacheType).explorer.clearCaches).toBeCalledWith()
  })
})
