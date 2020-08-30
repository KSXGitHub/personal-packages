import path from 'path'
import { spawn } from 'child_process'
import { stat, readdir } from 'fs-extra'
import { ok, err } from '@tsfun/result'

export interface Console {
  info(msg: string): void
}

export interface Param {
  readonly fuzzyFinder: string
  readonly directory: string
  readonly directoriesOnly: boolean
}

export function main(param: Param): Promise<number> {
  const {
    fuzzyFinder,
    directory,
    directoriesOnly,
  } = param

  const [program, ...args] = fuzzyFinder.split(/\s+/).filter(x => x.trim())
  const include: {
    (directory: string, name: string): boolean | Promise<boolean>
  } = directoriesOnly
    ? (directory, name) =>
      stat(path.join(directory, name)).then(
        stats => stats.isDirectory(),
        () => false,
      )
    : () => true

  function loop(directory: string): Promise<number> {
    const cp = spawn(program, args, {
      stdio: ['pipe', 'pipe', 'inherit'],
    })

    const write = (line: string) => cp.stdin.write(line + '\n')

    return new Promise(async (resolve, reject) => {
      cp.on('error', reject)
      cp.stdout.on('error', reject)

      cp.on('close', async status => {
        while (output.endsWith('\n')) {
          output = output.slice(0, -1)
        }

        switch (output) {
          case '':
            resolve(status)
            break
          case '.':
            console.info(directory)
            resolve(status)
            break
          case '..':
            await loop(path.join(directory, '..')).then(resolve, reject)
            break
          default:
            const nextPath = path.join(directory, output)
            const stats = await stat(nextPath).then(ok, err)
            if (stats.tag && stats.value.isDirectory()) {
              await loop(nextPath).then(resolve, reject)
            } else {
              console.info(nextPath)
              resolve(status)
            }
            break
        }
      })

      write('.')
      write('..')
      readdir(directory).then(async list => {
        for (const name of list) {
          if (await include(directory, name)) write(name)
        }
      }).catch(reject)

      let output = ''
      for await (const chunk of cp.stdout) {
        output += String(chunk)
      }
    })
  }

  return loop(directory)
}

export default main
