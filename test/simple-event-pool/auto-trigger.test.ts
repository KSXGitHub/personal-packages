import createControl from 'remote-controlled-promise'
import {
  EventChecker,
  createEventPool,
  some,
  none
} from '@khai96x/simple-event-pool'

const createMockedChecker = <Info> (check: EventChecker<Info>) => jest.fn(check)

describe('.createAutoTrigger', () => {
  const EXPECTED_ITERATION_COUNT = 4
  const lock = createControl()

  const check = createMockedChecker(param => {
    if (param.iterationCount >= EXPECTED_ITERATION_COUNT) {
      pool.clear()
      void lock.resolve(undefined)
    }

    return none()
  })

  const pool = createEventPool({
    setInterval,
    clearInterval,
    delay: 20
  })
    .createAutoTrigger('event' as 'event', check)
    .set()

  it('calls check repeatedly', async () => {
    await lock.promise
    expect(check).toBeCalledTimes(EXPECTED_ITERATION_COUNT)
  })

  it('calls check with expected arguments', async () => {
    await lock.promise
    expect(check.mock.calls).toMatchSnapshot()
  })
})

describe('.addListener', () => {
  describe('when event is fired once', () => {
    const EVENT = Symbol('EVENT')
    const EXPECTED_ITERATION_COUNT = 4
    const EXPECTED_INFO = 'EXPECTED_INFO'
    const lock = createControl()

    const listener = jest.fn(() => lock.resolve(undefined))

    const pool = createEventPool({
      setInterval,
      clearInterval,
      delay: 20
    })
      .createAutoTrigger(EVENT, param => {
        if (param.iterationCount === EXPECTED_ITERATION_COUNT) {
          return some(EXPECTED_INFO)
        }

        if (param.iterationCount > EXPECTED_ITERATION_COUNT) {
          pool.clear()
        }

        return none()
      })
      .addListener(EVENT, listener)
      .set()

    it('calls listener once', async () => {
      await lock.promise
      expect(listener).toBeCalledTimes(1)
    })

    it('calls listener with expected arguments', async () => {
      await lock.promise
      expect(listener).toBeCalledWith(EXPECTED_INFO)
    })
  })

  describe('when event is fired multiple times', () => {
    const EVENT = Symbol('EVENT')
    const EVENT_MOD = 3
    const EVENT_COUNT = 4
    const lock = createControl()

    const makeInfo = (n: number) => `event #${n}`

    const listener = jest.fn()

    const pool = createEventPool({
      setInterval,
      clearInterval,
      delay: 20
    })
      .createAutoTrigger(EVENT, param => {
        if (param.iterationCount % EVENT_MOD === 0) {
          return some(makeInfo(param.iterationCount))
        }

        if (param.iterationCount > EVENT_MOD * EVENT_COUNT) {
          pool.clear()
          void lock.resolve(undefined)
        }

        return none()
      })
      .addListener(EVENT, listener)
      .set()

    it('calls listener for every time the event occurs', async () => {
      await lock.promise
      expect(listener).toBeCalledTimes(EVENT_COUNT)
    })

    it('calls listener with expected arguments', async () => {
      await lock.promise
      expect(listener.mock.calls).toMatchSnapshot()
    })
  })

  describe('with multiple events', () => {
    const args2arr = <Args extends any[]> (...args: Args) => args
    const eventA = Symbol('eventA')
    const eventB = Symbol('eventB')
    const eventC = Symbol('eventC')
    const infoA = Symbol('infoA')
    const infoB = Symbol('infoB')
    const infoC = Symbol('infoC')
    const infoArray = args2arr(infoA, infoB, infoC)
    const lock = createControl()

    const listeners = Array(3)
      .fill(undefined)
      .map(() => jest.fn())

    const pool = createEventPool({
      setInterval,
      clearInterval,
      delay: 20
    })
      .createAutoTrigger(eventA, param => param.iterationCount % 2 === 0 ? some(infoA) : none())
      .createAutoTrigger(eventB, param => param.iterationCount % 3 === 0 ? some(infoB) : none())
      .createAutoTrigger(eventC, param => param.iterationCount % 4 === 0 ? some(infoC) : none())
      .createAutoTrigger('stop', param => {
        if (param.iterationCount > 2 * 3 * 4) {
          pool.clear()
          void lock.resolve(undefined)
        }

        return none()
      })
      .addListener(eventA, listeners[0])
      .addListener(eventB, listeners[1])
      .addListener(eventC, listeners[2])
      .set()

    describe('every event is called', () => {
      listeners.forEach((fn, i) => {
        it(`listener #${i}`, async () => {
          await lock.promise
          expect(fn).toBeCalled()
        })
      })
    })

    describe('every event is called with expected arguments', () => {
      listeners.forEach((fn, i) => {
        it(`listener #${i}`, async () => {
          await lock.promise
          expect(fn).toBeCalledWith(infoArray[i])
        })
      })
    })
  })
})
