import { ensureFile, writeFile } from 'fs-extra'
import { prompt } from 'inquirer'
import { Argv } from './_utils'

export async function main (argv: Argv) {
  const { storage } = argv
  await ensureFile(storage)
  return 0
}
