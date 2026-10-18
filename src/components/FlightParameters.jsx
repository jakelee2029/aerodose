import { useEffect, useRef, useState } from 'react';
import { Play, Loader2 } from 'lucide-react';
import AirportField from './AirportField.jsx';
import { calculateFlightDose } from '../physics/calculator.js';
import { PRESETS } from '../data/presets.js';
import { useLiveF107, clampF107 } from '../hooks/useLiveF107.js';

// Cruise altitudes 25,000–45,000 ft in 1,000 ft steps
const ALT_OPTIONS = [];
for (let ft = 25000; ft <= 45000; ft += 1000) ALT_OPTIONS.push(ft);

// Pressure altitude in hPa from feet (ISA model)
function ftToHpa(altFt) {
  const altM = altFt * 0.3048;
  return +(1013.25 * Math.pow(1 - 0.0065 * altM / 288.15, 5.2561)).toFixed(1);
}

const SOLAR_OPTIONS = [
  { value: 75,  label: 'Solar minimum: most cosmic rays' },
  { value: 100, label: 'Early rising phase' },
  { value: 130, label: 'Rising phase' },
  { value: 150, label: 'Declining from maximum (now)' },
  { value: 175, label: 'Near maximum' },
  { value: 210, label: 'Solar maximum: fewest cosmic rays' },
];

function Group({ legend, children }) {
  return (
    <fieldset className="flex flex-col gap-3 border-0 p-0 min-w-0">
      <legend className="mb-3 text-base font-semibold text-fg">{legend}</legend>
      {children}
    </fieldset>
  );
}

function Readout({ label, value }) {
  return (
    <div className="text-center">
      <dt className="eyebrow">{label}</dt>
      <dd className="mono mt-0.5 text-sm font-semibold text-fg">{value}</dd>
    </div>
  );
}

