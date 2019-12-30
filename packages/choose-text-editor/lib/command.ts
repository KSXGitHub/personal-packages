import { Option, some, none } from '@tsfun/option'
import { Which, WHICH_OPTIONS } from './which'
import { Editor } from './editors'
import flag2arg from './flag-to-arg'
import opts2args from './opts-to-args'

export interface Command {
  readonly path: string
  readonly args: readonly string[]
}

export interface CommandConstructorParam {
  readonly editor: Editor
  readonly which: Which
  readonly prefixes: Iterable<string>
}

export async function Command (param: CommandConstructorParam): Promise<Option<Command>> {
  const { editor, which, prefixes = [] } = param
  const { program, flags = [], options = {} } = editor
  const path = await which(program, WHICH_OPTIONS).catch(() => null)
  if (!path) return none()
  const flagArgs = flags.map(flag2arg)
  const optArgs = opts2args(options)
  const args = [...prefixes, ...flagArgs, ...optArgs]
  return some({ path, args })
}
