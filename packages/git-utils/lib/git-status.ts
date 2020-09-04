import { spawn } from 'child_process'
import { pipe, asyncFilter, asyncMap } from 'iter-tools'
import lines from './utils/lines'
import { parsePorcelainStatus } from './parse-porcelain-status'

export async function* gitStatus() {
  const cp = spawn('git', ['status', '--porcelain=v1'], {
    stdio: ['pipe', 'pipe', 'inherit'],
  })

  yield* pipe(
    cp.stdout!,
    lines,
    asyncFilter(line => Boolean(line)),
    asyncMap(parsePorcelainStatus),
  )
}

export default gitStatus
