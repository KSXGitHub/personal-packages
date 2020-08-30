import process from 'process'
import yargs from 'yargs'
import main from '..'

const {
  _: [candidateDirectory, ...rest],
  fuzzyFinder,
  directoriesOnly,
} = yargs
  .option('fuzzyFinder', {
    alias: ['P', 'fzf'],
    type: 'string',
    describe: 'Fuzzy finder command to spawn',
    default: 'sk',
  })
  .option('directoriesOnly', {
    alias: ['D'],
    type: 'boolean',
    describe: 'List directories only',
    default: false,
  })
  .env('BROWSE_FS_TREE')
  .help()
  .argv

if (rest.length) {
  console.error('[ERROR] Too many arguments.')
  throw process.exit(2)
}

const directory = candidateDirectory || '.'

main({
  fuzzyFinder,
  directory,
  directoriesOnly,
}).then(process.exit).catch(error => {
  console.error(error)
  throw process.exit(1)
})
