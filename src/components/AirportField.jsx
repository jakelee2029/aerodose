import { useState, useRef, useEffect } from 'react';
import { searchAirports } from '../data/airports.js';

export default function AirportField({ id, label, value, onChange }) {
  const [query, setQuery] = useState(value ? `${value.iata}` : '');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  function handleInput(e) {
    const q = e.target.value.toUpperCase();
    setQuery(q);
    const res = searchAirports(q);
    setSuggestions(res);
    setOpen(res.length > 0);
    if (!q) onChange(null);
  }

  function select(airport) {
    setQuery(airport.iata);
    setSuggestions([]); setOpen(false);
    onChange(airport);
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <label htmlFor={id} className="field-label">{label}</label>
      <input
        id={id} className="field-input mono" type="text"
        placeholder="IATA / city"
        value={query} onChange={handleInput}
        onFocus={() => { if (query) { const r = searchAirports(query); setSuggestions(r); setOpen(r.length > 0); } }}
        autoComplete="off" spellCheck={false} maxLength={24}
        style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}
        aria-label={label} aria-autocomplete="list" aria-expanded={open}
      />
      {/* Metadata under input */}
      {value && (
        <div style={{
          marginTop: '6px', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4,
        }}>
          {value.name}, {value.country}
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}> · {value.lat.toFixed(2)}°, {value.lon.toFixed(2)}°</span>
        </div>
      )}
      {open && suggestions.length > 0 && (
        <div role="listbox" style={{
          position: 'absolute', top: 'calc(100% + 2px)', left: 0, right: 0, zIndex: 300,
          background: 'var(--surface-base)', border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius)', overflow: 'hidden',
          boxShadow: 'var(--shadow-popover)',
        }}>
          {suggestions.map(a => (
            <button key={a.iata} role="option" onClick={() => select(a)} style={{
              width: '100%', textAlign: 'left', padding: '8px 10px',
              background: 'transparent', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              borderBottom: '1px solid var(--border-subtle)',
              transition: 'background 0.1s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{
                fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.82rem',
                color: 'var(--accent-blue-text)', minWidth: '38px', letterSpacing: '0.04em',
              }}>{a.iata}</span>
              <span>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontFamily: 'var(--font-ui)' }}>{a.name}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                  {a.city}
                </div>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
