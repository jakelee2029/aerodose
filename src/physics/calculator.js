/**
 * AeroDose — Main Dose Calculator
 *
 * Wires together the great-circle route sampler and dose model to compute
 * total effective dose for a given flight.
 */

import { doseRateUsvHr, geographicToGeomagneticLat, CALIBRATION } from './doseModel.js';
import { sampleGreatCircle, greatCircleDistanceNm, estimateFlightTimeHr } from './greatCircle.js';

// Simple flight profile: altitude rises (and later falls) in a straight line over this many hours.
// A jet typically needs 20 to 30 minutes to reach 35,000+ ft. Short flights never reach cruise
// altitude, so each phase is capped at this share of the flight.
const CLIMB_DESCENT_HR = 0.4;
const CLIMB_DESCENT_SHARE_MAX = 0.4;
const SUBSTEPS = 12;

/**
 * Calculate the radiation dose for a flight.
 *
 * @param {Object} params
 * @param {{lat: number, lon: number, name: string}} params.origin
 * @param {{lat: number, lon: number, name: string}} params.destination
 * @param {number} params.altFt - Cruise altitude in feet (default 37000)
 * @param {number} [params.solarF10_7] - Solar flux (default 150)
 * @param {number} [params.flightTimeHr] - Known air time in hours; if omitted it is estimated from distance
 * @param {{cruiseScale: number, polarFactor: number}} [params.calibration] - Override the fitted calibration (used by `npm run calibrate`)
 * @returns {{
 *   totalDoseUsv: number,   climb and descent included
 *   cruiseOnlyDoseUsv: number,   if the full cruise rate applied for the whole flight (older behavior)
 *   totalDoseMsv: number,
 *   flightTimeHr: number,
 *   distanceNm: number,
 *   avgDoseRateUsvHr: number,
 *   waypoints: Array,
 *   context: Object
 * }}
 */
export function calculateFlightDose({ origin, destination, altFt = 37000, solarF10_7 = 150, flightTimeHr: timeOverrideHr, calibration = CALIBRATION }) {
  const distNm = greatCircleDistanceNm(origin.lat, origin.lon, destination.lat, destination.lon);
  // Optional override, used when validating the dose model against a flight whose real air time is known
  const flightTimeHr = timeOverrideHr ?? estimateFlightTimeHr(distNm, altFt);

  // Sample route at ~150 nm intervals
  const routePoints = sampleGreatCircle(origin.lat, origin.lon, destination.lat, destination.lon, 150);

  // Calculate dose at each waypoint
  const waypoints = routePoints.map(pt => {
    const geomagLat = geographicToGeomagneticLat(pt.lat, pt.lon);
    const doseRate = doseRateUsvHr(altFt, geomagLat, solarF10_7, calibration);
    return { ...pt, geomagLat, doseRate };
  });

  // Integrate dose along the route in time. Each segment's time = (fraction of route) * flight time.
  // The aircraft is lower, and the dose rate much smaller, during climb and descent, so each segment
  // is split into substeps and the altitude at each substep follows a simple flight profile.
  const climbHr = Math.min(CLIMB_DESCENT_HR, CLIMB_DESCENT_SHARE_MAX * flightTimeHr);
  let totalDoseUsv = 0;
  let cruiseOnlyDoseUsv = 0; // same route with the cruise rate held for the whole flight (for comparison)
  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = waypoints[i], b = waypoints[i + 1];
    const segTimeHr = (b.fractionAlongRoute - a.fractionAlongRoute) * flightTimeHr;
    cruiseOnlyDoseUsv += ((a.doseRate + b.doseRate) / 2) * segTimeHr;

    const dt = segTimeHr / SUBSTEPS;
    for (let j = 0; j < SUBSTEPS; j++) {
      const f = (j + 0.5) / SUBSTEPS;                       // position within the segment
      const tHr = (a.fractionAlongRoute + f * (b.fractionAlongRoute - a.fractionAlongRoute)) * flightTimeHr;
      const alt = altFt * Math.min(1, tHr / climbHr, (flightTimeHr - tHr) / climbHr);
      const geomagLat = a.geomagLat + f * (b.geomagLat - a.geomagLat);
      totalDoseUsv += doseRateUsvHr(Math.max(0, alt), geomagLat, solarF10_7, calibration) * dt;
    }
  }

  const avgDoseRateUsvHr = totalDoseUsv / flightTimeHr;
  const totalDoseMsv = totalDoseUsv / 1000;

  // Context comparisons (sourced from published reference values)
  const context = buildContext(totalDoseUsv);

  return {
    totalDoseUsv,
    cruiseOnlyDoseUsv,
    totalDoseMsv,
    flightTimeHr,
    distanceNm: distNm,
    avgDoseRateUsvHr,
    waypoints,
    altFt,
    solarF10_7,
    context,
  };
}

