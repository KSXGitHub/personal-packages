import { parse } from 'semver'
import { ChangeType, ReleaseType, getReleaseType } from '@khai96x/bump-package-versions'

const get = (
  version: string,
  change: ChangeType
) => getReleaseType(parse(version)!, change)

const tester = (
  version: string,
  change: ChangeType,
  release: ReleaseType
) => () => expect(get(version, change)).toBe(release)

describe('ChangeType.OfficialRelease', () => {
  const change = ChangeType.OfficialRelease
  it('0.0.0 → ReleaseType.Major', tester('0.0.0', change, ReleaseType.Major))
  it('0.0.1 → ReleaseType.Major', tester('0.0.1', change, ReleaseType.Major))
  it('0.1.2 → ReleaseType.Major', tester('0.1.2', change, ReleaseType.Major))
  it('1.2.3 → ReleaseType.Patch', tester('1.2.3', change, ReleaseType.Patch))
})

describe('ChangeType.BreakingChange', () => {
  const change = ChangeType.BreakingChange
  it('0.0.0 → ReleaseType.Patch', tester('0.0.0', change, ReleaseType.Patch))
  it('0.0.1 → ReleaseType.Patch', tester('0.0.1', change, ReleaseType.Patch))
  it('0.1.2 → ReleaseType.Minor', tester('0.1.2', change, ReleaseType.Minor))
  it('1.2.3 → ReleaseType.Major', tester('1.2.3', change, ReleaseType.Major))
})

describe('ChangeType.FeatureAddition', () => {
  const change = ChangeType.FeatureAddition
  it('0.0.0 → ReleaseType.Patch', tester('0.0.0', change, ReleaseType.Patch))
  it('0.0.1 → ReleaseType.Patch', tester('0.0.1', change, ReleaseType.Patch))
  it('0.1.2 → ReleaseType.Patch', tester('0.1.2', change, ReleaseType.Patch))
  it('1.2.3 → ReleaseType.Minor', tester('1.2.3', change, ReleaseType.Minor))
})

describe('ChangeType.Patch', () => {
  const change = ChangeType.Patch
  it('0.0.0 → ReleaseType.Patch', tester('0.0.0', change, ReleaseType.Patch))
  it('0.0.1 → ReleaseType.Patch', tester('0.0.1', change, ReleaseType.Patch))
  it('0.1.2 → ReleaseType.Patch', tester('0.1.2', change, ReleaseType.Patch))
  it('1.2.3 → ReleaseType.Patch', tester('1.2.3', change, ReleaseType.Patch))
})
