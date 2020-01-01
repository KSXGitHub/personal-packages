import yargs from 'yargs'
import { SEARCH_PLACES, PACKAGE_PROP, CacheType } from '..'

export const args = yargs
  .option('searchPlaces', {
    describe: 'Places to search for config file',
    type: 'array',
    default: SEARCH_PLACES,
    coerce: array => Array.from(array).map(x => String(x))
  })
  .option('packageProp', {
    describe: 'Property key to lookup should config file is package.json',
    type: 'string',
    default: PACKAGE_PROP
  })
  .option('cache', {
    describe: 'Should config content be cached',
    type: 'boolean',
    default: true
  })
  .option('stopDir', {
    describe: 'Where to stop finding config file (default to your homedir)',
    type: 'string',
    required: false
  })
  .option('clearCache', {
    describe: 'Clear cache and exit',
    choices: Object.values(CacheType),
    required: false
  })
  .option('showStatus', {
    describe: 'Display exit status codes and names, then exit',
    type: 'boolean'
  })
  .option('open', {
    alias: ['exec', 'x'],
    describe: 'Execute command when found',
    type: 'boolean'
  })
  .env('CHOOSE_TEXT_EDITOR')
  .help()
  .argv

export default args
