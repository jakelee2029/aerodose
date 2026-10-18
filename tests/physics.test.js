// Physics sanity tests. These check that the model behaves the way cosmic-ray physics says it should
// (more altitude, higher latitude, or a quieter Sun means more dose). They do NOT prove numerical
// accuracy against CARI-7; that is what validation/cari7_reference.json and validation.test.js are for.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { doseRateUsvHr, geographicToGeomagneticLat } from '../src/physics/doseModel.js';
import { greatCircleDistanceNm, estimateFlightTimeHr } from '../src/physics/greatCircle.js';
import { calculateFlightDose } from '../src/physics/calculator.js';
import { getAirport } from '../src/data/airports.js';

const flight = (a, b, opts = {}) =>
  calculateFlightDose({ origin: getAirport(a), destination: getAirport(b), altFt: 37000, solarF10_7: 150, ...opts });

test('dose rate at sea level is tiny compared with cruise altitude', () => {
  const ground = doseRateUsvHr(0, 40, 150);
  const cruise = doseRateUsvHr(37000, 40, 150);
  assert.ok(ground < 0.1, `sea level ${ground}`);
  assert.ok(cruise / ground > 30, `cruise/ground ratio ${cruise / ground}`);
});

test('dose rate never decreases as altitude increases', () => {
  let prev = 0;
  for (let alt = 0; alt <= 50000; alt += 1000) {
    const r = doseRateUsvHr(alt, 45, 150);
    assert.ok(r >= prev, `drop at ${alt} ft: ${r} < ${prev}`);
    prev = r;
  }
});

test('dose rate never decreases toward the geomagnetic poles', () => {
  let prev = 0;
  for (let lat = 0; lat <= 90; lat += 5) {
    const r = doseRateUsvHr(37000, lat, 150);
    assert.ok(r >= prev - 1e-9, `drop at ${lat}°: ${r} < ${prev}`);
    prev = r;
  }
});

test('at cruise altitude the polar rate is roughly 3 to 5 times the equatorial rate (fitted to FAA AC 120-61B)', () => {
  const ratio = doseRateUsvHr(37000, 70, 150) / doseRateUsvHr(37000, 0, 150);
  assert.ok(ratio > 3 && ratio < 5, `ratio ${ratio}`);
});

test('the latitude effect is much weaker near the ground than at cruise altitude', () => {
  const ground = doseRateUsvHr(0, 70, 150) / doseRateUsvHr(0, 0, 150);
  const cruise = doseRateUsvHr(37000, 70, 150) / doseRateUsvHr(37000, 0, 150);
  assert.ok(ground < 1.2, `ground ratio ${ground}`);
  assert.ok(cruise > ground * 2);
});

test('northern and southern hemispheres are symmetric in geomagnetic latitude', () => {
  assert.equal(doseRateUsvHr(37000, 50, 150), doseRateUsvHr(37000, -50, 150));
});

test('a quiet Sun (solar minimum) gives a higher dose than solar maximum, by about 18%', () => {
  const min = doseRateUsvHr(37000, 50, 70);
  const max = doseRateUsvHr(37000, 50, 220);
  assert.ok(min > max);
  assert.ok(Math.abs(max / min - 0.82) < 0.01, `ratio ${max / min}`);
});

test('out-of-range solar flux is clamped, not extrapolated', () => {
  assert.equal(doseRateUsvHr(37000, 50, 500), doseRateUsvHr(37000, 50, 220));
  assert.equal(doseRateUsvHr(37000, 50, -10), doseRateUsvHr(37000, 50, 70));
});

test('cruise dose rates fall in the range seen in the FAA table (about 0.5 to 6 µSv/hr)', () => {
  // The FAA flights average 2.3 to 4.7 µSv/hr between about 32° and 60° geomagnetic latitude
  for (const lat of [0, 30, 50, 70]) {
    const r = doseRateUsvHr(37000, lat, 150);
    assert.ok(r > 0.5 && r < 6, `${lat}°: ${r}`);
  }
  assert.ok(doseRateUsvHr(37000, 55, 150) > 2.5 && doseRateUsvHr(37000, 55, 150) < 4.5);
});

test('geomagnetic latitude: the geomagnetic pole is 90°, its antipode is -90°', () => {
  assert.ok(Math.abs(geographicToGeomagneticLat(80.7, -72.7) - 90) < 1e-6);
  assert.ok(Math.abs(geographicToGeomagneticLat(-80.7, 107.3) + 90) < 1e-6);
});

test('great-circle distance: JFK to LHR is about 3,000 nm', () => {
  const a = getAirport('JFK'), b = getAirport('LHR');
  const d = greatCircleDistanceNm(a.lat, a.lon, b.lat, b.lon);
  assert.ok(d > 2900 && d < 3100, `distance ${d}`);
});

test('flight time grows with distance', () => {
  assert.ok(estimateFlightTimeHr(1000) < estimateFlightTimeHr(3000));
});

test('flight dose is the same in either direction (within 3%)', () => {
  for (const [a, b] of [['JFK', 'LHR'], ['LAX', 'NRT'], ['ANC', 'FRA']]) {
    const ab = flight(a, b).totalDoseUsv, ba = flight(b, a).totalDoseUsv;
    assert.ok(Math.abs(ab - ba) / ab < 0.03, `${a}-${b}: ${ab} vs ${ba}`);
  }
});

test('a longer flight at similar latitude delivers more total dose', () => {
  assert.ok(flight('BOS', 'MIA').totalDoseUsv < flight('BOS', 'LAX').totalDoseUsv);
});

test('a polar route has a higher average dose rate than an equatorial one', () => {
  const polar = flight('ANC', 'FRA').avgDoseRateUsvHr;
  const lowLat = flight('MIA', 'HNL').avgDoseRateUsvHr;
  assert.ok(polar > lowLat, `polar ${polar} vs low-latitude ${lowLat}`);
});

test('London to New York is within 20% of the FAA CARI-7 value (27.3 µSv, AC 120-61B Table 2)', () => {
  const d = flight('LHR', 'JFK').totalDoseUsv;
  assert.ok(Math.abs(d - 27.3) / 27.3 < 0.2, `dose ${d}`);
});

test('climb and descent lower the dose compared with holding the cruise rate the whole flight', () => {
  for (const [a, b] of [['JFK', 'LHR'], ['BOS', 'MIA'], ['LAX', 'NRT']]) {
    const r = flight(a, b);
    assert.ok(r.totalDoseUsv < r.cruiseOnlyDoseUsv, `${a}-${b}`);
  }
});

test('the climb and descent correction is small on long flights and larger on short ones', () => {
  const longHaul = flight('LAX', 'NRT');
  const shortHop = flight('BOS', 'MIA');
  const longRatio = longHaul.totalDoseUsv / longHaul.cruiseOnlyDoseUsv;
  const shortRatio = shortHop.totalDoseUsv / shortHop.cruiseOnlyDoseUsv;
  assert.ok(longRatio > 0.9, `long haul ratio ${longRatio}`);
  assert.ok(shortRatio < longRatio, `short ${shortRatio} vs long ${longRatio}`);
  assert.ok(shortRatio > 0.5, `short ratio ${shortRatio}`);
});

test('a cruise altitude of 0 ft gives almost no dose', () => {
  assert.ok(flight('JFK', 'LHR', { altFt: 0 }).totalDoseUsv < 1);
});

test('total dose equals average rate times flight time', () => {
  const r = flight('LAX', 'NRT');
  assert.ok(Math.abs(r.totalDoseUsv - r.avgDoseRateUsvHr * r.flightTimeHr) < 1e-6);
});
