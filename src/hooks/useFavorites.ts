import { useCallback, useEffect, useState } from 'react'

const KEY = 'cambio.favorites'
export const DEFAULT_FAVORITES = ['BRL', 'USD', 'EUR', 'GBP']

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT_FAVORITES
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed.filter(x => typeof x === 'string') : DEFAULT_FAVORITES
  } catch {
    return DEFAULT_FAVORITES
  }
}

/** The currencies shown as cards, kept in localStorage. Falls back to the defaults when storage is unavailable. */
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(read)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(favorites)) } catch { /* private mode: keep in memory */ }
  }, [favorites])

  const toggle = useCallback((code: string) => {
    setFavorites(list => (list.includes(code) ? list.filter(c => c !== code) : [...list, code]))
  }, [])

  return { favorites, toggle }
}
