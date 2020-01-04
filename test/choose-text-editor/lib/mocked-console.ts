import { Console } from '@khai96x/choose-text-editor'
import { MockedLogger } from './mocked-logger'

export class MockedConsole implements Console {
  public readonly infoBox = new MockedLogger()
  public readonly info = this.infoBox.log
  public readonly getInfoLogs = this.infoBox.getLogs
  public readonly getInfoText = this.infoBox.getText
  public readonly errorBox = new MockedLogger()
  public readonly error = this.errorBox.log
  public readonly getErrorLogs = this.errorBox.getLogs
  public readonly getErrorText = this.errorBox.getText
}

export default MockedConsole
