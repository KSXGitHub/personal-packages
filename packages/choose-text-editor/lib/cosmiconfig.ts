import cosmiconfig from 'cosmiconfig'

export interface CosmiConfig {
  (moduleName: string, options: CosmiConfigOptions): CosmiConfigResult
}

export interface CosmiConfigOptions extends cosmiconfig.Options {
  searchPlaces: string[]
  packageProp: string
}

export interface CosmiConfigResult {
  readonly search: () => Promise<CosmiConfigSearchResult | null>
  readonly clearLoadCache: () => void
  readonly clearSearchCache: () => void
  readonly clearCaches: () => void
}

export interface CosmiConfigSearchResult {
  readonly config: unknown
  readonly filepath: string
  readonly isEmpty?: boolean
}