/**
 * Build context comparisons for the calculated dose.
 *
 * Reference values sourced from:
 * - NCRP Report 160 (2009): US annual background radiation ~3.1 mSv/yr
 * - ICRP Publication 103 (2007): chest X-ray ~0.014–0.1 mSv (typically ~0.02–0.05 mSv PA)
 * - FAA AC 120-61B: aircrew annual limit 20 mSv (5-yr average)
 * - ICRP Publication 132 (2016): airline pilot annual dose ~2–6 mSv
 * - "Banana Equivalent Dose" (BED): ~0.098 µSv per banana (potassium-40 content)
 *   Source: XKCD What-If, originally from Health Physics Society FAQ
 */
function buildContext(totalDoseUsv) {
  const CHEST_XRAY_USV = 20;        // µSv, PA chest radiograph (NCRP 160, Table B.1)
  const ANNUAL_BG_USV = 3100;       // µSv/yr, US average background (NCRP 160)
  const DAILY_BG_USV = 3100 / 365;  // µSv/day
  const AIRCREW_LIMIT_USV = 20000;  // µSv/yr, FAA AC 120-61B annual limit
  const BANANA_USV = 0.098;         // µSv per banana (K-40, HPS FAQ)
  const DENTAL_XRAY_USV = 5;        // µSv, dental bitewing (NCRP 160)
  const MAMMOGRAM_USV = 400;        // µSv, mammogram (NCRP 160)
  const TRANSCON_TYPICAL_USV = 30;  // µSv, typical JFK-LAX dose (CARI-7 estimates ~25-35 µSv)

  return {
    chestXrays: totalDoseUsv / CHEST_XRAY_USV,
    dentalXrays: totalDoseUsv / DENTAL_XRAY_USV,
    percentOfDailyBackground: (totalDoseUsv / DAILY_BG_USV) * 100,
    percentOfAnnualBackground: (totalDoseUsv / ANNUAL_BG_USV) * 100,
    percentOfAircrewLimit: (totalDoseUsv / AIRCREW_LIMIT_USV) * 100,
    bananas: totalDoseUsv / BANANA_USV,
    comparedToTranscon: totalDoseUsv / TRANSCON_TYPICAL_USV,
    references: {
      chestXray: { value: CHEST_XRAY_USV, unit: 'µSv', source: 'NCRP Report 160 (2009), Table B.1' },
      dentalXray: { value: DENTAL_XRAY_USV, unit: 'µSv', source: 'NCRP Report 160 (2009)' },
      annualBackground: { value: ANNUAL_BG_USV, unit: 'µSv/yr', source: 'NCRP Report 160 (2009) — US average all sources' },
      aircrewLimit: { value: AIRCREW_LIMIT_USV, unit: 'µSv/yr', source: 'FAA AC 120-61B; ICRP 132 (2016)' },
      banana: { value: BANANA_USV, unit: 'µSv', source: 'HPS FAQ; XKCD What-If (K-40 in banana)' },
    }
  };
}
