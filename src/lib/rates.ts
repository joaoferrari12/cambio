/** Pure functions over exchange-rate series. No React, no fetch: this is what the unit tests cover. */

export interface Currency {
  code: string
  name: string
  flag: string
}

/** One business day: how many Canadian dollars one unit of the foreign currency bought. */
export interface RatePoint {
  date: string // yyyy-mm-dd
  rate: number // CAD per 1 unit
}

export type Range = '1M' | '3M' | '1Y' | '5Y'

export const RANGES: Range[] = ['1M', '3M', '1Y', '5Y']

/** Start date for a range, counted back from `today`, as the API's yyyy-mm-dd. */
export function rangeStart(range: Range, today = new Date()): string {
  const d = new Date(today)
  switch (range) {
    case '1M': d.setMonth(d.getMonth() - 1); break
    case '3M': d.setMonth(d.getMonth() - 3); break
    case '1Y': d.setFullYear(d.getFullYear() - 1); break
    case '5Y': d.setFullYear(d.getFullYear() - 5); break
  }
  return toIso(d)
}

export function toIso(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export interface Summary {
  latest: RatePoint | null
  previous: RatePoint | null
  /** Absolute change in CAD since the previous observation. */
  change: number
  /** Relative change since the previous observation, in percent. */
  changePct: number
}

export function summarize(points: RatePoint[]): Summary {
  if (points.length === 0) return { latest: null, previous: null, change: 0, changePct: 0 }
  const latest = points[points.length - 1]
  const previous = points.length > 1 ? points[points.length - 2] : null
  const change = previous ? latest.rate - previous.rate : 0
  const changePct = previous && previous.rate !== 0 ? (change / previous.rate) * 100 : 0
  return { latest, previous, change, changePct }
}

/** Convert an amount between CAD and a foreign currency at a given CAD-per-unit rate. */
export function convert(amount: number, rate: number, direction: 'toCAD' | 'fromCAD'): number {
  if (!Number.isFinite(amount) || !Number.isFinite(rate) || rate <= 0) return 0
  return direction === 'toCAD' ? amount * rate : amount / rate
}

/** Rates with many decimals (JPY, KRW, VND…) need more precision than the usual four. */
export function rateDecimals(rate: number): number {
  if (rate >= 1) return 4
  if (rate >= 0.01) return 4
  if (rate >= 0.001) return 5
  return 6
}

export function formatRate(rate: number): string {
  return rate.toLocaleString('en-CA', { minimumFractionDigits: rateDecimals(rate), maximumFractionDigits: rateDecimals(rate) })
}

export function formatMoney(amount: number, code: string): string {
  try {
    return amount.toLocaleString('en-CA', { style: 'currency', currency: code, maximumFractionDigits: 2 })
  } catch {
    return `${amount.toFixed(2)} ${code}`
  }
}

export function formatPct(pct: number): string {
  const sign = pct > 0 ? '+' : ''
  return `${sign}${pct.toFixed(2)}%`
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-CA', opts)
}

/** Min and max of a series, for chart domains and the range summary. */
export function extent(points: RatePoint[]): { min: RatePoint; max: RatePoint } | null {
  if (points.length === 0) return null
  let min = points[0]
  let max = points[0]
  for (const p of points) {
    if (p.rate < min.rate) min = p
    if (p.rate > max.rate) max = p
  }
  return { min, max }
}
