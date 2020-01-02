import path from 'path'
import { readFile } from 'fs-extra'

const programListFile = path.resolve(__dirname, '../data/programs.txt')

// TODO: Convert this to use top-level await once it is available for TypeScript
export const programListPromise = readFile(programListFile, 'utf8').then(
  text => text.split('\n').map(x => x.trim()).filter(Boolean)
)

export default programListPromise
