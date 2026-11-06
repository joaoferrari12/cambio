/**
 * Bank of Canada Valet API client.
 * Docs: https://www.bankofcanada.ca/valet/docs
 * Public, no key, CORS enabled. Series FX<CODE>CAD = Canadian dollars per one unit of <CODE>,
 * one observation per business day.
 */
import type { Currency, RatePoint } from '../lib/rates'

export const BOC_BASE = 'https://www.bankofcanada.ca/valet'

/** The daily series the Bank publishes, with display names. Order is the default card order. */
export const CURRENCIES: Currency[] = [
  { code: 'BRL', name: 'Brazilian real', flag: '🇧🇷' },
  { code: 'USD', name: 'US dollar', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'British pound', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese yen', flag: '🇯🇵' },
  { code: 'MXN', name: 'Mexican peso', flag: '🇲🇽' },
  { code: 'AUD', name: 'Australian dollar', flag: '🇦🇺' },
  { code: 'CHF', name: 'Swiss franc', flag: '🇨🇭' },
  { code: 'CNY', name: 'Chinese renminbi', flag: '🇨🇳' },
  { code: 'INR', name: 'Indian rupee', flag: '🇮🇳' },
  { code: 'KRW', name: 'South Korean won', flag: '🇰🇷' },
  { code: 'HKD', name: 'Hong Kong dollar', flag: '🇭🇰' },
  { code: 'SGD', name: 'Singapore dollar', flag: '🇸🇬' },
  { code: 'NZD', name: 'New Zealand dollar', flag: '🇳🇿' },
  { code: 'SEK', name: 'Swedish krona', flag: '🇸🇪' },
  { code: 'NOK', name: 'Norwegian krone', flag: '🇳🇴' },
  { code: 'PLN', name: 'Polish zloty', flag: '🇵🇱' },
  { code: 'TRY', name: 'Turkish lira', flag: '🇹🇷' },
  { code: 'ZAR', name: 'South African rand', flag: '🇿🇦' },
  { code: 'PEN', name: 'Peruvian sol', flag: '🇵🇪' },
  { code: 'SAR', name: 'Saudi riyal', flag: '🇸🇦' },
  { code: 'THB', name: 'Thai baht', flag: '🇹🇭' },
  { code: 'TWD', name: 'Taiwanese dollar', flag: '🇹🇼' },
  { code: 'IDR', name: 'Indonesian rupiah', flag: '🇮🇩' },
  { code: 'MYR', name: 'Malaysian ringgit', flag: '🇲🇾' },
  { code: 'VND', name: 'Vietnamese dong', flag: '🇻🇳' },
]

export const seriesId = (code: string) => `FX${code}CAD`

interface ValetResponse {
  observations: Array<{ d: string } & Record<string, { v: string } | undefined>>
}

/** Raw observations for several currencies, oldest first, as the API returns them. */
export async function fetchObservations(
  codes: string[],
  params: { recent?: number; start_date?: string },
  signal?: AbortSignal,
): Promise<Record<string, RatePoint[]>> {
  const series = codes.map(seriesId).join(',')
  const query = new URLSearchParams()
  if (params.recent) query.set('recent', String(params.recent))
  if (params.start_date) query.set('start_date', params.start_date)
  const url = `${BOC_BASE}/observations/${series}/json?${query}`

  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`Bank of Canada API answered ${res.status}`)
  const data = (await res.json()) as ValetResponse

  const out: Record<string, RatePoint[]> = Object.fromEntries(codes.map(c => [c, []]))
  for (const obs of data.observations) {
    for (const code of codes) {
      const cell = obs[seriesId(code)]
      if (cell?.v) out[code].push({ date: obs.d, rate: Number(cell.v) })
    }
  }
  return out
}
