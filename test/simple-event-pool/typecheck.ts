import assert from 'static-type-assert'
import { Option, createEventPool, some, none } from '@khai96x/simple-event-pool'

const eventA = Symbol()
const eventB = Symbol()
const eventC = Symbol()
const eventD = Symbol()
const eventE = Symbol()
const infoB = Symbol()
const infoC = Symbol()
const infoD = Symbol()
const infoE = Symbol()

const eventPool = createEventPool({
  setInterval,
  clearInterval,
  delay: 1000
})
  .createAutoTrigger(eventA, () => none())
  .createAutoTrigger(eventB, () => some(infoB))
  .createAutoTrigger(eventC, () => none() as Option<typeof infoC>)
  .createAutoTrigger(eventD, async () => some(infoD))
  .createAutoTrigger('foo' as 'foo', () => some([] as []))
  .createAutoTrigger(123 as 123, async () => some({} as {}))
  .createManualTrigger<typeof infoE, typeof eventE>(eventE)
  .createManualTrigger<456, 'bar'>('bar')

eventPool
  .addListener(eventA, () => undefined)
  .addListener(eventB, info => assert<typeof infoB>(info))
  .addListener(eventC, info => assert<typeof infoC>(info))
  .addListener(eventD, info => assert<typeof infoD>(info))
  .addListener('foo', info => assert<[]>(info))
  .addListener(123, info => assert<{}>(info))
  .addListener(eventE, info => assert<typeof infoE>(info))
  .addListener('bar', info => assert<456>(info))
  .removeListener(eventD, (() => undefined) as (info: typeof infoD) => void)
  .trigger(eventE, infoE)
  .trigger('bar', 456)
