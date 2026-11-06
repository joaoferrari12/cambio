import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

/** A fake Valet API: every series gets the same three-day history, scaled per currency. */
function fakeValet(url: string) {
  const series = url.match(/observations\/([^/]+)\/json/)![1].split(',')
  const base: Record<string, number> = { FXBRLCAD: 0.26, FXUSDCAD: 1.37, FXEURCAD: 1.5, FXGBPCAD: 1.75 }
  const days = ['2026-11-03', '2026-11-04', '2026-11-05']
  const observations = days.map((d, i) => ({
    d,
    ...Object.fromEntries(series.map(s => [s, { v: String((base[s] ?? 1) * (1 + i * 0.01)) }])),
  }))
  return { ok: true, status: 200, json: async () => ({ observations }) } as Response
}

function renderApp() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <App />
    </QueryClientProvider>,
  )
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL) => Promise.resolve(fakeValet(String(input)))))
    // Recharts measures its container; jsdom has no layout, so give it a size.
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ width: 800, height: 300, top: 0, left: 0, bottom: 300, right: 800, x: 0, y: 0, toJSON: () => ({}) })
  })
  afterEach(() => vi.restoreAllMocks())

  it('shows a card per default favourite with the latest rate and the day change', async () => {
    renderApp()
    const brl = await screen.findByRole('button', { name: /Brazilian real/ })
    expect(brl).toHaveAccessibleName(/1 BRL = 0\.2652 CAD, \+0\.99% since previous day/)
    expect(screen.getAllByRole('button', { name: /since previous day/ })).toHaveLength(4)
  })

  it('never sends a key or credential to the Bank of Canada', async () => {
    renderApp()
    await screen.findByRole('button', { name: /Brazilian real/ })
    const calls = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.map(c => String(c[0]))
    expect(calls.length).toBeGreaterThan(0)
    for (const url of calls) {
      expect(url).toMatch(/^https:\/\/www\.bankofcanada\.ca\/valet\//)
      expect(url).not.toMatch(/key|token|secret/i)
    }
  })

  it('converts CAD to the selected currency and swaps direction', async () => {
    const user = userEvent.setup()
    renderApp()
    await screen.findByRole('button', { name: /Brazilian real/ })
    const amount = screen.getByLabelText('CAD')
    await user.clear(amount)
    await user.type(amount, '26.52')
    // 26.52 CAD / 0.2652 = 100 BRL
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/100\.00/))
    await user.click(screen.getByRole('button', { name: /Swap/ }))
    expect(screen.getByLabelText('BRL')).toBeInTheDocument()
  })

  it('lets the viewer add a currency and remembers it', async () => {
    const user = userEvent.setup()
    renderApp()
    await screen.findByRole('button', { name: /Brazilian real/ })
    await user.click(screen.getByRole('button', { name: /Currencies/ }))
    await user.click(screen.getByRole('checkbox', { name: /JPY/ }))
    expect(JSON.parse(localStorage.getItem('cambio.favorites')!)).toContain('JPY')
    await screen.findByRole('button', { name: /Japanese yen/ })
  })
})
