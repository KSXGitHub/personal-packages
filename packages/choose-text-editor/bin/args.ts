import yargs from 'yargs'
import { SEARCH_PLACES, PACKAGE_PROP, CacheType, CommandHandlingMethod } from '..'

export const args = yargs
  .usage('$0 [options] ...arguments')
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
  .example(
    'choose-text-editor',
    'Choose a text editor and print its command'
  )
  .example(
    'choose-text-editor --searchPlaces editors.yaml',
    'Only choose text editors that appear in editors.yaml'
  )
  .example(
    'choose-text-editor --stopDir .',
    'Only find config files in current directory'
  )
  .example(
    'choose-text-editor -x exec -- my-file.js',
    'Choose a text editor to open my-file.js'
  )
  .example(
    'choose-text-editor -x print:json',
    'Print chosen text editor and its argument as JSON'
  )
  .example(
    'choose-text-editor --clearCache all',
    'Clear all caches of config files'
  )
  .example(
    'choose-text-editor --showStatus',
    'Print a table of exit status codes'
  )
  .help()
  .argv

export default args
