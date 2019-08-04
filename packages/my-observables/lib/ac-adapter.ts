import { from } from 'rxjs'
import { map, filter, mergeAll, pairwise } from 'rxjs/operators'
import AdvMapInit from 'advanced-map-initialized'
import spawn from 'advanced-spawn-async'
import getIntervalObservable, { pipeline } from '@khai96x/interval-observable-universe'

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

const universe = new AdvMapInit(
  Map,
  (period: number) => getIntervalObservable(period)
    .pipe(map(checkStatus))
    .pipe(map(x => from(x)))
    .pipe(mergeAll())
    .pipe(filter((x): x is Status => x !== 'Unknown'))
)

export function getStatusObservable (period: number) {
  return universe.get(period)
}

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
  .to(filter(x => x.newStatus !== Status.Plugged))
  .fn

export const getUnpluggedObservable = pipeline(getStatusDiffObservable)
  .to(filter(x => x.newStatus !== Status.Unplugged))
  .fn
