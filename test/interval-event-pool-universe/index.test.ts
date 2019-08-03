import createLock from 'remote-controlled-promise'
import { INTERVAL_EVENT, IntervalEventParam, getEventPool } from '@khai96x/interval-event-pool-universe'

describe('getEventPool ： delay → event pool', () => {
  it('event pool of the same delay is the same', () => {
    expect(getEventPool(10)).toBe(getEventPool(10))
  })

  it('event pool of different delay is different', () => {
    expect(getEventPool(10)).not.toBe(getEventPool(12))
  })
})

describe('interval event', () => {
  function setup () {
    const DELAY = 3
    const LOCK_COUNT = 10

    const pool = getEventPool(DELAY)
      .addListener(INTERVAL_EVENT, function listener (param) {
        if (param.intervalCount > LOCK_COUNT) {
          pool.removeListener(INTERVAL_EVENT, listener)
        } else {
          void lockArray[param.intervalCount - 1].resolve(param)
        }
      })

    const lockArray = Array(LOCK_COUNT)
      .fill(undefined)
      .map(() => createLock<IntervalEventParam>())

    const lockPromise = Promise.all(lockArray.map(lock => lock.promise))

    return { DELAY, LOCK_COUNT, pool, lockArray, lockPromise }
  }

  it('with expected arguments', async () => {
    const { lockPromise } = setup()
    expect(await lockPromise).toMatchSnapshot()
  })

  describe('every argument has "intervalDelay" property', () => {
    const { DELAY, lockArray } = setup()

    lockArray.forEach((lock, index) => {
      it(`argument #${index}`, async () => {
        expect(await lock.promise).toHaveProperty('intervalDelay', DELAY)
      })
    })
  })

  describe('every argument has "intervalCount" property', () => {
    const { lockArray } = setup()

    lockArray.forEach((lock, index) => {
      it(`argument #${index}`, async () => {
        expect(await lock.promise).toHaveProperty('intervalCount', expect.any(Number))
      })
    })
  })
})
