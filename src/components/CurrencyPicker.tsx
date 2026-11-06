import { useId, useState } from 'react'
import { CURRENCIES } from '../api/boc'

interface Props {
  favorites: string[]
  onToggle: (code: string) => void
}

/** Choose which currencies appear as cards. A disclosure with checkboxes; no custom widget needed. */
export function CurrencyPicker({ favorites, onToggle }: Props) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const id = useId()
  const list = CURRENCIES.filter(c => `${c.code} ${c.name}`.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="picker">
      <button type="button" className="btn btn-ghost" aria-expanded={open} aria-controls={`${id}-panel`} onClick={() => setOpen(o => !o)}>
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        Currencies ({favorites.length})
      </button>
      {open && (
        <div id={`${id}-panel`} className="card picker-panel">
          <div className="field">
            <label htmlFor={`${id}-q`}>Search</label>
            <input id={`${id}-q`} type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="real, yen, euro…" />
          </div>
          <ul className="picker-list">
            {list.map(c => (
              <li key={c.code}>
                <label className="check">
                  <input type="checkbox" checked={favorites.includes(c.code)} onChange={() => onToggle(c.code)} disabled={favorites.length === 1 && favorites.includes(c.code)} />
                  <span aria-hidden="true">{c.flag}</span> <strong>{c.code}</strong> <span className="muted">{c.name}</span>
                </label>
              </li>
            ))}
            {list.length === 0 && <li className="muted">No currency matches “{q}”.</li>}
          </ul>
        </div>
      )}
    </div>
  )
}
