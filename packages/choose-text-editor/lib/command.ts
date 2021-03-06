import { Option, some, none } from '@tsfun/option'
import { Which, WHICH_OPTIONS } from './which'
import { Editor, CliArguments, CliArgumentsElement } from './editors'
import encodeCliFlag from './encode-cli-flag'
import encodeCliOptions from './encode-cli-option'

export interface Command {
  readonly path: string
  readonly args: CliArguments
}

export interface CommandConstructorParam {
  readonly editor: Editor
  readonly which: Which
  readonly prefixes: Iterable<CliArgumentsElement>
}

export async function Command(param: CommandConstructorParam): Promise<Option<Command>> {
  const { editor, which, prefixes } = param
  const { program, flags = [], options = {}, suffixes = [] } = editor
  const path = await which(program, WHICH_OPTIONS).catch(() => null)
  if (!path) return none()
  const flagArgs = flags.map(encodeCliFlag)
  const optArgs = encodeCliOptions(options)
  const args = [...prefixes, ...flagArgs, ...optArgs, ...suffixes]
  return some({ path, args })
}
