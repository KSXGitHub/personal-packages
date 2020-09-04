import { relative } from 'path'
import { spawn } from 'child_process'
import { cwd } from 'process'
import { pipe, asyncFilter, asyncMap } from 'iter-tools'
import lines from './utils/lines'
import { Status, parsePorcelainStatus } from './parse-porcelain-status'

export async function* gitStatus() {
  const cp = spawn('git', ['status', '--porcelain=v1'], {
    stdio: ['pipe', 'pipe', 'inherit'],
  })

  const workingDirectory = cwd()

  yield* pipe(
    cp.stdout!,
    lines,
    asyncFilter(line => Boolean(line)),
    asyncMap(parsePorcelainStatus),
    asyncMap(({ path, ...rest }): Status => ({
      path: relative(workingDirectory, path),
      ...rest,
    })),
  )
}

export default gitStatus
