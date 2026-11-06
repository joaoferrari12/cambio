import type { RatePoint } from '../lib/rates'

/** A tiny inline line chart. Plain SVG: no library needed for 15 points. */
export function Sparkline({ points, up, width = 96, height = 32 }: { points: RatePoint[]; up: boolean; width?: number; height?: number }) {
  if (points.length < 2) return <svg width={width} height={height} aria-hidden="true" />
  const rates = points.map(p => p.rate)
  const min = Math.min(...rates)
  const max = Math.max(...rates)
  const span = max - min || 1
  const step = width / (points.length - 1)
  const d = rates
    .map((r, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${(height - 2 - ((r - min) / span) * (height - 4)).toFixed(1)}`)
    .join(' ')
  return (
    <svg className="spark" width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <path d={d} fill="none" stroke={up ? 'var(--up)' : 'var(--down)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
