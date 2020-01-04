export class MockedLogger {
  public readonly log = jest.fn()
  public readonly getLogs = (): any[][] => this.log.mock.calls
  public readonly getText = (): string => '\n' + this.getLogs().map(ln => ln.join(' ')).join('\n') + '\n'
}

export default MockedLogger
