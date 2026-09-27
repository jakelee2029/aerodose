/**
 * AeroDose — Great-Circle Route Sampler
 *
 * Computes a great-circle path between two geographic coordinates and
 * samples it at regular intervals.
 *
 * Great-circle math: Vincenty formula for accuracy, but for flight routing
 * the spherical approximation is sufficient (error < 0.3%).
 */

const EARTH_RADIUS_NM = 3440.065; // nautical miles, IAU 2012

/**
 * Convert degrees to radians.
 */
function deg2rad(d) { return d * Math.PI / 180; }
function rad2deg(r) { return r * 180 / Math.PI; }

/**
 * Compute great-circle distance between two points (Haversine formula).
 * @returns {number} Distance in nautical miles
 */
export function greatCircleDistanceNm(lat1, lon1, lat2, lon2) {
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(deg2rad(lat1))*Math.cos(deg2rad(lat2))*Math.sin(dLon/2)**2;
  return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * EARTH_RADIUS_NM;
}

/**
 * Compute great-circle waypoints between two coordinates.
 * @param {number} lat1, lon1 - Origin (degrees)
 * @param {number} lat2, lon2 - Destination (degrees)
 * @param {number} intervalNm - Sampling interval in nautical miles (default 150 nm)
 * @returns {Array<{lat, lon, distFromOriginNm, fractionAlongRoute}>}
 */
export function sampleGreatCircle(lat1, lon1, lat2, lon2, intervalNm = 150) {
  const totalDistNm = greatCircleDistanceNm(lat1, lon1, lat2, lon2);
  const numSegments = Math.max(2, Math.ceil(totalDistNm / intervalNm));
  const points = [];
  
  const φ1 = deg2rad(lat1), λ1 = deg2rad(lon1);
  const φ2 = deg2rad(lat2), λ2 = deg2rad(lon2);
  const d  = 2 * Math.asin(Math.sqrt(
    Math.sin((φ2-φ1)/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin((λ2-λ1)/2)**2
  ));

  for (let i = 0; i <= numSegments; i++) {
    const f = i / numSegments;
    if (d < 1e-10) {
      points.push({ lat: lat1, lon: lon1, distFromOriginNm: 0, fractionAlongRoute: f });
      continue;
    }
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
    const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
    const z = A * Math.sin(φ1) + B * Math.sin(φ2);
    const lat = rad2deg(Math.atan2(z, Math.sqrt(x*x + y*y)));
    const lon = rad2deg(Math.atan2(y, x));
    points.push({ lat, lon, distFromOriginNm: f * totalDistNm, fractionAlongRoute: f });
  }
  
  return points;
}

/**
 * Estimate flight time in hours.
 * Uses typical subsonic cruise speed of 480 knots (true airspeed), which corresponds
 * to roughly Mach 0.82 at FL350/ISA conditions.
 * Source: Boeing 737/747/777 performance data; Airbus A320/A330 cruise profiles.
 */
export function estimateFlightTimeHr(distNm, altFt = 35000) {
  // Typical cruise TAS (knots) as function of altitude
  // Ground speed estimate assumes average headwind/tailwind of 0 (neutral)
  let typicalTasKt;
  if (altFt < 25000) typicalTasKt = 400;
  else if (altFt < 35000) typicalTasKt = 450;
  else typicalTasKt = 480;
  // Add climb/descent penalty: ~15 min equivalent at each end
  const climbDescentPenaltyHr = 0.25 + 0.25;
  return distNm / typicalTasKt + climbDescentPenaltyHr;
}
