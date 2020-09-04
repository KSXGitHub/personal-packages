import path from 'path'
import { cwd } from 'process'
import { pathExists } from 'fs-extra'

export async function findRepoRoot() {
  let current = cwd()
  while (!await pathExists(path.resolve(current, '.git'))) {
    const parent = path.dirname(current)
    if (parent === current) throw new Error('Not a git repo')
    current = parent
  }
  return current
}

export default findRepoRoot
