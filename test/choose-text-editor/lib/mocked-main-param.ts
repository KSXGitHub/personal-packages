import MockedConsole from './mocked-console'
import mockedWhichImpl from './mocked-which-impl'
import MockedCosmiConfig from './mocked-cosmiconfig'

import {
  MainParam,
  SpawnSync,
  CacheType,
  CommandHandlingMethod,
  Env,
  CosmiConfigResult,
  choose
} from '@khai96x/choose-text-editor'

class Unimplemented extends Error {
  constructor () {
    super('This function is not implemented')
  }
  public readonly name = 'Unimplemented'
}

function NEVER (): never {
  throw new Unimplemented()
}

export class MockedMainParam implements MainParam {
  constructor (
    public readonly processEnv: Env,
    public readonly cosmiConfigResult: CosmiConfigResult | null
  ) {}

  public readonly mockedCosmiConfig = new MockedCosmiConfig(this.cosmiConfigResult)

  public readonly process = { env: this.processEnv }
  public readonly console = new MockedConsole()
  public readonly which = jest.fn(mockedWhichImpl)
  public readonly spawnSync: SpawnSync = NEVER
  public readonly packageName: string = '@khai96x/choose-text-editor' // not necessary actual package name
  public readonly packageVersion: string = '3.2.1' // not the actual version, for testing purpose
  public readonly cosmiconfig = this.mockedCosmiConfig.cosmiconfig
  public readonly searchPlaces: string[] = [...'searchPlaces']
  public readonly packageProp = 'choose-text-editor'
  public readonly cache?: boolean = true
  public readonly stopDir?: string = undefined
  public readonly clearCache?: CacheType = undefined
  public readonly showStatus?: boolean = false
  public readonly onChosen: CommandHandlingMethod = CommandHandlingMethod.PrintSingleLine
  public readonly args = ['args from cli command']
  public readonly choose = jest.fn(choose)
}

export default MockedMainParam
