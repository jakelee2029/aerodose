import { useState, useEffect } from 'react';
import AirportSearch from './AirportSearch.jsx';
import { calculateFlightDose } from '../physics/calculator.js';

const PRESETS = [
  { label: 'JFK → LHR', origin: { iata:'JFK', name:'John F. Kennedy International', city:'New York, NY', lat:40.6413, lon:-73.7781 }, dest: { iata:'LHR', name:'London Heathrow', city:'London, UK', lat:51.4775, lon:-0.4614 } },
  { label: 'LAX → NRT', origin: { iata:'LAX', name:'Los Angeles International', city:'Los Angeles, CA', lat:33.9425, lon:-118.4081 }, dest: { iata:'NRT', name:'Narita International', city:'Tokyo', lat:35.7720, lon:140.3929 } },
  { label: 'JFK → LAX', origin: { iata:'JFK', name:'John F. Kennedy International', city:'New York, NY', lat:40.6413, lon:-73.7781 }, dest: { iata:'LAX', name:'Los Angeles International', city:'Los Angeles, CA', lat:33.9425, lon:-118.4081 } },
  { label: 'ANC → FRA', origin: { iata:'ANC', name:'Ted Stevens Anchorage International', city:'Anchorage, AK', lat:61.1743, lon:-149.9963 }, dest: { iata:'FRA', name:'Frankfurt Airport', city:'Frankfurt', lat:50.0379, lon:8.5622 } },
  { label: 'SYD → LAX', origin: { iata:'SYD', name:'Sydney Airport', city:'Sydney', lat:-33.9399, lon:151.1753 }, dest: { iata:'LAX', name:'Los Angeles International', city:'Los Angeles, CA', lat:33.9425, lon:-118.4081 } },
];

function useIsMobile() {
  const [mobile, setMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 600);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 600);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return mobile;
}

export default function RouteInput({ onResult }) {
  const [origin, setOrigin] = useState(null);
  const [dest, setDest] = useState(null);
  const [altFt, setAltFt] = useState(37000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMobile = useIsMobile();

  function loadPreset(p) {
    setOrigin(p.origin);
    setDest(p.dest);
    setError(null);
  }

  async function handleCalculate() {
    if (!origin || !dest) { setError('Please select both origin and destination airports.'); return; }
    if (origin.iata === dest.iata) { setError('Origin and destination must be different.'); return; }
    setError(null);
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 400));
      const res = calculateFlightDose({ origin, destination: dest, altFt, solarF10_7: 150 });
      onResult(res);
      setTimeout(() => document.getElementById('results-panel')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (e) {
      setError('Calculation error: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ marginBottom: '48px' }}>
      {/* Preset buttons — flex-wrap centered, flows naturally on any width */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '28px', justifyContent: 'center' }}>
        {PRESETS.map(p => (
          <button key={p.label} onClick={() => loadPreset(p)}
            id={`preset-${p.label.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`}
            style={{
              padding: '7px 14px', borderRadius: '8px',
              background: 'rgba(59,142,243,0.1)', border: '1px solid rgba(59,142,243,0.22)',
              color: 'var(--text-secondary)', cursor: 'pointer',
              fontSize: isMobile ? '0.8rem' : '0.85rem', fontFamily: 'inherit', fontWeight: 500,
              transition: 'all 0.15s', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,142,243,0.22)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,142,243,0.1)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >{p.label}</button>
        ))}
      </div>

      <div className="glass-card" style={{ padding: isMobile ? '20px' : '32px' }}>
        {/* FIX 1: Airport input row — stack vertically on mobile */}
        {isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <AirportSearch id="origin-search" label="From" placeholder="JFK, New York, London..." value={origin} onChange={setOrigin} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'rgba(59,142,243,0.15)', border: '1px solid rgba(59,142,243,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem', color: 'var(--accent-cyan)', flexShrink: 0,
              }}>↓</div>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
            </div>
            <AirportSearch id="dest-search" label="To" placeholder="LHR, Tokyo, Sydney..." value={dest} onChange={setDest} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'end', marginBottom: '24px' }}>
            <AirportSearch id="origin-search" label="From" placeholder="JFK, New York, London..." value={origin} onChange={setOrigin} />
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '44px', height: '44px', borderRadius: '50%',
              background: 'rgba(59,142,243,0.15)', border: '1px solid rgba(59,142,243,0.25)',
              fontSize: '1.2rem', color: 'var(--accent-cyan)', marginBottom: '4px', flexShrink: 0,
            }}>→</div>
            <AirportSearch id="dest-search" label="To" placeholder="LHR, Tokyo, Sydney..." value={dest} onChange={setDest} />
          </div>
        )}

        {/* FIX 2: Altitude + Solar card — stack on mobile */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: '16px', marginBottom: '28px',
        }}>
          <div>
            <label htmlFor="alt-slider" style={{
              display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px',
              fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent-cyan)',
              marginBottom: '8px', letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              <span>Cruise Altitude</span>
              <span style={{ color: 'var(--text-primary)' }}>FL{Math.round(altFt/100)} ({(altFt * 0.0003048).toFixed(1)} km)</span>
            </label>
            <input id="alt-slider" type="range" min={25000} max={45000} step={1000} value={altFt}
              onChange={e => setAltFt(+e.target.value)}
              style={{ width: '100%', accentColor: 'var(--accent-blue)', cursor: 'pointer' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              <span>FL250</span><span>FL350</span><span>FL450</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <div className="glass-card" style={{
              padding: '12px 14px', fontSize: '0.8rem', color: 'var(--text-secondary)',
              display: 'flex', alignItems: 'flex-start', gap: '8px',
            }}>
              <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: '1px' }}>☀</span>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px', fontSize: '0.82rem' }}>
                  Solar Cycle 25 — Declining Phase
                </div>
                <div style={{ lineHeight: 1.45 }}>F10.7 ≈ 150 sfu (late 2026) — slightly higher GCR flux than peak</div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(244,67,54,0.1)', border: '1px solid rgba(244,67,54,0.3)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#ef9a9a', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <button id="calculate-btn" className="btn-primary" style={{ width: '100%' }} onClick={handleCalculate} disabled={loading || !origin || !dest}>
          {loading ? (
            <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', fontSize: '1.1rem' }}>⟳</span> Calculating...</>
          ) : (
            <><span>⚡</span> Calculate Radiation Dose</>
          )}
        </button>
      </div>
    </section>
  );
}
