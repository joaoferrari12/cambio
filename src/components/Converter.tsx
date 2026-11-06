import { useId, useState } from 'react'
import { convert, formatDate, formatMoney, formatRate, type Currency, type RatePoint } from '../lib/rates'

interface Props {
  currency: Currency
  latest: RatePoint | null
}

export function Converter({ currency, latest }: Props) {
  const [amount, setAmount] = useState('100')
  const [direction, setDirection] = useState<'fromCAD' | 'toCAD'>('fromCAD')
  const id = useId()

  const value = Number(amount.replace(',', '.'))
  const rate = latest?.rate ?? 0
  const result = convert(value, rate, direction)
  const from = direction === 'fromCAD' ? 'CAD' : currency.code
  const to = direction === 'fromCAD' ? currency.code : 'CAD'

  return (
    <section className="card converter" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`}>Convert</h2>
      <div className="conv-row">
        <div className="field">
          <label htmlFor={`${id}-amount`}>{from}</label>
          <input id={`${id}-amount`} inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} aria-describedby={`${id}-rate`} />
        </div>
        <button type="button" className="swap" onClick={() => setDirection(d => (d === 'fromCAD' ? 'toCAD' : 'fromCAD'))} aria-label={`Swap: convert ${to} to ${from}`}>
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 16V4m0 0L3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4" /></svg>
        </button>
        <div className="field">
          <span className="label">{to}</span>
          <output className="conv-out" htmlFor={`${id}-amount`} aria-live="polite">
            {latest ? formatMoney(result, to) : '—'}
          </output>
        </div>
      </div>
      <p id={`${id}-rate`} className="muted small">
        {latest
          ? `1 ${currency.code} = ${formatRate(rate)} CAD · 1 CAD = ${formatRate(convert(1, rate, 'fromCAD'))} ${currency.code} · Bank of Canada daily average, ${formatDate(latest.date)}`
          : 'Waiting for today’s rate…'}
      </p>
    </section>
  )
}
