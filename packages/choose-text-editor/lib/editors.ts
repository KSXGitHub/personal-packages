export interface EditorSet {
  readonly chooser: string
  readonly graphical?: readonly Editor[]
  readonly terminal?: readonly Editor[]
}

export interface Editor {
  readonly program: string
  readonly flags?: readonly string[]
  readonly options?: EditorOptions
  readonly suffix?: readonly string[]
}

export interface EditorOptions {
  readonly [name: string]: string | number | boolean | ReadonlyArray<string | number>
}
