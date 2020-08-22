import { asyncToArray } from 'iter-tools'
import { getIntervalObservable, pipeline, operators, from, Observable } from '@khai96x/interval-observable-universe'
import { QuLine, SingleCycleUpdateCheckerParams, SingleCycleUpdateCheckerReturn, checkForUpdatesSingleCycle } from '@khai96x/pacman'
const { map, flatMap, mergeAll, filter } = operators

export { QuLine }

export interface QuObservableParams extends SingleCycleUpdateCheckerParams {
  readonly runPeriod: number
}

export interface QuObservableValue extends SingleCycleUpdateCheckerReturn {}

export function getQuObservable(params: QuObservableParams): Observable<QuObservableValue> {
  return pipeline(() => getIntervalObservable(params.runPeriod))
    .to(map(() => checkForUpdatesSingleCycle(params)))
    .to(map(asyncToArray))
    .to(flatMap(async updates => from(await updates)))
    .to(mergeAll())
    .fn(undefined)
}

export const getQuPositiveObservable = pipeline(getQuObservable)
  .to(filter(update => update.updates.length !== 0))
  .fn

export const qu = getQuObservable
export const quPos = getQuPositiveObservable
