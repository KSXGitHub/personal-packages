/** Interface of a single line of `pacman -Qu` */
export interface QuLine {
  readonly packageName: string
  readonly oldVersion: string
  readonly newVersion: string
  readonly ignored: boolean
}
