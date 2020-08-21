import { schemas, logSchemaErrors } from '@khai96x/choose-text-editor'

const validatorResult = schemas.EditorSet().validate({
  graphical: [
    {
      program: 'valid graphical program',
      flags: ['valid flag'],
      options: { validOption: 'value' },
    },
    {
      program: 'valid graphical program',
      flags: 'invalid flag',
      options: { invalidOption: ['value'] },
    },
    {
      program: undefined,
      flags: ['valid part', 123],
      options: { validOption: 'value' },
    },
    'invalid graphical program',
  ],
  terminal: [
    {
      program: 'valid program',
      flags: ['valid flag'],
      options: { validOption: 'value' },
    },
    {
      program: 'valid program',
      flags: 'invalid flag',
      options: { invalidOption: ['value'] },
    },
    ['invalid', 'terminal', 'program'],
    undefined,
    null,
  ],
})

it('calls logError multiple times', () => {
  const logError = jest.fn()
  logSchemaErrors(validatorResult, logError)
  expect(logError.mock.calls).toMatchSnapshot()
})

it('print a text', () => {
  let message = '\n'
  function logError(...chunks: any[]) {
    message += chunks.join(' ') + '\n'
  }
  logSchemaErrors(validatorResult, logError)
  expect(message).toMatchSnapshot()
})
