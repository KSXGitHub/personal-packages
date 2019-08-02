import { createEventPool } from '@khai96x/simple-event-pool'

describe('one event', () => {
  const EVENT = Symbol('EVENT')
  type Info = 'a' | 'b' | 'c'

  const pool = createEventPool({
    setInterval,
    clearInterval,
    delay: 0
  })
    .createManualTrigger<Info, typeof EVENT>()

  describe('add listener but do not trigger', () => {
    it('does not call listener', () => {
      const listener = jest.fn()
      pool.addListener(EVENT, listener)
      expect(listener).not.toBeCalled()
    })
  })

  describe('add listener then trigger', () => {
    function setup () {
      const listener = jest.fn()

      pool
        .addListener(EVENT, listener)
        .trigger(EVENT, 'a')
        .trigger(EVENT, 'b')
        .trigger(EVENT, 'c')

      return { listener }
    }

    it('calls listener for every trigger', () => {
      const { listener } = setup()
      expect(listener).toBeCalledTimes(3)
    })

    it('calls listener with expected arguments', () => {
      const { listener } = setup()
      expect(listener.mock.calls).toMatchSnapshot()
    })
  })

  describe('add listener, then remove listener, and then trigger', () => {
    function setup () {
      const listener = jest.fn()

      pool
        .addListener(EVENT, listener)
        .trigger(EVENT, 'a')
        .trigger(EVENT, 'b')
        .removeListener(EVENT, listener)
        .trigger(EVENT, 'c')

      return { listener }
    }

    it('calls listener for every trigger', () => {
      const { listener } = setup()
      expect(listener).toBeCalledTimes(2)
    })

    it('calls listener with expected arguments', () => {
      const { listener } = setup()
      expect(listener.mock.calls).toMatchSnapshot()
    })

    it('does not call listener after removal', () => {
      const { listener } = setup()
      expect(listener).not.toBeCalledWith('c')
    })
  })
})
