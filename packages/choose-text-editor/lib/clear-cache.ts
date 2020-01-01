import { CosmiConfigExplorer } from './cosmiconfig'

export enum CacheType {
  Load = 'load',
  Search = 'search',
  All = 'all'
}

export function clearCache (explorer: CosmiConfigExplorer, cacheType: CacheType) {
  switch (cacheType) {
    case CacheType.Load:
      return explorer.clearLoadCache()
    case CacheType.Search:
      return explorer.clearSearchCache()
    case CacheType.All:
      return explorer.clearCaches()
  }
}
