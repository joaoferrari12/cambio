import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { extent, formatDate, formatPct, formatRate, RANGES, type Currency, type Range, type RatePoint } from '../lib/rates'

interface Props {
  currency: Currency
  range: Range
  onRange: (r: Range) => void
  points: RatePoint[] | undefined
  loading: boolean
  error: Error | null
  onRetry: () => void
}

export function RateChart({ currency, range, onRange, points, loading, error, onRetry }: Props) {
  const ext = points ? extent(points) : null
  const first = points?.[0]
  const last = points?.[points.length - 1]
  const periodPct = first && last && first.rate ? ((last.rate - first.rate) / first.rate) * 100 : 0
  const up = periodPct >= 0

  return (
    <section className="card chart-card" aria-labelledby="chart-title">
      <div className="chart-head">
        <div>
          <h2 id="chart-title"><span aria-hidden="true">{currency.flag}</span> {currency.code} to CAD</h2>
          <p className="muted">{currency.name} · 1 {currency.code} in Canadian dollars</p>
        </div>
        <div className="chips" role="group" aria-label="Range">
          {RANGES.map(r => (
            <button key={r} type="button" className={`chip${r === range ? ' is-on' : ''}`} aria-pressed={r === range} onClick={() => onRange(r)}>{r}</button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="state" role="alert">
          <p>Could not load the history for {currency.code}.</p>
          <button type="button" className="btn" onClick={onRetry}>Try again</button>
        </div>
      ) : loading || !points ? (
        <div className="chart-skeleton sk" aria-busy="true" aria-label="Loading chart" />
      ) : points.length === 0 ? (
        <div className="state"><p>No observations in this range.</p></div>
      ) : (
        <>
          <p className="chart-summary">
            <span className={`delta big ${up ? 'is-up' : 'is-down'}`}>{formatPct(periodPct)}</span>
            <span className="muted">over {range === '1M' ? 'one month' : range === '3M' ? 'three months' : range === '1Y' ? 'one year' : 'five years'} · low {formatRate(ext!.min.rate)} on {formatDate(ext!.min.date)} · high {formatRate(ext!.max.rate)} on {formatDate(ext!.max.date)}</span>
          </p>
          <div className="chart-box" role="img" aria-label={`Line chart of ${currency.code} to CAD, ${points.length} business days, from ${formatRate(first!.rate)} to ${formatRate(last!.rate)}`}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={up ? 'var(--up)' : 'var(--down)'} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={up ? 'var(--up)' : 'var(--down)'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="date" tickFormatter={d => formatDate(d, range === '5Y' || range === '1Y' ? { month: 'short', year: '2-digit' } : { month: 'short', day: 'numeric' })} tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false} minTickGap={32} />
                <YAxis domain={['auto', 'auto']} tickFormatter={v => formatRate(Number(v))} tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false} width={72} />
                <Tooltip
                  formatter={(v: unknown) => [`${formatRate(Number(v))} CAD`, `1 ${currency.code}`]}
                  labelFormatter={(d: unknown) => formatDate(String(d))}
                  contentStyle={{ borderRadius: 10, border: '1px solid var(--line)', fontSize: 13 }}
                />
                <Area type="monotone" dataKey="rate" stroke={up ? 'var(--up)' : 'var(--down)'} strokeWidth={2} fill="url(#fill)" dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </section>
  )
}
