export const PACKAGE_JSON = require('../package.json')

export const PACKAGE_NAME = PACKAGE_JSON.name
export const PACKAGE_VERSION = PACKAGE_JSON.version

export const SEARCH_PLACES = [
  'choose-text-editor',
  'choose-text-editor.json',
  'choose-text-editor.yaml',
  'choose-text-editor.config.js',
  'choose-text-editor.js',
  'package.json',
  'package.yaml'
]

export const PACKAGE_PROP = 'choose-text-editor'

export const EXEC_OPTIONS = { stdio: 'inherit' } as const
