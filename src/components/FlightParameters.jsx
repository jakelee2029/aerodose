import { useState } from 'react';
import { Play, ChevronDown } from 'lucide-react';
import AirportField from './AirportField.jsx';
import { calculateFlightDose } from '../physics/calculator.js';

const PRESETS = [
  { label: 'JFK / LHR', origin: { iata:'JFK', name:'John F. Kennedy International', city:'New York, NY', lat:40.6413, lon:-73.7781, country:'USA' }, dest: { iata:'LHR', name:'London Heathrow', city:'London, UK', lat:51.4775, lon:-0.4614, country:'UK' } },
  { label: 'LAX / NRT', origin: { iata:'LAX', name:'Los Angeles International', city:'Los Angeles, CA', lat:33.9425, lon:-118.4081, country:'USA' }, dest: { iata:'NRT', name:'Narita International', city:'Tokyo', lat:35.7720, lon:140.3929, country:'Japan' } },
  { label: 'JFK / LAX', origin: { iata:'JFK', name:'John F. Kennedy International', city:'New York, NY', lat:40.6413, lon:-73.7781, country:'USA' }, dest: { iata:'LAX', name:'Los Angeles International', city:'Los Angeles, CA', lat:33.9425, lon:-118.4081, country:'USA' } },
  { label: 'ANC / FRA', origin: { iata:'ANC', name:'Ted Stevens Anchorage International', city:'Anchorage, AK', lat:61.1743, lon:-149.9963, country:'USA' }, dest: { iata:'FRA', name:'Frankfurt Airport', city:'Frankfurt', lat:50.0379, lon:8.5622, country:'Germany' } },
  { label: 'SYD / LAX', origin: { iata:'SYD', name:'Sydney Airport', city:'Sydney', lat:-33.9399, lon:151.1753, country:'Australia' }, dest: { iata:'LAX', name:'Los Angeles International', city:'Los Angeles, CA', lat:33.9425, lon:-118.4081, country:'USA' } },
  { label: 'DXB / JFK', origin: { iata:'DXB', name:'Dubai International', city:'Dubai', lat:25.2532, lon:55.3657, country:'UAE' }, dest: { iata:'JFK', name:'John F. Kennedy International', city:'New York, NY', lat:40.6413, lon:-73.7781, country:'USA' } },
];

// Flight levels FL250–FL450 step 10
const FL_OPTIONS = [];
for (let fl = 250; fl <= 450; fl += 10) FL_OPTIONS.push(fl);

// Pressure altitude in hPa from feet (ISA model)
function flToHpa(altFt) {
  const altM = altFt * 0.3048;
  return +(1013.25 * Math.pow(1 - 0.0065 * altM / 288.15, 5.2561)).toFixed(1);
}

