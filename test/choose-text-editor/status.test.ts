import { Status } from '@khai96x/choose-text-editor'

it('Status.Success = 0', () => {
  expect(Status.Success).toBe(0)
})

it('Status.UnexpectedException = 1', () => {
  expect(Status.UnexpectedException).toBe(1)
})
