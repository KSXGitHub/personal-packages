import MockedLogger from './lib/mocked-logger'

import {
  IndeterminableTTY,
  NotFound,
  PrefixesParsingFailure,
  InvalidPrefixes,
  NoEditor,
  ChooseError,
  Status,
  handleChooseError
} from '@khai96x/choose-text-editor'

async function setup (error: ChooseError) {
  const { log, getLogs, getText } = new MockedLogger()
  const status = await handleChooseError(log, error)
  return { error, log, getLogs, getText, status }
}

describe('IndeterminableTTY', () => {
  const error = IndeterminableTTY()

  it('calls logError', async () => {
    const { getLogs } = await setup(error)
    expect(getLogs()).toMatchSnapshot()
  })

  it('prints error messages', async () => {
    const { getText } = await setup(error)
    expect(getText()).toMatchSnapshot()
  })

  it('returns status code of IndeterminableTTY', async () => {
    const { status } = await setup(error)
    expect(Status[status]).toBe(Status[Status.IndeterminableTTY])
  })
})

describe('NotFound', () => {
  const error = NotFound()

  it('calls logError', async () => {
    const { getLogs } = await setup(error)
    expect(getLogs()).toMatchSnapshot()
  })

  it('prints error messages', async () => {
    const { getText } = await setup(error)
    expect(getText()).toMatchSnapshot()
  })

  it('returns status code of NotFound', async () => {
    const { status } = await setup(error)
    expect(Status[status]).toBe(Status[Status.NotFound])
  })
})

describe('NoEditor', () => {
  const error = NoEditor()

  it('calls logError', async () => {
    const { getLogs } = await setup(error)
    expect(getLogs()).toMatchSnapshot()
  })

  it('prints error messages', async () => {
    const { getText } = await setup(error)
    expect(getText()).toMatchSnapshot()
  })

  it('returns status code of EmptyEditorSet', async () => {
    const { status } = await setup(error)
    expect(Status[status]).toBe(Status[Status.EmptyEditorSet])
  })
})

describe('PrefixesParsingFailure', () => {
  const error = PrefixesParsingFailure(
    new Error('{error message}'),
    '{invalid prefixes}',
    'FORCE_EDITOR_PREFIXES'
  )

  it('calls logError', async () => {
    const { getLogs } = await setup(error)
    expect(getLogs()).toMatchSnapshot()
  })

  it('prints error messages', async () => {
    const { getText } = await setup(error)
    expect(getText()).toMatchSnapshot()
  })

  it('returns status code of InvalidPrefix', async () => {
    const { status } = await setup(error)
    expect(Status[status]).toBe(Status[Status.InvalidPrefix])
  })
})

describe('InvalidPrefixes', () => {
  async function makeError () {
    const { schemas } = await import('@khai96x/choose-text-editor')
    const invalidCliArguments = ['abc', 123, true, { object: 'illegal' }, ['illegal', 'array']]
    const validatorResult = schemas.CliArguments().validate(invalidCliArguments, {
      allowUnknownAttributes: true
    })
    return InvalidPrefixes(
      validatorResult,
      invalidCliArguments,
      'FORCE_EDITOR_PREFIXES'
    )
  }

  it('calls logError', async () => {
    const { getLogs } = await setup(await makeError())
    expect(getLogs()).toMatchSnapshot()
  })

  it('prints error messages', async () => {
    const { getText } = await setup(await makeError())
    expect(getText()).toMatchSnapshot()
  })

  it('returns status code of InvalidPrefix', async () => {
    const { status } = await setup(await makeError())
    expect(Status[status]).toBe(Status[Status.InvalidPrefix])
  })
})
