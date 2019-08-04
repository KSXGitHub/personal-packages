const { acAdapter, operators } = require('@khai96x/all').myObservables
const { getPluggedObservable, getUnpluggedObservable } = acAdapter
const { map } = operators
const PERIOD = 1000

console.info('Listening...')

getPluggedObservable(PERIOD)
  .pipe(map(diff => console.info('plugged →', diff)))
  .subscribe()

getUnpluggedObservable(PERIOD)
  .pipe(map(diff => console.info('unplugged →', diff)))
  .subscribe()
