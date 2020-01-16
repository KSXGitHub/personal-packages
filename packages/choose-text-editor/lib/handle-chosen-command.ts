import { concat } from 'iter-tools'
import { Logger } from './console'
import { SpawnSync } from './spawn-sync'
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
  readonly spawnSync: SpawnSync
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
    const { command } = this.options
    const { toStringArray } = await import('@khai96x/utils')
    const newCommand: Command = {
      path: command.path,
      args: toStringArray([...command.args, ...this.options.args])
    }
    this.options.logInfo(JSON.stringify(newCommand, undefined, 2))
    return Status.Success
  }

  public async [CommandHandlingMethod.Execute] (): Promise<Status> {
    const { logError, command } = this.options
    const args = [...command.args, ...this.options.args]
    const { dbg } = await import('string-template-format-inspect')
    const { EXEC_OPTIONS } = await import('./constants')
    const { toStringArray } = await import('@khai96x/utils')

    const spawnReturn = this.options.spawnSync(
      this.options.command.path,
      toStringArray(args),
      EXEC_OPTIONS
    )

    if (spawnReturn.error) {
      logError('[ERROR] Failed to execute command')
      logError(dbg`* executable: ${command.path}`)
      logError(dbg`* error: ${spawnReturn.error}`)
      return Status.ExecutionFailure
    }

    if (spawnReturn.status) {
      logError('[ERROR] Execution of command resulted in failure')
      logError(dbg`* executable: ${command.path}`)
      logError(dbg`* arguments: ${args}`)
      logError(dbg`* status: ${spawnReturn.status}`)
      return Status.ExecutionFailure
    }

    return Status.Success
  }
}

export function handleChosenCommand (options: Options): Promise<Status> {
  const handler = new CommandHandler(options)
  return handler[options.handle]()
}
