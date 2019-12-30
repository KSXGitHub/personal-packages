export interface EditorSet {
  readonly graphical?: readonly Editor[]
  readonly terminal?: readonly Editor[]
  readonly [_: string]: readonly Editor[] | undefined
}

export interface Editor {
  readonly program: string
  readonly flags?: readonly string[]
  readonly options?: EditorOptions
}

export interface EditorOptions {
  readonly [name: string]: string | number | boolean
}
