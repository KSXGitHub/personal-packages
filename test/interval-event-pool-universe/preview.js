const { INTERVAL_EVENT, getEventPool } = require('@khai96x/interval-event-pool-universe')

const target = getEventPool(1000)
  .addListener(INTERVAL_EVENT, function listener (param) {
    if (param.intervalCount === 10) {
      target.removeListener(INTERVAL_EVENT, listener)
      target.stopEventLoop()
    } else {
      console.log(param)
    }
  })
