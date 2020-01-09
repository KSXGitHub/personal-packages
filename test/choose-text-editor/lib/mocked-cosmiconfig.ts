import {
  CosmiConfigExplorer,
  CosmiConfigResult
} from '@khai96x/choose-text-editor'

export class MockedCosmiConfigExplorer implements CosmiConfigExplorer {
  constructor (public readonly result: CosmiConfigResult | null) {}
  public readonly search = jest.fn(async () => this.result)
  public readonly clearSearchCache = jest.fn()
  public readonly clearLoadCache = jest.fn()
  public readonly clearCaches = jest.fn()
}

export class MockedCosmiConfig {
  constructor (public readonly result: CosmiConfigResult | null) {}
  public readonly explorer = new MockedCosmiConfigExplorer(this.result)
  public readonly cosmiconfig = jest.fn(() => this.explorer)
}

export default MockedCosmiConfig
