import { Status } from './status'
import { Logger } from './console'

export function showStatus (logInfo: Logger) {
  const longestNameLength = Object
    .keys(Status)
    .reduce((prev, current) => prev.length > current.length ? prev : current)
    .length

  logInfo(' code | name')
  logInfo('------|' + '-'.repeat(longestNameLength + 2))

  for (const [name, code] of Object.entries(Status)) {
    if (typeof code !== 'number') continue
    logInfo(`${String(code).padStart(5)} | ${name}`)
  }
}
