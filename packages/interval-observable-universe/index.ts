import { Observable, OperatorFunction, interval } from 'rxjs'
import * as operators from 'rxjs/operators'
import AdvMapInit from 'advanced-map-initialized'
const { share } = operators

const universe = new AdvMapInit(Map, (period: number) => interval(period))

export function getIntervalObservable (period: number) {
  return universe.get(period)
}

export default getIntervalObservable

export function pipeline<X, Y> (fn: (x: X) => Observable<Y>) {
  return {
    to<Z> (opt: OperatorFunction<Y, Z>) {
      return pipeline((x: X) => fn(x).pipe(share()).pipe(opt))
    },

    fn
  }
}

export * from 'rxjs'
export { operators }
