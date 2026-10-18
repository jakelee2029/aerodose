// Compares AeroDose with the CARI-7 doses in FAA Advisory Circular 120-61B, Table 2.
// Two comparisons per flight, so a gap can be traced to its cause:
//   end-to-end : AeroDose estimates the air time from distance (what users actually get)
//   dose model : AeroDose is given the FAA's real air time, isolating the dose-rate physics
import { readFileSync } from 'node:fs';
import { calculateFlightDose } from '../src/physics/calculator.js';
import { getAirport } from '../src/data/airports.js';

export function loadReference() {
  return JSON.parse(readFileSync(new URL('./cari7_reference.json', import.meta.url), 'utf8'));
}

function resolveAirport(code, reference) {
  const known = getAirport(code);
  if (known) return known;
  const extra = reference.airports?.[code];
  if (extra) return { iata: code, ...extra };
  throw new Error(`Unknown airport "${code}". Add it to "airports" in cari7_reference.json.`);
}

const pctDiff = (model, ref) => ((model - ref) / ref) * 100;

/** @returns {Array<object>} one row per reference flight */
export function compareAll(reference = loadReference()) {
  const f107 = reference.assumptions.f107;
  return reference.flights.map(f => {
    const origin = resolveAirport(f.origin, reference);
    const destination = resolveAirport(f.destination, reference);
    const altFt = f.flightLevel * 100;
    const endToEnd = calculateFlightDose({ origin, destination, altFt, solarF10_7: f107 });
    const doseModel = calculateFlightDose({ origin, destination, altFt, solarF10_7: f107, flightTimeHr: f.airTimeHr });
    return {
      label: `${f.origin} → ${f.destination}`, flightLevel: f.flightLevel, airTimeHr: f.airTimeHr,
      cari7: f.cari7Usv,
      endToEnd: endToEnd.totalDoseUsv, endToEndErrPct: pctDiff(endToEnd.totalDoseUsv, f.cari7Usv),
      estTimeHr: endToEnd.flightTimeHr,
      doseModel: doseModel.totalDoseUsv, doseModelErrPct: pctDiff(doseModel.totalDoseUsv, f.cari7Usv),
      inScope: f.airTimeHr >= reference.minAirTimeHrForPass,
    };
  });
}

export function summarize(rows, tolerancePercent) {
  const scoped = rows.filter(r => r.inScope);
  const stat = key => {
    const errs = scoped.map(r => Math.abs(r[key]));
    const signed = scoped.map(r => r[key]);
    return {
      meanAbs: errs.reduce((a, b) => a + b, 0) / errs.length,
      worst: Math.max(...errs),
      bias: signed.reduce((a, b) => a + b, 0) / signed.length,
      within: errs.filter(e => e <= tolerancePercent).length,
      n: errs.length,
    };
  };
  return { endToEnd: stat('endToEndErrPct'), doseModel: stat('doseModelErrPct') };
}

const sgn = v => `${v >= 0 ? '+' : ''}${v.toFixed(0)}%`;

export function toMarkdownTable(rows, tolerancePercent) {
  const head = '| Flight | FL | FAA air time (h) | CARI-7 (µSv) | AeroDose (µSv) | Diff. | AeroDose with FAA air time (µSv) | Diff. |\n|---|---|---|---|---|---|---|---|';
  const body = rows.map(r =>
    `| ${r.label}${r.inScope ? '' : ' *'} | ${r.flightLevel} | ${r.airTimeHr} | ${r.cari7} | ${r.endToEnd.toFixed(1)} | ${sgn(r.endToEndErrPct)} | ${r.doseModel.toFixed(1)} | ${sgn(r.doseModelErrPct)} |`);
  const s = summarize(rows, tolerancePercent);
  const line = (name, x) => `- ${name}: mean absolute difference ${x.meanAbs.toFixed(1)}%, worst ${x.worst.toFixed(0)}%, average bias ${sgn(x.bias)}, ${x.within} of ${x.n} flights within ±${tolerancePercent}%.`;
  return [
    head, ...body, '',
    `Summary of flights of 3 hours or more (rows marked * are shorter and shown for completeness):`,
    line('End to end (AeroDose estimates air time)', s.endToEnd),
    line('Dose model only (FAA air time supplied)', s.doseModel),
  ].join('\n');
}
