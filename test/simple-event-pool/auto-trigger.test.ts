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
})
