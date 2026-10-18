// Illustrative flying scenarios. These are examples to show how dose adds up for different people;
// they are not statistics about real individuals or groups. Doses come from the AeroDose model.
import { calculateFlightDose } from './calculator.js';
import { getAirport } from '../data/airports.js';

export const PUBLIC_GUIDELINE_USV = 1000;        // ICRP 103: 1 mSv per year for the public
export const OCCUPATIONAL_GUIDELINE_USV = 20000; // ICRP 103 / FAA AC 120-61B: 20 mSv per year for workers

/** legs: one-way flights per period. A round trip is two legs. */
export const SCENARIOS = [
  {
    id: 'crew',
    who: 'Flight attendant',
    blurb: 'Based at JFK, works 6 London round trips every month.',
    period: 'a year',
    legs: [{ from: 'JFK', to: 'LHR', count: 144 }],
    benchmark: { label: 'the 20 mSv/yr guideline for aircrew', usv: OCCUPATIONAL_GUIDELINE_USV },
    context: { label: 'the 1 mSv/yr guideline for the public', usv: PUBLIC_GUIDELINE_USV },
  },
  {
    id: 'student',
    who: 'High school student',
    blurb: 'One school trip to London and one family trip to Orlando.',
    period: 'a year',
    legs: [{ from: 'JFK', to: 'LHR', count: 2 }, { from: 'JFK', to: 'MCO', count: 2 }],
    benchmark: { label: 'the 1 mSv/yr guideline for the public', usv: PUBLIC_GUIDELINE_USV },
  },
  {
    id: 'business',
    who: 'Business traveler',
    blurb: 'Two coast-to-coast round trips a month plus four trips to Europe.',
    period: 'a year',
    legs: [{ from: 'JFK', to: 'LAX', count: 48 }, { from: 'JFK', to: 'LHR', count: 8 }],
    benchmark: { label: 'the 1 mSv/yr guideline for the public', usv: PUBLIC_GUIDELINE_USV },
  },
  {
    id: 'pregnant',
    who: 'Pregnant crew member',
    blurb: 'Works 3 London round trips in a month. Crew are advised to stay under 1 mSv for the whole pregnancy.',
    period: 'a month',
    legs: [{ from: 'JFK', to: 'LHR', count: 6 }],
    benchmark: { label: 'the 1 mSv guideline for a whole pregnancy', usv: PUBLIC_GUIDELINE_USV },
  },
];

const doseCache = new Map();
function legDoseUsv(from, to, f107, altFt) {
  const key = `${from}-${to}-${f107}-${altFt}`;
  if (!doseCache.has(key)) {
    doseCache.set(key, calculateFlightDose({
      origin: getAirport(from), destination: getAirport(to), altFt, solarF10_7: f107,
    }).totalDoseUsv);
  }
  return doseCache.get(key);
}

export function scenarioDoseUsv(scenario, f107 = 150, altFt = 37000) {
  return scenario.legs.reduce((sum, l) => sum + l.count * legDoseUsv(l.from, l.to, f107, altFt), 0);
}

/** One entry per leg group, in the shape the flight log stores. */
export function scenarioLogEntries(scenario, f107 = 150, altFt = 37000) {
  return scenario.legs.map(l => ({
    label: `${l.from} → ${l.to} ×${l.count}`,
    doseUsv: l.count * legDoseUsv(l.from, l.to, f107, altFt),
  }));
}

export function formatDose(usv) {
  return usv >= 1000 ? `${(usv / 1000).toFixed(1)} mSv` : `${usv.toFixed(0)} µSv`;
}
