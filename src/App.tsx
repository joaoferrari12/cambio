import { useEffect, useMemo, useState } from 'react'
import { CURRENCIES } from './api/boc'
import { Converter } from './components/Converter'
import { CurrencyPicker } from './components/CurrencyPicker'
import { RateCard, RateCardSkeleton } from './components/RateCard'
import { RateChart } from './components/RateChart'
import { useFavorites } from './hooks/useFavorites'
import { useHistory, useLatestRates } from './hooks/useRates'
import { formatDate, summarize, type Range } from './lib/rates'

export default function App() {
  const { favorites, toggle } = useFavorites()
  const [selected, setSelected] = useState(favorites[0] ?? 'BRL')
  const [range, setRange] = useState<Range>('3M')

  // If the selected currency is removed from the favourites, fall back to the first one left.
  useEffect(() => {
    if (!favorites.includes(selected) && favorites.length > 0) setSelected(favorites[0])
  }, [favorites, selected])

  const latest = useLatestRates(favorites)
  const history = useHistory(selected, range)
  const currency = useMemo(() => CURRENCIES.find(c => c.code === selected) ?? CURRENCIES[0], [selected])
  const selectedSummary = summarize(latest.data?.[selected] ?? [])
  const asOf = selectedSummary.latest?.date

  return (
    <div className="app">
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <div className="wrap bar">
          <a className="brand" href="./" aria-label="Câmbio, home">
            <span className="brand-mark" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21l5-7 4 4 7-9" /></svg>
            </span>
            Câmbio
          </a>
          <p className="tagline">Canadian dollar rates, straight from the Bank of Canada{asOf ? ` · ${formatDate(asOf)}` : ''}</p>
        </div>
      </header>

      <main id="main" className="wrap">
        <section className="hero">
          <h1>What is the dollar worth today?</h1>
          <p className="lead">Daily average rates for 26 currencies against the Canadian dollar, with history back to 2017 and a converter. No account, no key, no ads.</p>
        </section>

        <section aria-labelledby="cards-title" className="cards-section">
          <div className="section-head">
            <h2 id="cards-title">Your currencies</h2>
            <CurrencyPicker favorites={favorites} onToggle={toggle} />
          </div>
          {latest.isError ? (
            <div className="state" role="alert">
              <p>Could not reach the Bank of Canada. {(latest.error as Error).message}</p>
              <button type="button" className="btn" onClick={() => latest.refetch()}>Try again</button>
            </div>
          ) : (
            <ul className="rate-grid">
              {latest.isPending
                ? favorites.map(code => <RateCardSkeleton key={code} />)
                : favorites.map(code => {
                    const c = CURRENCIES.find(x => x.code === code)
                    return c ? <RateCard key={code} currency={c} points={latest.data?.[code] ?? []} selected={code === selected} onSelect={setSelected} /> : null
                  })}
            </ul>
          )}
        </section>

        <div className="two-col">
          <RateChart
            currency={currency}
            range={range}
            onRange={setRange}
            points={history.data}
            loading={history.isPending}
            error={history.error as Error | null}
            onRetry={() => history.refetch()}
          />
          <Converter currency={currency} latest={selectedSummary.latest} />
        </div>
      </main>

      <footer className="site-footer">
        <div className="wrap foot">
          <p>Rates are the Bank of Canada’s daily average, published once per business day around 16:30 ET, under the <a href="https://www.bankofcanada.ca/terms/">Bank’s terms of use</a>. Indicative only, not for transactions.</p>
          <p>Built with React 19, TanStack Query and Recharts by <a href="https://github.com/joaoferrari12/cambio">Joao Victor Ferrari</a> · source on GitHub</p>
        </div>
      </footer>
    </div>
  )
}
