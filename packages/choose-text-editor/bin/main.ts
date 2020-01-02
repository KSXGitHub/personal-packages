import { execSync } from 'child_process'
import process from 'process'
import which from 'which'
import { cosmiconfig } from 'cosmiconfig'
import { MainParam, Status, main, choose, PACKAGE_NAME } from '..'
import args from './args'

const param: MainParam<never> = {
  process,
  which,
  execSync,
  packageName: PACKAGE_NAME,
  cosmiconfig,
  choose,
  args: args._,
  ...args
}

main(param).catch(error => {
  console.error('[ERROR] An error occurred')
  console.error(error)
  return process.exit(Status.UnknownFailure)
})
