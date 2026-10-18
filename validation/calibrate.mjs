// npm run calibrate: refits the two calibration numbers to the FAA AC 120-61B Table 2 CARI-7 doses
// and reports how well the fit generalizes (leave-one-out: each flight is predicted by a fit that never saw it).
// Prints the numbers to paste into CALIBRATION in src/physics/doseModel.js. It does not edit any file.
import { loadReference } from './compare.js';
import { calculateFlightDose } from '../src/physics/calculator.js';
import { getAirport } from '../src/data/airports.js';
import { CALIBRATION } from '../src/physics/doseModel.js';

const ref = loadReference();
const resolve = code => getAirport(code) ?? { iata: code, ...ref.airports[code] };

// Fit on flights of 3+ hours, supplying the FAA's real air time so only the dose model is judged
const flights = ref.flights.filter(f => f.airTimeHr >= ref.minAirTimeHrForPass).map(f => ({
  f, origin: resolve(f.origin), destination: resolve(f.destination),
}));

const relErr = (item, cal) => {
  const d = calculateFlightDose({
    origin: item.origin, destination: item.destination, altFt: item.f.flightLevel * 100,
    solarF10_7: ref.assumptions.f107, flightTimeHr: item.f.airTimeHr, calibration: cal,
  }).totalDoseUsv;
  return Math.abs((d - item.f.cari7Usv) / item.f.cari7Usv) * 100;
};
const mae = (set, cal) => set.reduce((a, it) => a + relErr(it, cal), 0) / set.length;

function fit(set) {
  let best = null;
  for (let s = 0.10; s <= 0.50; s += 0.005) {
    for (let P = 2.0; P <= 8.0; P += 0.1) {
      const cal = { cruiseScale: +s.toFixed(3), polarFactor: +P.toFixed(2) };
      const m = mae(set, cal);
      if (!best || m < best.m) best = { ...cal, m };
    }
  }
  return best;
}

console.log(`Flights used: ${flights.length} (3 h or longer), F10.7 = ${ref.assumptions.f107} sfu`);
console.log(`Current CALIBRATION: scale ${CALIBRATION.cruiseScale}, polar ${CALIBRATION.polarFactor}  -> mean abs error ${mae(flights, CALIBRATION).toFixed(1)}%`);

const all = fit(flights);
console.log(`Best fit on all flights: cruiseScale ${all.cruiseScale}, polarFactor ${all.polarFactor}  -> mean abs error ${all.m.toFixed(1)}% (in-sample)`);

let loo = 0;
for (let i = 0; i < flights.length; i++) {
  const train = flights.filter((_, j) => j !== i);
  const cal = fit(train);
  loo += relErr(flights[i], cal);
}
console.log(`Leave-one-out mean abs error: ${(loo / flights.length).toFixed(1)}%  (each flight predicted by a fit that excluded it)`);
