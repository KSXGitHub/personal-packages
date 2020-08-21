'use strict'
const cmd = require('@tools/test-spawn')
const bin = require.resolve('@ts-schema-autogen/cli/ts-schema-autogen')

it('Schema Test', () => {
  cmd({
    defaultExecutable: 'node',
    argvPrefix: [bin, 'test'],
    envMiddleName: 'SCHEMA_TEST',
  })
})
