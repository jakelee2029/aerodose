import { useState, useRef, useEffect } from 'react';
import { searchAirports } from '../data/airports.js';

export default function AirportSearch({ label, placeholder, value, onChange, id }) {
  const [query, setQuery] = useState(value ? `${value.iata} — ${value.city}` : '');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setFocused(false);
        if (!value) setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [value]);

  function handleInput(e) {
    const q = e.target.value;
    setQuery(q);
    const results = searchAirports(q);
    setSuggestions(results);
    setOpen(results.length > 0);
    if (!q) onChange(null);
  }

  function select(airport) {
    setQuery(`${airport.iata} — ${airport.city}`);
    setSuggestions([]);
    setOpen(false);
    onChange(airport);
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <label htmlFor={id} style={{
        display: 'block', fontSize: '0.82rem', fontWeight: 600,
        color: 'var(--accent-cyan)', marginBottom: '8px', letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}>{label}</label>
      <input
        id={id}
        className="input-field"
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleInput}
        onFocus={() => { setFocused(true); if (query) setSuggestions(searchAirports(query)); }}
        autoComplete="off"
        spellCheck={false}
        aria-label={label}
        aria-autocomplete="list"
        aria-expanded={open}
      />
      {open && suggestions.length > 0 && (
        <div role="listbox" style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
          background: 'rgba(10, 22, 40, 0.98)',
          border: '1px solid rgba(59,142,243,0.3)',
          borderRadius: '10px', zIndex: 50,
          overflow: 'hidden',
          boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
        }}>
          {suggestions.map(a => (
            <button
              key={a.iata}
              role="option"
              onClick={() => select(a)}
              style={{
                width: '100%', textAlign: 'left', padding: '12px 16px',
                background: 'transparent', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '12px',
                transition: 'background 0.15s', color: 'var(--text-primary)',
                fontFamily: 'inherit',
                borderBottom: '1px solid rgba(59,142,243,0.08)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,142,243,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{
                display: 'inline-block', minWidth: '44px',
                background: 'rgba(59,142,243,0.2)',
                borderRadius: '6px', padding: '2px 6px',
                fontSize: '0.82rem', fontWeight: 700,
                color: 'var(--accent-cyan)', letterSpacing: '0.04em',
              }}>{a.iata}</span>
              <span>
                <span style={{ fontWeight: 500 }}>{a.name}</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginLeft: '6px' }}>{a.city}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
