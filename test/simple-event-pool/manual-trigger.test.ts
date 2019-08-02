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

describe('multiple events', () => {
  const TO_BE_TRIGGERED = Symbol('to be triggered')
  const NOT_TO_BE_TRIGGERED = Symbol('not to be triggered')
  const TO_BE_SENT = Symbol('to be sent')
  const NOT_TO_BE_SENT = Symbol('not to be sent')

  const pool = createEventPool({
    setInterval,
    clearInterval,
    delay: 20
  })
    .createManualTrigger<typeof TO_BE_SENT, typeof TO_BE_TRIGGERED>()
    .createManualTrigger<typeof NOT_TO_BE_SENT, typeof NOT_TO_BE_TRIGGERED>()

  describe('one that is triggered', () => {
    it('calls listener with expected argument', () => {
      const listener = jest.fn()
      pool
        .addListener(TO_BE_TRIGGERED, listener)
        .trigger(TO_BE_TRIGGERED, TO_BE_SENT)
      expect(listener).toBeCalledWith(TO_BE_SENT)
    })
  })

  describe('one that is not triggered', () => {
    it('does not call listener', () => {
      const listener = jest.fn()
      pool.addListener(NOT_TO_BE_TRIGGERED, listener)
      expect(listener).not.toBeCalled()
    })
  })
})
