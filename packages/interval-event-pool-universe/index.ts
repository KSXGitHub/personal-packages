import { createEventPool, some } from '@khai96x/simple-event-pool'
import AdvMapInit from 'advanced-map-initialized'

export const INTERVAL_EVENT = Symbol('INTERVAL_EVENT')

const universe = new AdvMapInit(
  Map,
  (delay: number) => createEventPool({
    setInterval,
    clearInterval,
    delay
  })
    .createAutoTrigger(INTERVAL_EVENT, param => {
      return some(new IntervalEventParam(
        delay,
        param.iterationCount
      ))
    })
    .startEventLoop()
)

export class IntervalEventParam {
  constructor (
    public readonly intervalDelay: number,
    public readonly intervalCount: number
  ) {}
}

export function getEventPool (delay: number) {
  return universe.get(delay)
}