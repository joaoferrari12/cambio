import { formatPct, formatRate, summarize, type Currency, type RatePoint } from '../lib/rates'
import { Sparkline } from './Sparkline'

interface Props {
  currency: Currency
  points: RatePoint[]
  selected: boolean
  onSelect: (code: string) => void
}

export function RateCard({ currency, points, selected, onSelect }: Props) {
  const s = summarize(points)
  const up = s.change >= 0
  if (!s.latest) {
    return (
      <li className="card rate-card is-empty">
        <span className="rate-code">{currency.flag} {currency.code}</span>
        <span className="muted">No data</span>
      </li>
    )
  }
  return (
    <li>
      <button
        type="button"
        className={`card rate-card${selected ? ' is-selected' : ''}`}
        onClick={() => onSelect(currency.code)}
        aria-pressed={selected}
        aria-label={`${currency.name}: 1 ${currency.code} = ${formatRate(s.latest.rate)} CAD, ${formatPct(s.changePct)} since previous day`}
      >
        <span className="rate-head">
          <span className="rate-code"><span aria-hidden="true">{currency.flag}</span> {currency.code}</span>
          <span className="rate-name">{currency.name}</span>
        </span>
        <span className="rate-value">
          <span className="rate-num">{formatRate(s.latest.rate)}</span>
          <span className="rate-unit">CAD</span>
        </span>
        <span className="rate-foot">
          <span className={`delta ${up ? 'is-up' : 'is-down'}`}>{up ? '▲' : '▼'} {formatPct(s.changePct)}</span>
          <Sparkline points={points} up={up} />
        </span>
      </button>
    </li>
  )
}

export function RateCardSkeleton() {
  return (
    <li className="card rate-card skeleton" aria-hidden="true">
      <span className="sk sk-line" style={{ width: '40%' }} />
      <span className="sk sk-line" style={{ width: '70%', height: 28 }} />
      <span className="sk sk-line" style={{ width: '55%' }} />
    </li>
  )
}
