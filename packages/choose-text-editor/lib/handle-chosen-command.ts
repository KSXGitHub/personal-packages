import { Exit } from './process'
import { Logger } from './console'
import { ExecSync } from './exec-sync'
import { Command } from './command'
import { Status } from './status'

export enum CommandHandlingMethod {
  PrintSingleLine = 'print:single',
  PrintMultiLine = 'print:multi',
  PrintJson = 'print:json',
  Execute = 'exec'
}

interface Options<ExitReturn> {
  readonly handle: CommandHandlingMethod
  readonly command: Command
  readonly args: readonly string[]
  readonly exit: Exit<ExitReturn>
  readonly logInfo: Logger
  readonly logError: Logger
  readonly execSync: ExecSync
}

class ExecutionHandler<Return> {
  constructor (private readonly options: Options<Return>) {}

  public async [CommandHandlingMethod.PrintSingleLine] (): Promise<Return> {
    const { path, args } = this.options.command
    const { default: escape } = await import('shell-escape')
    this.options.logInfo(escape([path, ...args, ...this.options.args]))
    return this.options.exit(Status.Success)
  }

  public async [CommandHandlingMethod.PrintMultiLine] (): Promise<Return> {
    const { path, args } = this.options.command
    const { default: escape } = await import('shell-escape')
    for (const line of [path, ...args, ...this.options.args]) {
      this.options.logInfo(escape([line]))
    }
    return this.options.exit(Status.Success)
  }

  public async [CommandHandlingMethod.PrintJson] (): Promise<Return> {
    this.options.logInfo(JSON.stringify(this.options.command, undefined, 2))
    return this.options.exit(Status.Success)
  }

  public async [CommandHandlingMethod.Execute] (): Promise<Return> {
    const { logError, command, exit } = this.options
    const finalArgs = [...command.args, ...this.options.args]
    const { dbg } = await import('string-template-format')
    const { EXEC_OPTIONS } = await import('./constants')

    try {
      this.options.execSync(this.options.command.path, finalArgs, EXEC_OPTIONS)
    } catch (error) {
      logError('[ERROR] Execution of command resulted in failure')
      logError(dbg`* executable: ${command.path}`)
      logError(dbg`* arguments: ${finalArgs}`)
      logError(dbg`* error: ${error}`)
      logError(dbg`* status: ${error.status}`)
      return exit(Status.ExecutionFailure)
    }

    return exit(Status.Success)
  }
}

export function handleChosenCommand<Return> (options: Options<Return>): Promise<Return> {
  const handler = new ExecutionHandler(options)
  return handler[options.handle]()
}
