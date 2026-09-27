/**
 * AeroDose — Main Dose Calculator
 *
 * Wires together the great-circle route sampler and dose model to compute
 * total effective dose for a given flight.
 */

import { doseRateUsvHr, geographicToGeomagneticLat } from './doseModel.js';
import { sampleGreatCircle, greatCircleDistanceNm, estimateFlightTimeHr } from './greatCircle.js';

/**
 * Calculate the radiation dose for a flight.
 *
 * @param {Object} params
 * @param {{lat: number, lon: number, name: string}} params.origin
 * @param {{lat: number, lon: number, name: string}} params.destination
 * @param {number} params.altFt - Cruise altitude in feet (default 37000)
 * @param {number} [params.solarF10_7] - Solar flux (default 150)
 * @returns {{
 *   totalDoseUsv: number,
 *   totalDoseMsv: number,
 *   flightTimeHr: number,
 *   distanceNm: number,
 *   avgDoseRateUsvHr: number,
 *   waypoints: Array,
 *   context: Object
 * }}
 */
export function calculateFlightDose({ origin, destination, altFt = 37000, solarF10_7 = 150 }) {
  const distNm = greatCircleDistanceNm(origin.lat, origin.lon, destination.lat, destination.lon);
  const flightTimeHr = estimateFlightTimeHr(distNm, altFt);

  // Sample route at ~150 nm intervals
  const routePoints = sampleGreatCircle(origin.lat, origin.lon, destination.lat, destination.lon, 150);

  // Calculate dose at each waypoint
  const waypoints = routePoints.map(pt => {
    const geomagLat = geographicToGeomagneticLat(pt.lat, pt.lon);
    const doseRate = doseRateUsvHr(altFt, geomagLat, solarF10_7);
    return { ...pt, geomagLat, doseRate };
  });

  // Integrate dose along route (trapezoidal integration in time)
  // Each segment's time = (fraction of total distance) * total flight time
  // Dose contribution = avg dose rate of segment * segment time
  let totalDoseUsv = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const segFraction = (waypoints[i + 1].fractionAlongRoute - waypoints[i].fractionAlongRoute);
    const segTimeHr = segFraction * flightTimeHr;
    const avgSegRate = (waypoints[i].doseRate + waypoints[i + 1].doseRate) / 2;
    totalDoseUsv += avgSegRate * segTimeHr;
  }

  const avgDoseRateUsvHr = totalDoseUsv / flightTimeHr;
  const totalDoseMsv = totalDoseUsv / 1000;

  // Context comparisons (sourced from published reference values)
  const context = buildContext(totalDoseUsv);

  return {
    totalDoseUsv,
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
