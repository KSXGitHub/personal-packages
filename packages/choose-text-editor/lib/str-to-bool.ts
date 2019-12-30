export const STR2BOOL: {
  readonly true: true
  readonly false: false
  readonly [_: string]: boolean | undefined
} = Object.freeze({ true: true, false: false })

export default STR2BOOL
