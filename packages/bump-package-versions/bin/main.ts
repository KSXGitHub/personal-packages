import process from 'process'
import fs from 'fs-extra'
import yargs from 'yargs'
import { ChangeType, bumpPackageVersions } from '../index'

const {
  _: filenames,
  ...rest
} = yargs
  .usage('bump-package-versions')
  .option('changeType', {
    describe: 'Type of change',
    choices: [
      ChangeType.OfficialRelease,
      ChangeType.BreakingChange,
      ChangeType.FeatureAddition,
      ChangeType.Patch
    ] as const,
    required: true
  })
  .option('skipPrivate', {
    describe: 'Skip files that have "private" property set to true',
    type: 'boolean',
    default: true
  })
  .option('jsonIndent', {
    describe: 'Indentation of resulting JSON',
    type: 'number',
    default: 2
  })
  .option('finalNewLines', {
    describe: 'How many empty lines to add after resulting JSON',
    type: 'number',
    default: 1
  })
  .env('BUMP_PKG_VERS')
  .help()
  .argv

bumpPackageVersions({
  ...rest,
  filenames,
  fs,
  console,
  process
}).catch(error => {
  console.error(error)
  return process.exit(-1)
})
