import { Observable, OperatorFunction, interval } from 'rxjs'
import * as operators from 'rxjs/operators'
import AdvMapInit from 'advanced-map-initialized'
const { share } = operators

export const getIntervalObservable = pipeline((period: number) => interval(period)).fn
export default getIntervalObservable

export function pipeline<X, Y> (fn: (x: X) => Observable<Y>) {
  const map = new AdvMapInit(Map, (x: X) => fn(x))
  const to = <Z> (opt: OperatorFunction<Y, Z>) =>
    pipeline((x: X) => map.get(x).pipe(opt).pipe(share()))
  return { fn, to }
}

export * from 'rxjs'
export { operators }
