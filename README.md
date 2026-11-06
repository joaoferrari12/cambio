# Câmbio

[![CI](https://github.com/joaoferrari12/cambio/actions/workflows/ci.yml/badge.svg)](https://github.com/joaoferrari12/cambio/actions/workflows/ci.yml)

**What is the Canadian dollar worth today?** A React 19 app that shows the Bank
of Canada's daily exchange rates for 26 currencies: rate cards with the
day-over-day change and a sparkline, a history chart (1 month to 5 years), a
converter in both directions, and a list of favourite currencies that survives
a reload. Built by a Brazilian in Vancouver who checks BRL/CAD more often than
he would like to admit.

> **Live:** **https://joaoferrari12.github.io/cambio/**

## What it demonstrates

- **React 19 with a real data layer**: TanStack Query owns fetching, caching
  (rates change once a business day, so `staleTime` is 30 minutes), retries,
  request cancellation through `AbortSignal`, and per-range cache keys so
  switching between 1M/3M/1Y/5Y is instant after the first load.
- **A public API, used properly**: the Bank of Canada Valet API needs no key
  and allows CORS, so the browser talks to it directly. Every URL the app
  builds is asserted in a test to stay on `bankofcanada.ca` and to carry no
  credential.
- **Pure logic, separately tested**: day-over-day change, conversion in both
  directions, range start dates, decimals that adapt to the size of the rate
  (yen and dong get six), min/max of a series. 9 unit tests, no DOM.
- **Component tests with a fake API**: 4 tests render the whole app against a
  stubbed `fetch`, exercise the converter, the swap button and the currency
  picker, and check accessible names rather than CSS classes.
- **Accessibility**: skip link, landmarks, `aria-pressed` on toggles, the
  chart exposed as an image with a text description, live regions on results,
  visible focus, 4.5:1 contrast, reduced motion respected. axe-core: 0
  violations at desktop and phone widths.
- **Performance**: Recharts is split into its own chunk (109 kB gzip) so the
  cards paint before the chart library arrives; the app chunk is 80 kB gzip.
- **Shipping**: CI (type-check, tests, build) and GitHub Pages deploy on every
  push to `main`, through GitHub Actions.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npx vitest run     # tests
npm run build      # production build into dist/
```

No configuration or secret is needed.

## Structure

```
src/api/boc.ts            Valet API client and the currency catalogue
src/lib/rates.ts          pure functions: summarize, convert, ranges, formatting (+ tests)
src/hooks/useRates.ts     TanStack Query hooks: latest rates, history per range
src/hooks/useFavorites.ts favourites in localStorage, with a safe fallback
src/components/           RateCard, RateChart (Recharts), Converter, CurrencyPicker, Sparkline
src/App.tsx               page composition and state (+ component tests)
```

## Data

Rates are the Bank of Canada's daily average, published once per business day
around 16:30 ET, series `FX<CODE>CAD` (Canadian dollars per unit of foreign
currency), available since 2017 under the
[Bank's terms of use](https://www.bankofcanada.ca/terms/). They are indicative
and not for transactions.

## License

MIT
