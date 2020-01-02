import { STR2BOOL } from '@khai96x/choose-text-editor'

it('true', () => {
  expect(STR2BOOL['true']).toBe(true)
})

it('false', () => {
  expect(STR2BOOL['false']).toBe(false)
})

it('other', () => {
  expect(STR2BOOL['other']).toBe(undefined)
})
