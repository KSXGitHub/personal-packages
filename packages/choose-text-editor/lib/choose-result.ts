import { Command } from './command'

interface ResultBase<Error> {
  readonly error: Error
}

type ErrorOf<Type> = Type extends ResultBase<infer Tag> ? Tag : never

interface SimpleConstructor<Type extends ResultBase<any>> {
  (): Type
}

/**
 * Create a simple constructor
 * @param error Error Tag
 * @returns A constructor
 *
 * @note Only use this for type that only has "error" property
 */
function SimpleConstructor<Type extends ResultBase<any>> (
  error: ErrorOf<Type>
): SimpleConstructor<Type> {
  const result = Object.freeze({ error })
  return (): Type => result as any
}

export const NOT_FOUND = Symbol('NOT_FOUND')
export interface NotFound extends ResultBase<typeof NOT_FOUND> {}
export const NotFound = SimpleConstructor<NotFound>(NOT_FOUND)

export const INDETERMINABLE_TTY = Symbol('INDETERMINABLE_TTY')
export interface IndeterminableTTY extends ResultBase<typeof INDETERMINABLE_TTY> {}
export const IndeterminableTTY = SimpleConstructor<IndeterminableTTY>(INDETERMINABLE_TTY)

export const PREFIXES_PARSING_FAILURE = Symbol('PARSING_FAILURE')
export interface PrefixesParsingFailure extends ResultBase<typeof PREFIXES_PARSING_FAILURE> {
  readonly envKey: string
  readonly envValue: string
}
export const PrefixesParsingFailure = (envValue: string, envKey: string): PrefixesParsingFailure => ({
  error: PREFIXES_PARSING_FAILURE,
  envKey,
  envValue
})

export interface Chosen extends ResultBase<null> {
  readonly command: Command
}
export const Chosen = (command: Command): Chosen => ({
  error: null,
  command
})

export type ChooseResult =
  NotFound |
  IndeterminableTTY |
  PrefixesParsingFailure |
  Chosen
