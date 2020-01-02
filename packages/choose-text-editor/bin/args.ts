import yargs from 'yargs'
import { SEARCH_PLACES, PACKAGE_PROP, CacheType, CommandHandlingMethod } from '..'

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
    choices: [
      CacheType.Search,
      CacheType.Load,
      CacheType.All
    ],
    required: false
  })
  .option('showStatus', {
    describe: 'Display exit status codes and names, then exit',
    type: 'boolean'
  })
  .option('onChosen', {
    alias: 'x',
    describe: 'Whether to print or to execute chosen command',
    choices: [
      CommandHandlingMethod.PrintSingleLine,
      CommandHandlingMethod.PrintMultiLine,
      CommandHandlingMethod.PrintJson,
      CommandHandlingMethod.Execute
    ],
    default: CommandHandlingMethod.PrintSingleLine
  })
  .env('CHOOSE_TEXT_EDITOR')
  .help()
  .argv

export default args
