export function addIndentation (text: string, level: number) {
  const indent = ' '.repeat(level)
  return text.split('\n').map(line => indent + line).join('\n')
}

export default addIndentation
