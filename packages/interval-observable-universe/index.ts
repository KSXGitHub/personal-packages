import { Observable, OperatorFunction, interval } from 'rxjs'
import AdvMapInit from 'advanced-map-initialized'

const universe = new AdvMapInit(Map, (period: number) => interval(period))

export function getIntervalObservable (period: number) {
  return universe.get(period)
}

export default getIntervalObservable

export function pipeline<X, Y> (fn: (x: X) => Observable<Y>) {
  return {
    to<Z> (opt: OperatorFunction<Y, Z>) {
      return pipeline((x: X) => fn(x).pipe(opt))
    },

    fn
  }
}
