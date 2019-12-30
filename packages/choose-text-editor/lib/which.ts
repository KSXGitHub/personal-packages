export interface Which {
  (program: string, options: WhichOptions): Promise<string>
}

export interface WhichOptions {
  readonly all: false
}

export const WHICH_OPTIONS: WhichOptions = Object.freeze({ all: false })
