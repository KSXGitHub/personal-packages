import cosmiconfig from 'cosmiconfig'

export interface CosmiConfig {
  (moduleName: string, options: CosmiConfigOptions): CosmiConfigExplorer
}

export interface CosmiConfigOptions extends cosmiconfig.Options {
  searchPlaces: string[]
  packageProp: string
}

export interface CosmiConfigExplorer {
  readonly search: () => Promise<CosmiConfigResult | null>
  readonly clearLoadCache: () => void
  readonly clearSearchCache: () => void
  readonly clearCaches: () => void
}

export interface CosmiConfigResult {
  readonly config: unknown
  readonly filepath: string
  readonly isEmpty?: boolean
}
