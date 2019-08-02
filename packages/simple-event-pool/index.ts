import { Option, none, some } from '@tsfun/option'
import AdvMapInit from 'advanced-map-initialized'

type MaybePromise<Value> = Value | Promise<Value>
type OptionPromise<Value> = MaybePromise<Option<Value>>

export interface SetIntervalFunc<ID> {
  (func: () => void, delay: number): ID
}

export interface ClearIntervalFunc<ID> {
  (id: ID): void
}

export interface EventPoolOptions<IntervalID> {
  readonly setInterval: SetIntervalFunc<IntervalID>
  readonly clearInterval: ClearIntervalFunc<IntervalID>
  readonly delay: number
}

export interface EventLoop {
  set (): this
  clear (): this
}

export interface EventTarget<Info, ID> {
  addListener (event: ID, listener: (info: Info) => void): this
  removeListener (event: ID, listener: (info: Info) => void): this
}

export interface TriggerTarget<Info, ID> {
  trigger (event: ID, info: Info): this
}

export interface TriggerMaker {
  createAutoTrigger<Info, ID> (event: ID, check: EventChecker<Info>): EventTarget<Info, ID> & this
  createManualTrigger<Info, ID> (): EventTarget<Info, ID> & TriggerTarget<Info, ID> & this
}

export interface EventChecker<Info> {
  (param: AutoTriggerParam): OptionPromise<Info>
}

export interface EventPool<Info, ID> extends
  EventLoop,
  EventTarget<Info, ID>,
  TriggerTarget<Info, ID>,
  TriggerMaker {}

class AutoTriggerParamInstance {
  constructor (public readonly iterationCount: number) {}
}

export interface AutoTriggerParam extends AutoTriggerParamInstance {}

export function createEventPool<IntervalID> (options: EventPoolOptions<IntervalID>) {
  const { setInterval, clearInterval, delay } = options

  let id: Option<IntervalID> = none()

  function set () {
    if (id.tag) throw new Error('Interval already set')
    id = some(setInterval(intervalCallback, delay))
    return pool
  }

  function clear () {
    if (!id.tag) return pool
    clearInterval(id.value)
    id = none()
    return pool
  }

  // id -> checker
  const checkers = new Map<any, EventChecker<any>>()

  function createAutoTrigger<Info, ID> (id: ID, check: EventChecker<Info>) {
    checkers.set(id, check)
    return pool
  }

  function createManualTrigger () {
    return pool
  }

  // id -> [listener]
  const listeners = new AdvMapInit<any, Set<(info: any) => void>>(Map, () => new Set())

  function addListener (event: any, listener: any) {
    listeners.get(event).add(listener)
    return pool
  }

  function removeListener (event: any, listener: any) {
    listeners.get(event).delete(listener)
    return pool
  }

  let count = 0

  function intervalCallback () {
    for (const [id, check] of checkers) {
      count += 1

      const param = new AutoTriggerParamInstance(count)

      void Promise.resolve(check(param))
        .then(opt => opt.tag && trigger(id, opt.value))
    }
  }

  function trigger (id: any, info: any) {
    for (const fn of listeners.get(id)) {
      fn(info)
    }

    return pool
  }

  const pool: EventPool<never, never> = {
    set,
    clear,
    createAutoTrigger,
    createManualTrigger,
    addListener,
    removeListener,
    trigger
  }

  return pool
}

export { Option, some, none }
