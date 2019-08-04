const { getIntervalObservable, pipeline, operators } = require('@khai96x/all').intervalObservableUniverse
const { map } = operators

const logger = pipeline(getIntervalObservable)
  .to(map(value => console.info({ value })))
  .fn(1000)

logger.subscribe()
logger.subscribe()
logger.subscribe()
logger.subscribe()
