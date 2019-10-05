import { parse } from 'semver'
import { ChangeType, incSemVer } from '@khai96x/bump-package-versions'

const inc = (
  version: string,
  change: ChangeType
) => incSemVer(parse(version)!, change).raw

const tester = (
  oldVer: string,
  change: ChangeType,
  newVer: string
) => () => expect(inc(oldVer, change)).toBe(newVer)

describe('ChangeType.OfficialRelease', () => {
  const change = ChangeType.OfficialRelease
  it('0.0.0 → 1.0.0', tester('0.0.0', change, '1.0.0'))
  it('0.0.1 → 1.0.0', tester('0.0.1', change, '1.0.0'))
  it('0.1.2 → 1.0.0', tester('0.1.2', change, '1.0.0'))
  it('1.2.3 → 1.2.4', tester('1.2.3', change, '1.2.4'))
})

describe('ChangeType.BreakingChange', () => {
  const change = ChangeType.BreakingChange
  it('0.0.0 → 0.0.1', tester('0.0.0', change, '0.0.1'))
  it('0.0.1 → 0.0.2', tester('0.0.1', change, '0.0.2'))
  it('0.1.2 → 0.2.0', tester('0.1.2', change, '0.2.0'))
  it('1.2.3 → 2.0.0', tester('1.2.3', change, '2.0.0'))
})

describe('ChangeType.FeatureAddition', () => {
  const change = ChangeType.FeatureAddition
  it('0.0.0 → 0.0.1', tester('0.0.0', change, '0.0.1'))
  it('0.0.1 → 0.0.2', tester('0.0.1', change, '0.0.2'))
  it('0.1.2 → 0.1.3', tester('0.1.2', change, '0.1.3'))
  it('1.2.3 → 1.3.0', tester('1.2.3', change, '1.3.0'))
})

describe('ChangeType.Patch', () => {
  const change = ChangeType.Patch
  it('0.0.0 → 0.0.1', tester('0.0.0', change, '0.0.1'))
  it('0.0.1 → 0.0.2', tester('0.0.1', change, '0.0.2'))
  it('0.1.2 → 0.1.3', tester('0.1.2', change, '0.1.3'))
  it('1.2.3 → 1.2.4', tester('1.2.3', change, '1.2.4'))
})
