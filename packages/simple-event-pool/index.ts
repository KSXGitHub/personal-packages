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

export interface EventAutoTrigger<Info, ID> extends EventTarget<Info, ID> {
  createAutoTrigger<Info, ID> (event: ID, check: EventChecker<Info>): EventAutoTrigger<Info, ID> & this
}

export interface EventChecker<Info> {
  (count: number): OptionPromise<Info>
}

export type EventPool<Info, ID> = EventLoop & EventAutoTrigger<Info, ID>

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

  function createTrigger<Info, ID> (id: ID, check: EventChecker<Info>) {
    checkers.set(id, check)
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
      void Promise.resolve(check(count))
        .then(opt => opt.tag && callListeners(id, opt.value))

      count += 1
    }
  }

  function callListeners (id: any, info: any) {
    for (const fn of listeners.get(id)) {
      fn(info)
    }
  }

  const pool: EventPool<never, never> = {
    set,
    clear,
    createAutoTrigger: createTrigger,
    addListener,
    removeListener
  }

  return pool
}

export { Option, some, none }
