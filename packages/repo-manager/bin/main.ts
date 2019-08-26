import path from 'path'
import os from 'os'
import yargs from 'yargs'

interface PromiseResolve<Value> {
  (value: Value | Promise<Value>): void
}

interface CommandModule<Argv, Rest extends any[]> {
  main (argv: Argv, ...rest: Rest): number | Promise<number>
}

const handler = <Argv, Rest extends any[]> (
  resolve: PromiseResolve<number>,
  promise: Promise<CommandModule<Argv, Rest>>,
  ...rest: Rest
) => async (argv: Argv) => {
  const { main } = await promise
  const status = await main(argv, ...rest)
  resolve(status)
}

export async function main () {
  const DEFAULT_STORAGE = path.join(os.homedir(), '.repo-manager/storage.json')

  const status = await new Promise<number>(resolve => yargs
    .command(
      'auth',
      'Manage authentication tokens',
      yargs => yargs
        .option('storage', {
          type: 'string',
          describe: 'File to store credential information',
          default: DEFAULT_STORAGE
        })
        .command(
          'add',
          'Add authentication token',
          yargs => yargs,
          handler(resolve, import('./auth/add'))
        )
        .demandCommand()
        .help()
    )
    .demandCommand()
    .env('REPO_MANAGER')
    .help()
    .argv
  )

  return status
}

export default main
