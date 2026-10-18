/**
 * AeroDose — Cosmic Ray Radiation Dose Model
 *
 * A simplified analytical model, NOT a Monte Carlo simulation and NOT CARI-7.
 * Structure follows the physics described in:
 *  - FAA CAMI CARI-7/7A documentation
 *    https://www.faa.gov/data_research/research/med_humanfacs/aeromedical/radiobiology/cari7
 *  - FAA Advisory Circular 120-61B "In-Flight Radiation Exposure"
 *  - ICRP Publication 132 (2016) "Radiological Protection from Cosmic Radiation in Aviation"
 *  - Lindborg et al. (2004) Radiation Protection Dosimetry 110(1-4):417-422
 *
 * CALIBRATION: the two numbers in CALIBRATION below were fitted to the CARI-7 doses published in
 * FAA AC 120-61B Table 2 (27 flights; the 21 flights of 3+ hours were used). They are fitted, not
 * derived from first principles, so the model is "calibrated to" that table, not independently
 * validated against it. `npm run calibrate` reproduces the fit and reports leave-one-out error;
 * `npm run validate` prints the flight-by-flight comparison.
 *
 * Shape (not fitted): the dose-by-altitude profile keeps the shape of the original reference table.
 * The latitude effect is assumed to grow with altitude and to vanish at sea level (reasonable
 * physics, but the FAA data only constrain it at cruise levels FL310 to FL430).
 */

export const CALIBRATION = {
  cruiseScale: 0.295,  // multiplies the altitude table above sea level
  polarFactor: 3.9,    // polar-to-equatorial dose-rate ratio once the latitude effect is fully developed
};

// Altitude at which the latitude effect is assumed fully developed
const LATITUDE_FULL_ALT_FT = 30000;

// ─── Reference dose rate table (shape source) ─────────────────────────────────
// Equatorial dose rates, solar minimum, from Lindborg et al. 2004 and
// Bottollier-Depois et al. 2000 Radiat. Prot. Dosim. 91(4):363-371.
// Absolute levels are rescaled by CALIBRATION.cruiseScale; sea level is left as is.
const EQUATORIAL_DOSE_RATES_BY_ALT = [
  { altFt: 0,     doseRateUsvHr: 0.031  },
  { altFt: 10000, doseRateUsvHr: 0.28   },
  { altFt: 20000, doseRateUsvHr: 0.85   },
  { altFt: 25000, doseRateUsvHr: 1.4    },
  { altFt: 30000, doseRateUsvHr: 2.3    },
  { altFt: 35000, doseRateUsvHr: 3.5    },
  { altFt: 37000, doseRateUsvHr: 4.0    },
  { altFt: 39000, doseRateUsvHr: 4.6    },
  { altFt: 41000, doseRateUsvHr: 5.3    },
  { altFt: 45000, doseRateUsvHr: 7.2    },
  { altFt: 50000, doseRateUsvHr: 10.5   },
];

const tableCache = new Map();
function scaledTable(scale) {
  if (!tableCache.has(scale)) {
    tableCache.set(scale, EQUATORIAL_DOSE_RATES_BY_ALT.map((r, i) =>
      i === 0 ? r : { altFt: r.altFt, doseRateUsvHr: r.doseRateUsvHr * scale }));
  }
  return tableCache.get(scale);
}

function interpolateDoseRateAtAlt(altFt, scale) {
  const table = scaledTable(scale);
  if (altFt <= table[0].altFt) return table[0].doseRateUsvHr;
  if (altFt >= table[table.length - 1].altFt) return table[table.length - 1].doseRateUsvHr;
  for (let i = 0; i < table.length - 1; i++) {
    if (altFt >= table[i].altFt && altFt <= table[i + 1].altFt) {
      const t = (altFt - table[i].altFt) / (table[i + 1].altFt - table[i].altFt);
      const logD0 = Math.log(table[i].doseRateUsvHr);
      const logD1 = Math.log(table[i + 1].doseRateUsvHr);
      return Math.exp(logD0 + t * (logD1 - logD0));
    }
  }
  return table[table.length - 1].doseRateUsvHr;
}

/**
 * Latitude enhancement factor: 1.0 at the geomagnetic equator, rising smoothly to
 * `polarFactor` at 65° and beyond. The effect grows with altitude and is absent at sea level.
 * Source for the idea: ICRP 132 §3.2; the size of the effect is fitted to FAA AC 120-61B Table 2.
 */
function latitudeEnhancementFactor(geomagLatDeg, altFt, polarFactor) {
  const absLat = Math.abs(geomagLatDeg);
  const altShare = Math.max(0, Math.min(1, altFt / LATITUDE_FULL_ALT_FT));
  const polar = 1 + (polarFactor - 1) * altShare;
  if (absLat <= 0) return 1.0;
  if (absLat >= 65) return polar;
  const t = absLat / 65.0;
  return 1.0 + (polar - 1) * (3 * t * t - 2 * t * t * t);
}

/**
 * Solar modulation factor.
 * GCR flux anti-correlates with solar activity (Forbush modulation).
 * Source: ICRP 132 (2016) §3.3; O'Brien et al. 1996 Radiat. Prot. Dosim. 68:237
 */
function solarModulationFactor(solarF10_7 = 150) {
  const fMin = 70, fMax = 220;
  const clamped = Math.max(fMin, Math.min(fMax, solarF10_7));
  return 1.0 - 0.18 * (clamped - fMin) / (fMax - fMin);
}

/**
 * Estimate effective cosmic radiation dose rate.
 * @param {number} altFt - Pressure altitude in feet
 * @param {number} geomagLatDeg - Geomagnetic latitude (-90 to +90)
 * @param {number} solarF10_7 - 10.7cm solar flux (default 150 sfu)
 * @param {{cruiseScale: number, polarFactor: number}} [cal] - Calibration (defaults to CALIBRATION)
 * @returns {number} Effective dose rate in µSv/hr
 */
export function doseRateUsvHr(altFt, geomagLatDeg, solarF10_7 = 150, cal = CALIBRATION) {
  return interpolateDoseRateAtAlt(altFt, cal.cruiseScale)
    * latitudeEnhancementFactor(geomagLatDeg, altFt, cal.polarFactor)
    * solarModulationFactor(solarF10_7);
}

/**
 * Convert geographic coordinates to approximate geomagnetic latitude.
 * Magnetic north pole: ~80.7°N, 72.7°W (2024 WMM-2020 dipole approximation).
 * Source: NOAA NGDC World Magnetic Model 2020-2025.
 */
export function geographicToGeomagneticLat(geoLat, geoLon) {
  const poleLat = 80.7 * Math.PI / 180;
  const poleLon = -72.7 * Math.PI / 180;
  const lat = geoLat * Math.PI / 180;
  const lon = geoLon * Math.PI / 180;
  const sinGeomagLat = Math.sin(lat)*Math.sin(poleLat) + Math.cos(lat)*Math.cos(poleLat)*Math.cos(lon - poleLon);
  return Math.asin(sinGeomagLat) * 180 / Math.PI;
}
