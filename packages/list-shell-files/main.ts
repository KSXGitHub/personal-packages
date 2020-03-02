import console from 'console'
import process from 'process'
import yargs from 'yargs'
import { MainOptions, main } from './index'

const { argv } = yargs
  .usage('$0 [options] ...<filenames>')
  .option('shells', {
    describe: 'Shell types',
    type: 'array',
    default: ['sh', 'bash']
  })
  .env('FIND_ALL_SHELL_FILES')
  .help()

const options: MainOptions = {
  files: argv._,
  shells: argv.shells,
  log: console.info
}

main(options)
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    return process.exit(1)
  })
