import assert from 'static-type-assert'
import { Option, createEventPool, some, none } from '@khai96x/simple-event-pool'

const eventA = Symbol()
const eventB = Symbol()
const eventC = Symbol()
const eventD = Symbol()
const infoB = Symbol()
const infoC = Symbol()
const infoD = Symbol()

const eventPool = createEventPool({
  setInterval,
  clearInterval,
  delay: 1000
})
  .createTrigger(eventA, () => none())
  .createTrigger(eventB, () => some(infoB))
  .createTrigger(eventC, () => none() as Option<typeof infoC>)
  .createTrigger(eventD, async () => some(infoD))
  .createTrigger('foo' as 'foo', () => some([] as []))
  .createTrigger(123 as 123, async () => some({} as {}))

eventPool
  .addListener(eventA, () => undefined)
  .addListener(eventB, info => {
    assert<typeof infoB>(info)
  })
  .addListener(eventC, info => {
    assert<typeof infoC>(info)
  })
  .addListener(eventD, info => {
    assert<typeof infoD>(info)
  })
  .addListener('foo', info => {
    assert<[]>(info)
  })
  .addListener(123, info => {
    assert<{}>(info)
  })
  .removeListener(eventD, (() => undefined) as (info: typeof infoD) => void)
