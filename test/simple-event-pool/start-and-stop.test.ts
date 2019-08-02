import { createEventPool } from '@khai96x/simple-event-pool'

describe('when set', () => {
  it('cannot be set again', () => {
    const pool = createEventPool({
      setInterval: () => undefined,
      clearInterval: () => undefined,
      delay: 0
    })

    pool.startEventLoop()
    expect(() => pool.startEventLoop()).toThrowErrorMatchingSnapshot()
  })

  it('calls setInterval with expected arguments', () => {
    const DELAY = 1024
    const setInterval = jest.fn()

    const pool = createEventPool({
      setInterval,
      clearInterval: () => undefined,
      delay: DELAY
    })

    pool.startEventLoop()
    expect(setInterval).toBeCalledWith(
      expect.any(Function),
      DELAY
    )
  })
})

describe('when clear', () => {
  describe('before set', () => {
    it('does not call clearInterval', () => {
      const clearInterval = jest.fn()

      const pool = createEventPool({
        setInterval: () => undefined,
        clearInterval,
        delay: 0
      })

      pool.stopEventLoop()
      expect(clearInterval).not.toBeCalled()
    })
  })

  describe('after set', () => {
    it('calls clearInterval with expected arguments', () => {
      const TIMER = 'TIMER'
      const clearInterval = jest.fn()

      const pool = createEventPool({
        setInterval: () => TIMER,
        clearInterval,
        delay: 0
      })

      pool.startEventLoop()
      pool.stopEventLoop()
      expect(clearInterval).toBeCalledWith(TIMER)
    })
  })
})
