import { spawn } from 'child_process'
export { INTERVAL_EVENT } from '@khai96x/interval-event-pool-universe'
import { some, none } from '@khai96x/simple-event-pool'
import base from '../utils/event-target-base'

export enum Status {
  Plugged = 'Plugged',
  Unplugged = 'Unplugged'
}

export const SWITCH = Symbol('SWITCH')
export type SWITCH = typeof SWITCH
export const PLUGGED = Symbol('PLUGGED')
export type PLUGGED = typeof PLUGGED
export const UNPLUGGED = Symbol('UNPLUGGED')
export type UNPLUGGED = typeof UNPLUGGED

export function checkStatus () {
  const cp = spawn('acpi', ['-a'])

  let text = ''
  cp.stdout.addListener('data', chunk => text += chunk)

  return new Promise<Status | 'unknown'>(resolve => {
    cp.stdout.addListener('close', () => {
      const plugged = analyzeAcpiOutput(String(text.trim()))
      resolve(plugged ? Status.Plugged : Status.Unplugged)
    })

    cp.addListener('error', () => resolve('unknown'))
  })
}

export function analyzeAcpiOutput (output: string) {
  return /on-line/i.test(output)
}

let statusPromise = checkStatus()
async function switchCheck () {
  const prevStatus = await statusPromise
  if (prevStatus === 'unknown') return none()
  const currentStatus = await checkStatus()
  if (currentStatus === 'unknown') return none()
  if (prevStatus !== currentStatus) {
    statusPromise = Promise.resolve(currentStatus)
    return some(currentStatus)
  }
  return none()
}

export const target = base
  .createManualTrigger<void, PLUGGED>()
  .createManualTrigger<void, UNPLUGGED>()
  .createAutoTrigger(SWITCH, switchCheck)

target.addListener(SWITCH, status =>
  status === Status.Plugged
    ? target.trigger(PLUGGED)
    : target.trigger(UNPLUGGED)
)
