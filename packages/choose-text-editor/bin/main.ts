import process from 'process'
import which from 'which'
import { cosmiconfig } from 'cosmiconfig'
import { MainParam, Status, main, choose } from '../lib'
import args from './args'

const param: MainParam<never> = {
  process,
  which,
  cosmiconfig,
  choose,
  ...args
}

main(param).catch(error => {
  console.error('[ERROR] An error occurred')
  console.error(error)
  return process.exit(Status.UnknownFailure)
})