export default function FlightParameters({ onResult }) {
  const [origin, setOrigin]   = useState(null);
  const [dest,   setDest]     = useState(null);
  const [altFt,  setAltFt]    = useState(37000);
  const [f107,   setF107]     = useState(150);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [activePreset, setActivePreset] = useState(null);

  const flNum = Math.round(altFt / 100);
  const altKm = (altFt * 0.0003048).toFixed(2);
  const altHpa = flToHpa(altFt);

  function loadPreset(p, idx) {
    setOrigin(p.origin); setDest(p.dest);
    setActivePreset(idx); setError(null);
  }

  async function handleExecute() {
    if (!origin || !dest) { setError('Origin and destination required.'); return; }
    if (origin.iata === dest.iata) { setError('Origin and destination must differ.'); return; }
    setError(null); setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 300));
      const res = calculateFlightDose({ origin, destination: dest, altFt, solarF10_7: f107 });
      onResult(res);
      setTimeout(() => document.getElementById('telemetry-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (e) { setError('Engine error: ' + e.message); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* Section: Preset Flight Profiles */}
      <fieldset style={{ border: 'none' }}>
        <legend className="section-label">Preset Flight Profiles</legend>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
          {PRESETS.map((p, i) => (
            <button key={p.label} onClick={() => loadPreset(p, i)}
              className="btn-ghost"
              style={{
                justifyContent: 'center', fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)', letterSpacing: '0.03em',
                ...(activePreset === i ? { borderColor: 'var(--accent-blue)', color: 'var(--accent-blue)', background: 'rgba(56,189,248,0.07)' } : {})
              }}
            >{p.label}</button>
          ))}
        </div>
      </fieldset>

      <div className="divider" />

      {/* Section: Flight Plan */}
      <fieldset style={{ border: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <legend className="section-label">Flight Plan</legend>

        <AirportField id="origin-iata" label="Origin (IATA / City)" value={origin} onChange={v => { setOrigin(v); setActivePreset(null); }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>GC ROUTE</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
        </div>

        <AirportField id="dest-iata" label="Destination (IATA / City)" value={dest} onChange={v => { setDest(v); setActivePreset(null); }} />
      </fieldset>

      <div className="divider" />

      {/* Section: Altitude Profile */}
      <fieldset style={{ border: 'none' }}>
        <legend className="section-label">Cruise Altitude Profile</legend>

        <label htmlFor="fl-select" className="field-label">Flight Level</label>
        <select id="fl-select" className="field-select" value={altFt}
          onChange={e => setAltFt(+e.target.value)}
          style={{ marginBottom: '8px' }}
        >
          {FL_OPTIONS.map(fl => (
            <option key={fl} value={fl * 100}>FL{fl}</option>
          ))}
        </select>

        {/* Dual-unit display */}
        <div className="panel-inset" style={{ padding: '8px 10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {[
              { lbl: 'FL', val: `FL${flNum}` },
              { lbl: 'km MSL', val: `${altKm} km` },
              { lbl: 'hPa (ISA)', val: `${altHpa} hPa` },
            ].map(({ lbl, val }) => (
              <div key={lbl} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>{lbl}</div>
                <div className="mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      </fieldset>

      <div className="divider" />

      {/* Section: Solar Epoch */}
      <fieldset style={{ border: 'none' }}>
        <legend className="section-label">Solar Epoch Parameters</legend>

        <label htmlFor="f107-select" className="field-label">
          10.7 cm Solar Flux (F10.7) — sfu
        </label>
        <select id="f107-select" className="field-select" value={f107}
          onChange={e => setF107(+e.target.value)}
          style={{ marginBottom: '8px' }}
        >
          <option value={75}>75 sfu — Solar Minimum (max GCR)</option>
          <option value={100}>100 sfu — Early Rising Phase</option>
          <option value={130}>130 sfu — Rising Phase</option>
          <option value={150}>150 sfu — Post-Maximum / Declining (SC25, 2026)</option>
          <option value={175}>175 sfu — Near-Maximum</option>
          <option value={210}>210 sfu — Solar Maximum (min GCR)</option>
        </select>

        <div className="panel-inset" style={{ padding: '8px 10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', marginBottom: '5px', color: 'var(--text-muted)' }}>
            <span>GCR Flux Modulation</span>
            <span className="mono" style={{ color: 'var(--text-secondary)' }}>
              {f107 <= 100 ? '+0% (max flux)' : `−${(0.18 * (f107 - 70) / 150 * 100).toFixed(0)}% vs min`}
            </span>
          </div>
          <div style={{ height: '4px', background: 'var(--surface-inset)', borderRadius: '2px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
            <div style={{
              height: '100%', background: 'var(--accent-amber)',
              width: `${Math.min(100, ((f107 - 70) / 150) * 100)}%`,
              borderRadius: '2px', transition: 'width 0.3s',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '3px' }}>
            <span>Min (high GCR)</span><span>Max (low GCR)</span>
          </div>
        </div>
      </fieldset>

      <div className="divider" />

      {/* Error */}
      {error && (
        <div style={{
          padding: '8px 10px', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 'var(--radius)', background: 'rgba(239,68,68,0.07)',
          fontSize: '0.75rem', color: '#FCA5A5', fontFamily: 'var(--font-mono)',
        }}>{error}</div>
      )}

      {/* Execute */}
      <button id="execute-btn" className="btn-execute" style={{ width: '100%' }}
        onClick={handleExecute} disabled={loading || !origin || !dest}
      >
        {loading
          ? <><span style={{ animation: 'spin 0.8s linear infinite', display: 'inline-block' }}>⟳</span> COMPUTING...</>
          : <><Play size={13} strokeWidth={2} /> RUN PROFILE</>
        }
      </button>

      {/* Model provenance footer */}
      <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', lineHeight: 1.5, fontFamily: 'var(--font-ui)' }}>
        Model: Analytical parameterization of FAA CARI-7 (±15%). Sources: ICRP 132 (2016),
        Lindborg et al. (2004) RPD 110:417, NOAA WMM-2020. Not for regulatory dosimetry.
      </div>
    </div>
  );
}
