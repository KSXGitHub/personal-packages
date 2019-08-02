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
      pool.stopEventLoop()
      void lock.resolve(null)
    }

    return none()
  })

  const pool = createEventPool({
    setInterval,
    clearInterval,
    delay: 20
  })
    .createAutoTrigger('event', check)
    .startEventLoop()

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

    const listener = jest.fn(() => lock.resolve(null))

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
          pool.stopEventLoop()
        }

        return none()
      })
      .addListener(EVENT, listener)
      .startEventLoop()

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
          pool.stopEventLoop()
          void lock.resolve(null)
        }

        return none()
      })
      .addListener(EVENT, listener)
      .startEventLoop()

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
          pool.stopEventLoop()
          void lock.resolve(null)
        }

        return none()
      })
      .addListener(eventA, listeners[0])
      .addListener(eventB, listeners[1])
      .addListener(eventC, listeners[2])
      .startEventLoop()

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

  describe('with multiple listeners', () => {
    const EVENT = Symbol('EVENT')
    const EXPECTED_ITERATION_COUNT = 4
    const EXPECTED_INFO = Symbol('EXPECTED_INFO')
    const lock = createControl()

    const listeners = Array(3)
      .fill(undefined)
      .map(() => jest.fn())

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
          pool.stopEventLoop()
          void lock.resolve(null)
        }

        return none()
      })
      .addListener(EVENT, listeners[0])
      .addListener(EVENT, listeners[1])
      .addListener(EVENT, listeners[2])
      .startEventLoop()

    describe('calls every listener', () => {
      listeners.forEach((fn, i) => {
        it(`listener #${i}`, async () => {
          await lock.promise
          expect(fn).toBeCalled()
        })
      })
    })

    describe('calls every listener with expected argument', () => {
      listeners.forEach((fn, i) => {
        it(`listener #${i}`, async () => {
          await lock.promise
          expect(fn).toBeCalledWith(EXPECTED_INFO)
        })
      })
    })
  })
})

describe('.removeListener', () => {
  describe('one event, one listener', () => {
    const EVENT = Symbol('EVENT')
    const lock = createControl()

    const listener = jest.fn(value => {
      if (value === 8) {
        pool.removeListener(EVENT, listener)
      }
    })

    const pool = createEventPool({
      setInterval,
      clearInterval,
      delay: 20
    })
      .createAutoTrigger(EVENT, param => {
        if (param.iterationCount % 2 === 0) {
          return some(param.iterationCount)
        }

        if (param.iterationCount > 12) {
          pool.stopEventLoop()
          void lock.resolve(null)
        }

        return none()
      })
      .addListener(EVENT, listener)
      .startEventLoop()

    it('calls listener for expected times', async () => {
      await lock.promise
      expect(listener).toBeCalledTimes(4)
    })

    it('calls listener with expected arguments', async () => {
      await lock.promise
      expect(listener.mock.calls).toMatchSnapshot()
    })
  })

  describe('one event, multiple listeners', () => {
    const EVENT = Symbol('EVENT')
    const lock = createControl()

    const listenerA = jest.fn()
    const listenerB = jest.fn((value: number) => {
      if (value === 6) pool.removeListener(EVENT, listenerB)
    })
    const listenerC = jest.fn()

    const pool = createEventPool({
      setInterval,
      clearInterval,
      delay: 20
    })
      .createAutoTrigger(EVENT, param => {
        if (param.iterationCount % 2 === 0) {
          return some(param.iterationCount)
        }

        if (param.iterationCount > 10) {
          pool.stopEventLoop()
          void lock.resolve(null)
        }

        return none()
      })
      .addListener(EVENT, listenerA)
      .addListener(EVENT, listenerB)
      .addListener(EVENT, listenerC)
      .startEventLoop()
      .removeListener(EVENT, listenerC)

    describe('listener that will never be removed', () => {
      it('runs as long as the loop runs', async () => {
        await lock.promise
        expect(listenerA.mock.calls).toMatchSnapshot()
      })
    })

    describe('listener that will be removed after some invocations', () => {
      it('runs for a while', async () => {
        await lock.promise
        expect(listenerB.mock.calls).toMatchSnapshot()
      })
    })

    describe('listener that is removed immediately after starting of event loop', () => {
      it('never run', async () => {
        await lock.promise
        expect(listenerC).not.toBeCalled()
      })
    })
  })

  describe('multiple events, one listener for each event', () => {
    const eventA = Symbol('eventA')
    const eventB = Symbol('eventB')
    const eventC = Symbol('eventC')
    const lock = createControl()

    const listenerA = jest.fn()
    const listenerB = jest.fn((value: number) => {
      if (value === 6) pool.removeListener(eventB, listenerB)
    })
    const listenerC = jest.fn()

    const pool = createEventPool({
      setInterval,
      clearInterval,
      delay: 20
    })
      .createAutoTrigger(
        eventA,
        param => param.iterationCount % 2 === 0 ? some(param.iterationCount) : none()
      )
      .createAutoTrigger(
        eventB,
        param => param.iterationCount % 3 === 0 ? some(param.iterationCount) : none()
      )
      .createAutoTrigger(
        eventC,
        param => param.iterationCount % 4 === 0 ? some(param.iterationCount) : none()
      )
      .createAutoTrigger('stop', param => {
        if (param.iterationCount > 2 * 3 * 4) {
          pool.stopEventLoop()
          void lock.resolve(null)
        }

        return none()
      })
      .addListener(eventA, listenerA)
      .addListener(eventB, listenerB)
      .addListener(eventC, listenerC)
      .startEventLoop()
      .removeListener(eventC, listenerC)

    describe('listener that will never be removed', () => {
      it('runs as long as the loop runs', async () => {
        await lock.promise
        expect(listenerA.mock.calls).toMatchSnapshot()
      })
    })

    describe('listener that will be removed after some invocations', () => {
      it('runs for a while', async () => {
        await lock.promise
        expect(listenerB.mock.calls).toMatchSnapshot()
      })
    })

    describe('listener that is removed immediately after starting of event loop', () => {
      it('never run', async () => {
        await lock.promise
        expect(listenerC).not.toBeCalled()
      })
    })
  })
})
