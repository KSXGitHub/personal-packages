import { Change } from 'diff'

export function prettify(changes: readonly Change[]): string {
  return changes.map(item => {
    const prefix = (
      item.added ? '+ ' : item.removed ? '- ' : ' '.repeat(2)
    )

    return item.value
      .split('\n')
      .filter(Boolean)
      .map(line => prefix + line)
      .join('\n')
  }).join('\n')
}