export default function FlightParameters({ onResult, routeRequest }) {
  const [origin, setOrigin] = useState(null);
  const [dest, setDest] = useState(null);
  const [altFt, setAltFt] = useState(37000);
  const [solarChoice, setSolarChoice] = useState('live'); // 'live' or a fixed sfu value
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activePreset, setActivePreset] = useState(null);

  const live = useLiveF107();
  const liveOk = live.status === 'ready';
  // Falls back to 150 sfu if NOAA can't be reached
  const f107 = solarChoice === 'live' ? clampF107(liveOk ? live.data.flux : 150) : solarChoice;
  const solarSelectValue = solarChoice === 'live' && !liveOk ? 150 : solarChoice;

  const altKm = (altFt * 0.0003048).toFixed(2);
  const modulation = f107 <= 100 ? 'Max cosmic rays' : `−${(0.18 * (f107 - 70) / 150 * 100).toFixed(0)}% vs. minimum`;

  function loadPreset(p, idx) {
    setOrigin(p.origin); setDest(p.dest);
    setActivePreset(idx); setError(null);
  }

  async function runFlight(o, d, { scroll = true } = {}) {
    if (!o || !d) { setError('Choose an origin and a destination.'); return; }
    if (o.iata === d.iata) { setError('Origin and destination must be different.'); return; }
    setError(null); setLoading(true);
    try {
      await new Promise(r => setTimeout(r, scroll ? 300 : 0));
      const res = calculateFlightDose({ origin: o, destination: d, altFt, solarF10_7: f107 });
      onResult({ ...res, routeLabel: `${o.iata} → ${d.iata}` });
      if (scroll) setTimeout(() => document.getElementById('telemetry-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (e) { setError('Calculation error: ' + e.message); }
    finally { setLoading(false); }
  }

  // First visit: show a real example straight away so the results area is never empty.
  // Waits for the NOAA lookup to finish so the example uses the same solar value the form shows.
  const autoRan = useRef(false);
  useEffect(() => {
    if (autoRan.current || live.status === 'loading') return;
    autoRan.current = true;
    loadPreset(PRESETS[0], 0);
    runFlight(PRESETS[0].origin, PRESETS[0].dest, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live.status]);

  const handleExecute = () => runFlight(origin, dest);

  // A route chosen elsewhere on the page (e.g. "Flights from my area") loads and runs here
  useEffect(() => {
    if (!routeRequest) return;
    setOrigin(routeRequest.origin); setDest(routeRequest.dest); setActivePreset(null);
    runFlight(routeRequest.origin, routeRequest.dest);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeRequest]);

  return (
    <form className="flex flex-col gap-5 p-4" onSubmit={e => { e.preventDefault(); handleExecute(); }} noValidate>
      <h2 className="text-xl font-semibold text-fg">Flight plan</h2>

      <Group legend="Quick start">
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((p, i) => (
            <button key={p.label} type="button" onClick={() => loadPreset(p, i)}
              aria-pressed={activePreset === i}
              className="btn-ghost justify-center font-mono text-[0.8125rem]">
              {p.label}
            </button>
          ))}
        </div>
      </Group>

      <Group legend="Route">
        <AirportField key={`o-${origin?.iata ?? 'none'}`} id="origin-iata" label="From (airport code or city)" value={origin}
          onChange={v => { setOrigin(v); setActivePreset(null); }} />
        <AirportField key={`d-${dest?.iata ?? 'none'}`} id="dest-iata" label="To (airport code or city)" value={dest}
          onChange={v => { setDest(v); setActivePreset(null); }} />
      </Group>

      <details className="rounded-card border border-line bg-surface-1">
        <summary className="cursor-pointer list-none px-3 py-2.5 text-base font-semibold text-fg">
          Advanced options
          <span className="mt-0.5 block text-[0.8125rem] font-normal text-fg-soft">
            {altFt.toLocaleString('en-US')} ft · solar activity {f107} sfu{solarChoice === 'live' && liveOk ? ' (live)' : ''}
          </span>
        </summary>
        <div className="flex flex-col gap-5 px-3 pb-4 pt-2">
      <Group legend="Cruise altitude">
        <div>
          <label htmlFor="alt-select" className="field-label">Altitude</label>
          <select id="alt-select" className="field-select" value={altFt} onChange={e => setAltFt(+e.target.value)}>
            {ALT_OPTIONS.map(ft => <option key={ft} value={ft}>{ft.toLocaleString('en-US')} ft</option>)}
          </select>
        </div>
        <dl className="grid grid-cols-3 gap-2 rounded-ctl border border-line bg-canvas px-3 py-2.5">
          <Readout label="Feet" value={altFt.toLocaleString('en-US')} />
          <Readout label="Kilometers" value={altKm} />
          <Readout label="Pressure (hPa)" value={ftToHpa(altFt)} />
        </dl>
      </Group>

      <Group legend="Solar activity">
        <div>
          <label htmlFor="solar-select" className="field-label">Where the Sun is in its 11-year cycle</label>
          <select id="solar-select" className="field-select" value={solarSelectValue}
            onChange={e => setSolarChoice(e.target.value === 'live' ? 'live' : +e.target.value)}>
            {liveOk && <option value="live">Today's measurement: {live.data.flux} sfu (live, NOAA)</option>}
            {SOLAR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label} ({o.value} sfu)</option>)}
          </select>
          <p className="mt-1.5 text-[0.8125rem] text-fg-muted">
            {liveOk
              ? <>Live value from NOAA Space Weather Prediction Center, observed {new Date(live.data.observed + 'Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.</>
              : live.status === 'loading' ? 'Checking NOAA for today\'s value…' : 'Could not reach NOAA, using a typical value (150 sfu).'}
          </p>
        </div>
        <div className="rounded-ctl border border-line bg-canvas px-3 py-2.5">
          <div className="flex justify-between gap-2 text-[0.8125rem] text-fg-soft">
            <span>Cosmic-ray flux</span>
            <span className="mono text-fg">{modulation}</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2" role="presentation">
            <div className="h-full rounded-full bg-caution transition-[width] duration-300"
              style={{ width: `${Math.min(100, ((f107 - 70) / 150) * 100)}%` }} />
          </div>
          <div className="mt-1.5 flex justify-between text-xs text-fg-muted">
            <span>More cosmic rays</span><span>Fewer</span>
          </div>
        </div>
      </Group>
        </div>
      </details>

      {error && (
        <p role="alert" className="rounded-ctl border border-danger/50 bg-danger/10 px-3 py-2 text-sm text-danger-text">
          {error}
        </p>
      )}

      <button id="execute-btn" type="submit" className="btn-execute w-full" disabled={loading || !origin || !dest}>
        {loading
          ? <><Loader2 size={16} className="animate-spin" aria-hidden="true" /> Calculating…</>
          : <><Play size={16} aria-hidden="true" /> Calculate dose</>}
      </button>

      <p className="text-[0.8125rem] leading-relaxed text-fg-muted">
        Educational estimates from a simplified model calibrated to the FAA's published CARI-7 results (typical
        difference about 12%, individual flights up to about 35%). Not for regulatory dosimetry.
      </p>
    </form>
  );
}
