import { createEventPool, some, none } from '@khai96x/simple-event-pool'

describe('when set', () => {
  describe('calls callback', () => {
    const callback = jest.fn()

    createEventPool({
      setInterval: () => undefined,
      clearInterval: () => undefined,
      delay: 0
    })
      .startEventLoop(callback)
      .startEventLoop(callback)
      .startEventLoop(callback)

    it('for every time', () => {
      expect(callback).toBeCalledTimes(3)
    })

    it('with expected arguments', () => {
      expect(callback.mock.calls).toMatchSnapshot()
    })
  })

  it('cannot be set again', () => {
    expect.assertions(1)

    const pool = createEventPool({
      setInterval: () => undefined,
      clearInterval: () => undefined,
      delay: 0
    })

    pool.startEventLoop()
    pool.startEventLoop(error => expect(error).toMatchSnapshot())
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

    it('calls callback with some(Error)', () => {
      const callback = jest.fn()

      const pool = createEventPool({
        setInterval: () => undefined,
        clearInterval: () => undefined,
        delay: 0
      })

      pool.stopEventLoop(callback)
      expect(callback).toBeCalledWith(some(expect.any(Error)))
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

    it('calls callback with none()', () => {
      const callback = jest.fn()

      const pool = createEventPool({
        setInterval: () => undefined,
        clearInterval: () => undefined,
        delay: 0
      })

      pool.startEventLoop()
      pool.stopEventLoop(callback)
      expect(callback).toBeCalledWith(none())
    })
  })
})

it('interleave', () => {
  const callback = jest.fn()

  createEventPool({
    setInterval: () => undefined,
    clearInterval: () => undefined,
    delay: 0
  })
    .startEventLoop(callback)
    .stopEventLoop(callback)
    .startEventLoop(callback)
    .stopEventLoop(callback)
    .startEventLoop(callback)
    .stopEventLoop(callback)
    .startEventLoop(callback)
    .startEventLoop(callback)
    .stopEventLoop(callback)
    .stopEventLoop(callback)
    .startEventLoop(callback)
    .startEventLoop(callback)
    .stopEventLoop(callback)
    .stopEventLoop(callback)
    .startEventLoop(callback)
    .startEventLoop(callback)
    .startEventLoop(callback)
    .stopEventLoop(callback)
    .stopEventLoop(callback)
    .stopEventLoop(callback)

  expect(callback.mock.calls).toMatchSnapshot()
})
