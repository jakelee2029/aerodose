# AeroDose — Cosmic Ray Flight Radiation Estimator

> **Congressional App Challenge 2026** · NY-06 (Grace Meng) · Built by Jake Lee

[![Live Demo](https://img.shields.io/badge/Live%20Demo-aerodose.vercel.app-38BDF8?style=flat-square)](https://aerodose.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-jakelee2029%2Faerodose-24292e?style=flat-square&logo=github)](https://github.com/jakelee2029/aerodose)
[![License: MIT](https://img.shields.io/badge/License-MIT-22C55E?style=flat-square)](LICENSE)
[![Built with Vite](https://img.shields.io/badge/Built%20with-Vite%208-F59E0B?style=flat-square)](https://vitejs.dev)

Every time you board a commercial flight, you are exposed to cosmic radiation — high-energy particles from deep space that penetrate the atmosphere. At cruising altitude (FL370), you are above 75% of Earth's protective air column. AeroDose makes this invisible exposure visible, using the same physics models referenced by FAA researchers and the ICRP.

---

## ✈️ What It Does

Enter any origin and destination airport (IATA code or city name), set your cruise altitude and solar conditions, and get:

| Output | Details |
|---|---|
| **Total effective dose** | µSv and mSv for the whole flight, including climb and descent |
| **Risk banner and comparison meter** | Plain-language verdict, with bananas, chest X-rays and the yearly public guideline on one scale |
| **Dose rate profile chart** | µSv/hr vs. flight distance (nm) |
| **Great-circle route map** | Route colored by dose rate (Viridis scale) with a numeric legend |
| **Live solar activity** | Today's 10.7 cm solar flux from NOAA SWPC |
| **Flights from my area** | Ranks popular trips from your nearest airport by dose |
| **My year in the air** | A private running total against the 1 mSv yearly guideline (stored only in your browser) |
| **Who flies? and Take action** | Example scenarios and a draft letter to a representative or airline |

---

## 🔬 Physics Model

The dose calculation is a simplified analytical model inspired by the **FAA CARI-7/7A** program and **calibrated to CARI-7 results published by the FAA**. It is not CARI-7 itself (see Accuracy below).

### Key components:

```
D(h, λ, F₁₀.₇) = D₀(h) · f_lat(λ_geomag) · f_solar(F₁₀.₇)
```

| Factor | Model | Source |
|---|---|---|
| **Altitude base rate** `D₀(h)` | Exponential fit to Lindborg 2004 data table | Lindborg et al., RPD 110:417 (2004) |
| **Latitude enhancement** `f_lat` | Störmer dipole: Rc ≈ 14.9·cos⁴(λ) GV → 1.0–2.05× | Störmer (1930); Smart & Shea (2009) |
| **Solar modulation** `f_solar` | Linear GCR suppression with F10.7 flux | ICRP 132 §3.3 (2016) |
| **Route integration** | 40-waypoint great-circle geodesic | Spherical earth, Haversine |
| **Atmospheric depth** | US Standard Atmosphere 1976 | NOAA (1976) |

### Accuracy (tested against the FAA's own CARI-7 results)

FAA Advisory Circular 120-61B, Table 2 lists CARI-7 doses for 27 real nonstop flights (ICRU mean solar activity, quiet conditions). The data, source and assumptions are in `validation/cari7_reference.json`.

| Command | What it does |
|---|---|
| `npm run validate` | Prints the flight-by-flight comparison table |
| `npm run calibrate` | Refits the two calibration numbers and reports leave-one-out error |
| `npm test` | Runs the physics, scenario and accuracy tests |

**How the model was calibrated.** An early version of the model read about **92% too high** on average against this table. Two numbers were then fitted to it: a scale factor for the cruise-altitude dose rate (0.295) and the polar-to-equatorial ratio (3.9). The latitude effect is also assumed to fade toward sea level, and climb and descent are modelled with a simple altitude profile.

**Results, 21 flights of 3 hours or more** (table's maximum flight level used as cruise altitude, 150 sfu solar flux):

| | Mean error | Worst flight | Average bias | Within ±15% |
|---|---|---|---|---|
| End to end (AeroDose estimates air time) | **11.5%** | 31% | +2% | 13 of 21 |
| Dose model only (FAA air time supplied) | 11.7% | 35% | +1% | 14 of 21 |
| Leave-one-out (each flight excluded from its own fit) | 12.7% | n/a | n/a | n/a |

**What this means, honestly:**
- Because the fit used this same table, the first two rows show how well the fit holds, not independent validation. The leave-one-out row is the fairer estimate for flights the fit has not seen.
- AeroDose is typically within about 12% of CARI-7, but **individual flights can be off by up to about 35%**, mostly very long, high-altitude flights (for example New York to Tokyo at FL430).
- The model is **not** accurate to ±15% on every flight, and the original goal of 80% of flights within ±15% was not met (62%).
- The FAA table gives city pairs, a maximum flight level and an assumed solar condition. AeroDose uses one cruise altitude, a chosen airport per city, and F10.7 = 150 sfu, so some of the difference is from these assumptions, not the physics.
- Flights under 3 hours are shown in the full table (`npm run validate`) but are dominated by climb and descent, which the model only approximates.
- For regulatory or medical use, run the official FAA CARI-7 software.

### Sources
1. FAA CARI-7/7A — https://www.faa.gov/data_research/research/med_humanfacs/aeromedical/radiobiology/cari7
2. FAA Advisory Circular 120-61B — In-Flight Radiation Exposure
3. ICRP Publication 132 (2016) — Radiological Protection from Cosmic Radiation in Aviation
4. Lindborg, L. et al. (2004) — Radiat. Prot. Dosim. 110:417-422
5. NCRP Report No. 160 (2009) — Ionizing Radiation Exposure of the Population of the United States
6. NOAA NGDC — World Magnetic Model 2020-2025
7. OurAirports.com — Public domain airport coordinate data

> **No physics values were fabricated.** Every number traces to a citable public source.

---

## 🏛️ Civic Context

Congress mandates FAA tracking of aircrew radiation exposure under **14 CFR § 120.109** and **FAA Advisory Circular 120-61B**. This regulatory framework exists because repeated high-altitude flights can represent a meaningful occupational dose. AeroDose extends that same transparency to every passenger — not just crew.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 + vanilla CSS design tokens |
| Charts | Recharts |
| Map | Leaflet (Esri Dark Gray tiles — no API key required) |
| PWA | Web App Manifest + apple-touch-icon |
| Hosting | Vercel (zero-config) |
| Runtime | 100% client-side — no backend, no database |

---

## 🚀 Running Locally

```bash
git clone https://github.com/jakelee2029/aerodose.git
cd aerodose
npm install
npm run dev
```

Open http://localhost:5173/

**To test on a phone** (same Wi-Fi network):
```bash
npm run dev -- --host
```
Then visit `http://YOUR_LOCAL_IP:5173/` on your phone.

---

## 📱 PWA Install

AeroDose is installable as a Progressive Web App:
- **Android** → Chrome menu → *Add to Home Screen*
- **iPhone** → Safari Share → *Add to Home Screen*
- **Desktop** → Click the install icon (⊕) in Chrome/Edge address bar

---

## 📁 Project Structure

```
aerodose/
├── public/
│   ├── manifest.json        # PWA manifest
│   ├── icon-192.png         # App icon
│   └── icon-512.png         # App icon (large)
├── src/
│   ├── components/
│   │   ├── AppHeader.jsx    # Top navigation bar
│   │   ├── FlightParameters.jsx  # Left pane — inputs
│   │   ├── TelemetryPanel.jsx    # Results: KPIs, chart, map, table
│   │   ├── ImpactPanel.jsx       # Real-world impact + exposure simulator
│   │   ├── RouteMapEnterprise.jsx # Leaflet map
│   │   └── AirportField.jsx      # Airport search input
│   ├── physics/
│   │   ├── calculator.js    # Main dose computation entry point
│   │   ├── doseModel.js     # Altitude/latitude/solar models
│   │   └── greatCircle.js   # Geodesic waypoint generation
│   ├── data/
│   │   └── airports.js      # Airport database (IATA + coordinates)
│   └── index.css            # Design tokens + component styles
└── vercel.json              # Deployment config
```

---

## 🤖 AI Disclosure

This project was developed with AI assistance (code scaffolding, design iterations, and documentation) in accordance with Congressional App Challenge guidelines.

---

## 📄 License

MIT — see [LICENSE](LICENSE)
