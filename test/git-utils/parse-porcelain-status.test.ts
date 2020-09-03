import { parsePorcelainStatus, parsePorcelainStatusValue } from '@khai96x/git-utils'

describe('parsePorcelainStatus', () => {
  it('success', () => {
    expect([
      '?? unstaged new file',
      ' D unstaged deleted file',
      ' M unstaged modified file',
      'A  staged new file',
      'D  staged deleted file',
      'M  staged modified file',
      'AD added and deleted',
      'AM added and modified',
      'MM modified twice',
    ].map(parsePorcelainStatus)).toMatchSnapshot()
  })

  it('separator is not a space', () => {
    expect(() => parsePorcelainStatus('??:new file')).toThrowErrorMatchingSnapshot()
  })
})

describe('parsePorcelainStatusValue', () => {
  it('success', () => {
    expect(
      ['??', ' M', ' D', 'A ', 'M ', 'D ', 'AD', 'AM', 'MD']
        .map(parsePorcelainStatusValue),
    ).toMatchSnapshot()
  })

  it('excessive characters', () => {
    expect(() => parsePorcelainStatusValue('???')).toThrowErrorMatchingSnapshot()
  })

  it('invalid staged character', () => {
    expect(() => parsePorcelainStatusValue('* ')).toThrowErrorMatchingSnapshot()
  })

  it('invalid unstaged character', () => {
    expect(() => parsePorcelainStatusValue(' A')).toThrowErrorMatchingSnapshot()
  })
})
