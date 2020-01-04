import { concat } from 'iter-tools'
import { Logger } from './console'
import { ExecSync } from './exec-sync'
import { CliArguments } from './editors'
import { Command } from './command'
import { Status } from './status'

export const enum CommandHandlingMethod {
  PrintSingleLine = 'print:single',
  PrintMultiLine = 'print:multi',
  PrintJson = 'print:json',
  Execute = 'exec'
}

interface Options {
  readonly handle: CommandHandlingMethod
  readonly command: Command
  readonly args: CliArguments
  readonly logInfo: Logger
  readonly logError: Logger
  readonly execSync: ExecSync
}

class CommandHandler {
  constructor (private readonly options: Options) {}

  public async [CommandHandlingMethod.PrintSingleLine] (): Promise<Status> {
    const { path, args } = this.options.command
    const { shellEscape } = await import('./shell-escape-any-array')
    this.options.logInfo(shellEscape([path, ...args, ...this.options.args]))
    return Status.Success
  }

  public async [CommandHandlingMethod.PrintMultiLine] (): Promise<Status> {
    const { path, args } = this.options.command
    const { shellEscape } = await import('./shell-escape-any-array')
    for (const line of concat([path], args, this.options.args)) {
      this.options.logInfo(shellEscape([line]))
    }
    return Status.Success
  }

  public async [CommandHandlingMethod.PrintJson] (): Promise<Status> {
    this.options.logInfo(JSON.stringify(this.options.command, undefined, 2))
    return Status.Success
  }

  public async [CommandHandlingMethod.Execute] (): Promise<Status> {
    const { logError, command } = this.options
    const args = [...command.args, ...this.options.args]
    const { dbg } = await import('string-template-format')
    const { EXEC_OPTIONS } = await import('./constants')
    const { toStringArray } = await import('@khai96x/utils')

    try {
      this.options.execSync(this.options.command.path, toStringArray(args), EXEC_OPTIONS)
    } catch (error) {
      logError('[ERROR] Execution of command resulted in failure')
      logError(dbg`* executable: ${command.path}`)
      logError(dbg`* arguments: ${args}`)
      logError(dbg`* error: ${error}`)
      logError(dbg`* status: ${error.status}`)
      return Status.ExecutionFailure
    }

    return Status.Success
  }
}

export function handleChosenCommand (options: Options): Promise<Status> {
  const handler = new CommandHandler(options)
  return handler[options.handle]()
}
