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
}

export interface CosmiConfigSearchResult {
  readonly config: unknown
  readonly filepath: string
  readonly isEmpty: boolean
}
