export function trimNewLinesEnd(text: string): string {
  while (text.endsWith('\n')) {
    text = text.slice(0, -1)
  }
  return text
}
