import { requiredFields, partialFields, arrayFields } from '../utils/fields'

export type { Result, Ok, Err } from '@tsfun/result'

/** Field that always appear in `.SRCINFO` */
export type RequiredField = typeof requiredFields[number]
/** Field that appears at most once in `.SRCINFO` */
export type PartialField = typeof partialFields[number]
/** Field that may appear multiple times in `.SRCINFO` */
export type ArrayField = typeof arrayFields[number]

/** Interface of `.SRCINFO` */
export type SrcInfo = Readonly<
  & Record<RequiredField, string>
  & Partial<Record<PartialField, string>>
  & Record<ArrayField, readonly string[]>
>

export type SrcInfoError =
  & Readonly<
    | { type: 'Syntax', line: string, index: number }
    | { type: 'MissingRequiredField', field: RequiredField }
  >
  & { readonly message: string }
