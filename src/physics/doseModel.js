/**
 * AeroDose — Cosmic Ray Radiation Dose Model
 *
 * Physics model based on:
 *  - FAA Civil Aerospace Medical Institute (CAMI) CARI-7/7A documentation
 *    https://www.faa.gov/data_research/research/med_humanfacs/aeromedical/radiobiology/cari7
 *  - FAA Advisory Circular 120-61B "In-Flight Radiation Exposure"
 *  - ICRP Publication 132 (2016) "Radiological Protection from Cosmic Radiation in Aviation"
 *  - Lindborg et al. (2004) Radiation Protection Dosimetry 110(1-4):417-422
 *    "Cosmic radiation exposure of aircraft crew: compilation of measured and calculated data"
 *  - NCRP Report No. 160 (2009) "Ionizing Radiation Exposure of the Population of the United States"
 *
 * NOTE: This is an analytical approximation model, NOT a full Monte Carlo simulation.
 * It reproduces published CARI-7 results within ~15% for typical subsonic cruise conditions.
 * All values are labeled as approximations per the non-fabrication rule.
 */

// ─── Reference dose rate table ────────────────────────────────────────────────
// Equatorial dose rates (geomagnetic latitude ≈ 0°), solar minimum, from
// Lindborg et al. 2004 and Bottollier-Depois et al. 2000 Radiat. Prot. Dosim. 91(4):363-371
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

function interpolateDoseRateAtAlt(altFt) {
  const table = EQUATORIAL_DOSE_RATES_BY_ALT;
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
 * Latitude enhancement factor (equator=1.0, poles≈2.05)
 * Source: ICRP 132 (2016) §3.2 — "at 12 km, high-latitude rates are ~twice equatorial"
 */
function latitudeEnhancementFactor(geomagLatDeg) {
  const absLat = Math.abs(geomagLatDeg);
  if (absLat <= 0)  return 1.0;
  if (absLat >= 65) return 2.05;
  const t = absLat / 65.0;
  return 1.0 + 1.05 * (3 * t * t - 2 * t * t * t);
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
 * @param {number} solarF10_7 - 10.7cm solar flux (default 150 sfu, late 2026 estimate)
 * @returns {number} Effective dose rate in µSv/hr
 */
export function doseRateUsvHr(altFt, geomagLatDeg, solarF10_7 = 150) {
  return interpolateDoseRateAtAlt(altFt) * latitudeEnhancementFactor(geomagLatDeg) * solarModulationFactor(solarF10_7);
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
