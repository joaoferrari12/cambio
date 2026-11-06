import { useQuery } from '@tanstack/react-query'
import { fetchObservations } from '../api/boc'
import { rangeStart, type Range } from '../lib/rates'

/** Last ~3 weeks for every tracked currency: enough for latest, previous and a sparkline. */
export function useLatestRates(codes: string[]) {
  return useQuery({
    queryKey: ['rates', 'recent', codes],
    queryFn: ({ signal }) => fetchObservations(codes, { recent: 15 }, signal),
    enabled: codes.length > 0,
  })
}

/** Full history of one currency for the chart, keyed by range so switching ranges is instant after the first load. */
export function useHistory(code: string, range: Range) {
  return useQuery({
    queryKey: ['rates', 'history', code, range],
    queryFn: ({ signal }) => fetchObservations([code], { start_date: rangeStart(range) }, signal).then(r => r[code]),
  })
}
