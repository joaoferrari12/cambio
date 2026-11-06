import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchObservations } from './boc'

describe('fetchObservations', () => {
  afterEach(() => vi.restoreAllMocks())

  it('returns oldest first even when the API answers newest first (recent=N does)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true, status: 200,
      json: async () => ({ observations: [
        { d: '2026-11-05', FXUSDCAD: { v: '1.3989' } },
        { d: '2026-11-04', FXUSDCAD: { v: '1.3961' } },
        { d: '2026-11-03', FXUSDCAD: { v: '1.3994' } },
      ] }),
    })))
    const out = await fetchObservations(['USD'], { recent: 3 })
    expect(out.USD.map(p => p.date)).toEqual(['2026-11-03', '2026-11-04', '2026-11-05'])
    expect(out.USD[2].rate).toBe(1.3989)
  })

  it('throws on a non-2xx answer instead of returning an empty series', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 503, json: async () => ({}) })))
    await expect(fetchObservations(['USD'], { recent: 1 })).rejects.toThrow('503')
  })
})