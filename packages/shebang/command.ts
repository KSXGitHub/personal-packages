export function command (shebang: string): string | null {
  if (!shebang.startsWith('#!')) return null
  shebang = shebang.slice(2).trim()
  const segments = shebang.split(/\s+/)
  while (segments[0].endsWith('/env') && segments.length > 1) {
    segments.shift()
  }
  return segments[0].split('/').slice(-1)[0]
}

export default command
