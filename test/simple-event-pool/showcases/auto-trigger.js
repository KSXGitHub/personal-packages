const { createEventPool, some, none } = require('@khai96x/simple-event-pool')

const target = createEventPool({
  setInterval,
  clearInterval,
  delay: 1000
})
  .createAutoTrigger('never', () => none())
  .createAutoTrigger('every second', param => some(param.iterationCount))
  .createAutoTrigger(
    'every 3 seconds',
    param => param.iterationCount % 3 === 0
      ? some(param.iterationCount)
      : none()
  )
  .createAutoTrigger(
    'every 15 seconds',
    param => param.iterationCount % 15 === 0
      ? some(param.iterationCount)
      : none()
  )
  .startEventLoop()

target
  .addListener('never', () => console.log('this message will never show'))
  .addListener('every second', value => console.log('1x', value))
  .addListener('every 3 seconds', value => console.log('3x', value))
  .addListener('every 15 seconds', value => console.log('15x', value))
  .addListener('every 15 seconds', () => target.stopEventLoop())
