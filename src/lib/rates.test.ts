import { describe, expect, it } from 'vitest'
import { convert, extent, formatPct, formatRate, rangeStart, rateDecimals, summarize, toIso } from './rates'

const series = [
  { date: '2026-11-03', rate: 0.2600 },
  { date: '2026-11-04', rate: 0.2650 },
  { date: '2026-11-05', rate: 0.2597 },
]

describe('summarize', () => {
  it('returns the last observation as latest and the one before as previous', () => {
    const s = summarize(series)
    expect(s.latest?.date).toBe('2026-11-05')
    expect(s.previous?.date).toBe('2026-11-04')
  })
  it('computes the day-over-day change in CAD and in percent', () => {
    const s = summarize(series)
    expect(s.change).toBeCloseTo(-0.0053, 6)
    expect(s.changePct).toBeCloseTo(-2.0, 2)
  })
  it('handles one or zero observations without dividing by zero', () => {
    expect(summarize([series[0]])).toMatchObject({ previous: null, change: 0, changePct: 0 })
    expect(summarize([])).toMatchObject({ latest: null, previous: null })
  })
})

describe('convert', () => {
  it('multiplies when going to CAD and divides when going from CAD', () => {
    expect(convert(100, 0.25, 'toCAD')).toBe(25)
    expect(convert(25, 0.25, 'fromCAD')).toBe(100)
  })
  it('returns 0 for a non-finite or non-positive rate instead of Infinity or NaN', () => {
    expect(convert(10, 0, 'fromCAD')).toBe(0)
    expect(convert(10, Number.NaN, 'toCAD')).toBe(0)
    expect(convert(Number.NaN, 0.25, 'toCAD')).toBe(0)
  })
})

describe('rangeStart', () => {
  const today = new Date('2026-11-06T12:00:00')
  it('counts back one month, three months, one year and five years', () => {
    expect(rangeStart('1M', today)).toBe('2026-10-06')
    expect(rangeStart('3M', today)).toBe('2026-08-06')
    expect(rangeStart('1Y', today)).toBe('2025-11-06')
    expect(rangeStart('5Y', today)).toBe('2021-11-06')
  })
  it('formats dates as yyyy-mm-dd with zero padding', () => {
    expect(toIso(new Date('2026-01-05T12:00:00'))).toBe('2026-01-05')
  })
})

describe('formatting', () => {
  it('gives small rates (yen, won, dong) more decimals', () => {
    expect(rateDecimals(1.37)).toBe(4)
    expect(rateDecimals(0.0091)).toBe(5)
    expect(rateDecimals(0.00005)).toBe(6)
    expect(formatRate(0.00005)).toBe('0.000050')
  })
  it('signs positive percentages', () => {
    expect(formatPct(1.234)).toBe('+1.23%')
    expect(formatPct(-0.5)).toBe('-0.50%')
  })
})

describe('extent', () => {
  it('finds the lowest and highest observation', () => {
    const e = extent(series)
    expect(e?.min.date).toBe('2026-11-05')
    expect(e?.max.date).toBe('2026-11-04')
    expect(extent([])).toBeNull()
  })
})
