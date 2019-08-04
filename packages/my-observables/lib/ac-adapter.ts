import spawn from 'advanced-spawn-async'
import { getIntervalObservable, pipeline, from, operators } from '@khai96x/interval-observable-universe'
const { map, filter, mergeAll, pairwise } = operators

export enum Status {
  Plugged = 'Plugged',
  Unplugged = 'Unplugged'
}

export function checkStatus (): Promise<Status | 'Unknown'> {
  return spawn('acpi', ['-a']).onclose.then(
    x => analyzeAcpiOutput(x.stdout.trim())
      ? Status.Plugged
      : Status.Unplugged,
    (): 'Unknown' => 'Unknown'
  )
}

export function analyzeAcpiOutput (output: string) {
  return /on-line/i.test(output)
}

export const getStatusObservable = pipeline(getIntervalObservable)
  .to(map(checkStatus))
  .to(map(x => from(x)))
  .to(mergeAll())
  .to(filter((x): x is Status => x !== 'Unknown'))
  .fn

export const getStatusPairObservable = pipeline(getStatusObservable)
  .to(pairwise())
  .fn

export class StatusDiff {
  constructor (
    public readonly oldStatus: Status,
    public readonly newStatus: Status
  ) {}
}

export const getStatusDiffObservable = pipeline(getStatusPairObservable)
  .to(filter(([a, b]) => a !== b))
  .to(map(([a, b]) => new StatusDiff(a, b)))
  .fn

export const getPluggedObservable = pipeline(getStatusDiffObservable)
  .to(filter(x => x.newStatus === Status.Plugged))
  .fn

export const getUnpluggedObservable = pipeline(getStatusDiffObservable)
  .to(filter(x => x.newStatus === Status.Unplugged))
  .fn

export const statuses = getStatusObservable
export const pairs = getStatusPairObservable
export const diffs = getStatusDiffObservable
export const plugged = getPluggedObservable
export const unplugged = getUnpluggedObservable
