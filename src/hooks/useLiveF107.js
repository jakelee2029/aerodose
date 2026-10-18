import { useEffect, useState } from 'react';

// NOAA Space Weather Prediction Center: observed 10.7 cm solar radio flux. Public, CORS-enabled.
const URL = 'https://services.swpc.noaa.gov/json/f107_cm_flux.json';

let pending; // one shared request for every component that asks

function fetchLiveF107() {
  pending ??= fetch(URL)
    .then(r => { if (!r.ok) throw new Error(`NOAA SWPC responded ${r.status}`); return r.json(); })
    .then(rows => {
      const row = Array.isArray(rows) ? rows.find(r => Number.isFinite(r.flux)) : null;
      if (!row) throw new Error('No flux value in NOAA response');
      return { flux: Math.round(row.flux), observed: row.time_tag };
    })
    .catch(err => { pending = undefined; throw err; });
  return pending;
}

/** Latest observed F10.7 (sfu). status: 'loading' | 'ready' | 'error'. Callers should fall back to a default on 'error'. */
export function useLiveF107() {
  const [state, setState] = useState({ status: 'loading', data: null });
  useEffect(() => {
    let alive = true;
    fetchLiveF107()
      .then(data => { if (alive) setState({ status: 'ready', data }); })
      .catch(() => { if (alive) setState({ status: 'error', data: null }); });
    return () => { alive = false; };
  }, []);
  return state;
}

/** The dose model is only defined for F10.7 between 70 and 220 sfu. */
export function clampF107(v) { return Math.max(70, Math.min(220, v)); }
