import { showStatus } from '@khai96x/choose-text-editor'

it('calls logger function', () => {
  const logger = jest.fn()
  showStatus(logger)
  expect(logger.mock.calls).toMatchSnapshot()
})

it('prints message', () => {
  let message = ''
  showStatus((...chunks: any[]) => {
    message += chunks.join(' ') + '\n'
  })
  expect('\n' + message).toMatchSnapshot()
})
