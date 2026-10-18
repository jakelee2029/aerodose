import { useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';
import AirportField from './AirportField.jsx';
import { calculateFlightDose } from '../physics/calculator.js';
import { getAirport } from '../data/airports.js';
import { useLiveF107, clampF107 } from '../hooks/useLiveF107.js';

const HOME_KEY = 'aerodose.homeAirport.v1';
const ALT_FT = 37000;

// A spread of common trips: domestic, resort, transatlantic, transpacific, Middle East
const QUICK_AIRPORTS = ['JFK', 'LAX', 'ORD', 'ATL', 'DFW', 'SFO', 'BOS', 'SEA'];
const DESTINATIONS = ['LAX', 'MIA', 'HNL', 'LHR', 'CDG', 'FRA', 'NRT', 'DXB'];

function readHome() {
  try {
    const code = localStorage.getItem(HOME_KEY);
    return code ? getAirport(code) : null;
  } catch { return null; }
}

function saveHome(airport) {
  try {
    if (airport) localStorage.setItem(HOME_KEY, airport.iata);
    else localStorage.removeItem(HOME_KEY);
  } catch { /* storage unavailable: the choice just won't persist */ }
}

export default function LocalFlights({ onPickRoute }) {
  const [home, setHome] = useState(readHome);
  const live = useLiveF107();
  const f107 = clampF107(live.status === 'ready' ? live.data.flux : 150);

  const rows = useMemo(() => {
    if (!home) return [];
    return DESTINATIONS
      .map(getAirport)
      .filter(d => d && d.iata !== home.iata)
      .map(d => {
        const r = calculateFlightDose({ origin: home, destination: d, altFt: ALT_FT, solarF10_7: f107 });
        return { dest: d, dose: r.totalDoseUsv, hours: r.flightTimeHr };
      })
      .sort((a, b) => a.dose - b.dose);
  }, [home, f107]);

  const maxDose = rows.length ? Math.max(...rows.map(r => r.dose)) : 1;

  function chooseHome(airport) {
    setHome(airport);
    saveHome(airport);
  }

  return (
    <section aria-labelledby="local-title" className="border-t border-line bg-canvas px-4 py-6">
      <div className="flex items-center gap-2">
        <MapPin size={20} className="text-brand-text" aria-hidden="true" />
        <h2 id="local-title" className="text-xl font-semibold text-fg">Flights from my area</h2>
      </div>
      <p className="mt-1 max-w-[70ch] text-[0.9375rem] text-fg-soft">
        Pick the airport nearest you to see what popular trips from your community add to your yearly radiation total.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Quick-pick airports">
        <span className="text-sm text-fg-soft">Quick pick:</span>
        {QUICK_AIRPORTS.map(code => (
          <button key={code} type="button" className="btn-ghost font-mono" aria-pressed={home?.iata === code}
            onClick={() => chooseHome(getAirport(code))}>{code}</button>
        ))}
      </div>

      <div className="mt-4 max-w-sm">
        <AirportField key={home?.iata ?? 'none'} id="home-iata" label="My nearest airport" value={home} onChange={chooseHome} />
      </div>

      {home && (
        <div className="panel mt-5 p-5">
          <h3 className="text-base font-medium text-fg">From {home.city || home.name} ({home.iata}) at {ALT_FT.toLocaleString('en-US')} ft</h3>
          <ul className="mt-4 flex flex-col gap-3">
            {rows.map(r => (
              <li key={r.dest.iata} className="grid grid-cols-[4.5rem_1fr] items-center gap-x-3 gap-y-1 sm:grid-cols-[4.5rem_1fr_11rem_auto]">
                <span className="mono text-sm font-semibold text-fg">{r.dest.iata}</span>
                <div className="h-3 overflow-hidden rounded-full bg-surface-2" role="presentation">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${Math.max(3, (r.dose / maxDose) * 100)}%` }} />
                </div>
                <span className="col-span-2 text-sm text-fg-soft sm:col-span-1">
                  <span className="mono font-semibold text-fg">{r.dose.toFixed(0)} µSv</span> · {r.hours.toFixed(1)} h in the air
                </span>
                <button type="button" className="btn-ghost col-span-2 justify-center sm:col-span-1"
                  onClick={() => onPickRoute({ origin: home, dest: r.dest, nonce: Date.now() })}
                  aria-label={`See full results for ${home.iata} to ${r.dest.iata}`}>
                  Details
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[0.8125rem] text-fg-muted">
            Estimates use today's measured solar activity. One µSv is a millionth of a sievert; the yearly public guideline is 1,000 µSv.
          </p>
        </div>
      )}
    </section>
  );
}
