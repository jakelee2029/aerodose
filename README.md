# AeroDose - Cosmic Ray Flight Radiation Estimator

> **Congressional App Challenge 2026** · NY-06 (Rep. Grace Meng) · Built by Jake Lee (Forest Hills High School, 10th grade)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-aerodose.vercel.app-38BDF8?style=flat-square)](https://aerodose.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-jakelee2029%2Faerodose-24292e?style=flat-square&logo=github)](https://github.com/jakelee2029/aerodose)
[![Tests: 36 passed](https://img.shields.io/badge/Tests-36%20passed-22C55E?style=flat-square)](tests)
[![License: MIT](https://img.shields.io/badge/License-MIT-22C55E?style=flat-square)](LICENSE)
[![Built with Vite](https://img.shields.io/badge/Built%20with-Vite%208-F59E0B?style=flat-square)](https://vitejs.dev)

Every time you board a commercial flight, you are exposed to cosmic radiation - high-energy particles from deep space that penetrate the atmosphere. At cruising altitude (FL370), you are above 75% of Earth's protective air column. AeroDose makes this invisible exposure visible, using the same physics models referenced by FAA researchers and the ICRP.

---

## ✈️ What It Does

Enter any origin and destination airport (IATA code or city name), set your cruise altitude and solar conditions, and get:

| Output | Details |
|---|---|
| **Total effective dose** | µSv and mSv for the whole flight, including climb and descent profiles |
| **Risk banner & comparison meter** | Plain-language verdict, comparing your flight to bananas, chest X-rays, and the 1 mSv/yr public guideline |
| **Dose rate profile chart** | Real-time µSv/hr vs. flight distance (nm) across all flight segments |
| **Great-circle route map** | Geodesic flight path colored by dose rate (Viridis colormap) with dynamic legend |
| **Live solar activity** | Real-time 10.7 cm solar flux fetched live from NOAA Space Weather Prediction Center (SWPC) |
| **Flights from my area** | Popular departures from local airports (pre-configured for JFK and LGA in Queens) |
| **My year in the air** | Private cumulative dose ledger tracking progress against the 1 mSv annual guideline (stored locally in browser) |
| **Who flies? (Scenarios)** | Pre-calculated profiles for flight attendants, frequent business flyers, vacationers, and students |
| **Civic Action Kit** | Generates tailored, data-backed letters to Congressional representatives or airline safety committees |
| **Why every µSv matters** | Plain-language radiobiology briefings on occupational standards and cosmic ray physics |

---

## 🔬 Physics Model

The dose calculation is a simplified analytical model inspired by the **FAA CARI-7/7A** program and **calibrated against CARI-7 benchmark flights published by the FAA**. It is designed for educational accessibility and rapid client-side calculation (see Accuracy below).

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

FAA Advisory Circular 120-61B, Table 2 lists CARI-7 doses for 27 real nonstop flights (ICRU mean solar activity, quiet conditions). The benchmark data, assumptions, and comparisons are located in `validation/cari7_reference.json`.

| Command | What it does |
|---|---|
| `npm run validate` | Prints the flight-by-flight comparison table against FAA CARI-7 |
| `npm run calibrate` | Refits calibration parameters via least squares and reports leave-one-out error |
| `npm test` | Runs the 36 automated unit, physics, scenario, and accuracy tests |

**How the model was calibrated.** An early naive version of the model read about **92% too high** on average against the FAA benchmark table. Two numbers were subsequently fitted: a scale factor for the cruise-altitude dose rate (0.295) and the polar-to-equatorial ratio (3.9). In addition, the geomagnetic latitude effect was modeled to attenuate towards lower altitudes, and climb/descent phases were incorporated.

**Results across 21 benchmark flights of 3 hours or more** (table's maximum flight level used as cruise altitude, 150 sfu solar flux):

| Metric | Mean error | Worst flight | Average bias | Within ±15% |
|---|---|---|---|---|
| End to end (AeroDose estimates air time) | **11.5%** | 31% | +2% | 13 of 21 |
| Dose model only (FAA air time supplied) | 11.7% | 35% | +1% | 14 of 21 |
| Leave-one-out (each flight excluded from its own fit) | 12.7% | n/a | n/a | n/a |

**What this means, honestly:**
- Because the fit used this same table, the first two rows show how well the fit holds, not independent validation. The leave-one-out row is the fairer estimate for flights the fit has not seen.
- AeroDose is typically within about 12% of CARI-7, but **individual flights can be off by up to about 35%**, mostly very long, high-altitude flights (for example New York to Tokyo at FL430).
- The model is **not** accurate to ±15% on every flight, and the original goal of 80% of flights within ±15% was not met (62%).
- The FAA table gives city pairs, a maximum flight level, and an assumed solar condition. AeroDose uses one cruise altitude, a chosen airport per city, and F10.7 = 150 sfu, so some difference arises from these operational assumptions rather than pure physics.
- Flights under 3 hours are shown in the full table (`npm run validate`) but are dominated by climb and descent, which the model only approximates.
- For regulatory compliance or medical evaluation, always refer to the official FAA CARI-7/7A software.

### Sources
1. FAA CARI-7/7A - https://www.faa.gov/data_research/research/med_humanfacs/aeromedical/radiobiology/cari7
2. FAA Advisory Circular 120-61B - In-Flight Radiation Exposure
3. ICRP Publication 132 (2016) - Radiological Protection from Cosmic Radiation in Aviation
4. Lindborg, L. et al. (2004) - Radiat. Prot. Dosim. 110:417-422
5. NCRP Report No. 160 (2009) - Ionizing Radiation Exposure of the Population of the United States
6. NOAA NGDC - World Magnetic Model 2020-2025
7. OurAirports.com - Public domain airport coordinate data

> **No physics values were fabricated.** Every formula and benchmark traces to a citable public source.

---

## 🏛️ Civic & Community Context

### Occupational Safety
Commercial airline pilots and flight attendants are officially recognized as **radiation workers** under **FAA Advisory Circular 120-61B** and federal guidelines. In fact, flight crews receive greater average annual occupational ionizing radiation than nuclear power plant workers. Yet unlike hospital radiologic technicians or nuclear staff, aircrews and frequent travelers are rarely provided personal dosimetry badges or accessible logging software.

### Local Queens & NY-06 Relevance
Queens is home to two of the busiest international air hubs in the world: **John F. Kennedy International Airport (JFK)** and **LaGuardia Airport (LGA)**. Thousands of commercial pilots, flight attendants, ground technicians, and frequent travelers live directly in New York's 6th Congressional District (Forest Hills, Elmhurst, Flushing, Bayside). AeroDose directly serves this community by connecting abstract atmospheric physics to the everyday health and safety of local aviation families.

### Advocacy Through Action
AeroDose includes an integrated **Civic Action Kit** (`ActionKit.jsx`). Users can translate their personal flight dose total into a formal, structured letter to their Member of Congress or airline occupational safety committee, advocating for standardized in-flight dosimetry reporting and transparency.

---

## 🛠️ Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Framework** | React 19 + Vite 8 | Ultra-fast client-side reactive interface |
| **Styling** | Tailwind CSS v4 + Vanilla CSS | Dark mode design system with custom CSS tokens |
| **Data Visualization** | Recharts | Responsive SVG dose-rate elevation profile charts |
| **Mapping Engine** | Leaflet + React Leaflet | Dual-layer basemap (CARTO Dark Matter with automatic fallback to Esri World Dark Gray Canvas) |
| **Icons** | Lucide React | Modern, accessible iconography |
| **Live Space Weather** | NOAA SWPC API | Real-time 10.7 cm solar flux (`useLiveF107.js`) with offline caching |
| **Testing Harness** | Node.js Test Runner (`node --test`) | 36 automated unit, physics, and accuracy tests |
| **Linter** | Oxlint | Sub-millisecond linting and code quality validation |
| **PWA** | Web App Manifest + Service Worker ready | Installable on iOS, Android, and Desktop |
| **Deployment** | Vercel | Global edge CDN hosting with zero server infrastructure |

---

## 🚀 Running Locally

```bash
# 1. Clone repository
git clone https://github.com/jakelee2029/aerodose.git
cd aerodose

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in your browser.

**To test on a mobile device on the same local Wi-Fi:**
```bash
npm run dev -- --host
```

### Optional Environment Variables

To use CARTO Dark Matter basemap tiles without an attribution watermark:
```bash
cp .env_example .env
# Add your key to .env:
# VITE_CARTO_API_KEY=your_key_here
```
*(If no key is configured, AeroDose automatically falls back to Esri Dark Canvas with zero configuration).*

### Testing & Validation Suite

```bash
# Run all 36 automated test suites (physics, scenarios, letters, CARI-7 validation)
npm test

# Print detailed flight-by-flight CARI-7 accuracy report
npm run validate

# Run parameter calibration and leave-one-out cross validation
npm run calibrate

# Run linter
npm run lint
```

---

## 📱 PWA Installation

AeroDose is fully installable as an offline-capable Progressive Web App:
- **Android / Chrome** → Menu (⋮) → *Add to Home screen* / *Install app*
- **iPhone / Safari** → Share button (⎋) → *Add to Home Screen*
- **Desktop (Chrome/Edge)** → Click the install icon (⊕) in the URL address bar

---

## 📁 Project Structure

```
aerodose/
├── public/
│   ├── manifest.json              # PWA manifest
│   ├── icon-192.png               # App icon (192x192)
│   └── icon-512.png               # App icon (512x512)
├── src/
│   ├── assets/                    # Static brand assets
│   ├── components/
│   │   ├── ActionKit.jsx          # Civic advocacy & representative letter generator
│   │   ├── AirportField.jsx       # Airport auto-complete & IATA search input
│   │   ├── AppHeader.jsx          # Global brand header with status indicators
│   │   ├── FlightLog.jsx          # "My year in the air" browser-persisted dose log
│   │   ├── FlightParameters.jsx   # Flight inputs, cruise altitude & solar controls
│   │   ├── Hero.jsx               # Problem definition & atmospheric shield introduction
│   │   ├── ImpactPanel.jsx        # Radiobiology briefings & occupational safety context
│   │   ├── LocalFlights.jsx       # Queens (JFK & LGA) popular routes quick-picker
│   │   ├── RouteMapEnterprise.jsx # Multi-basemap Leaflet map with Viridis colormap
│   │   ├── Scenarios.jsx          # Pre-built occupational & travel exposure personas
│   │   └── TelemetryPanel.jsx     # Results dashboard: KPIs, comparison meter, charts
│   ├── data/
│   │   ├── airports.js            # Comprehensive airport database (IATA + coordinates)
│   │   └── presets.js             # Local flight route definitions (JFK/LGA)
│   ├── hooks/
│   │   └── useLiveF107.js         # Real-time NOAA SWPC solar flux polling hook
│   ├── physics/
│   │   ├── calculator.js          # Core dose calculation & climb/descent integrator
│   │   ├── doseModel.js           # Altitude, geomagnetic cutoff & solar models
│   │   ├── greatCircle.js         # Geodesic 40-waypoint generation
│   │   └── scenarios.js           # Occupational schedule & persona dosimetry models
│   ├── utils/
│   │   └── letter.js              # Template engine for civic letters to Congress/airlines
│   ├── App.jsx                    # Primary application shell & workbench layout
│   └── index.css                  # Design system tokens, AAA contrast & typography
├── tests/
│   ├── physics.test.js            # Altitude, latitude, and solar flux unit tests
│   ├── scenarios.test.js          # Persona dosimetry & letter generation tests
│   └── validation.test.js         # Automated FAA CARI-7 regression tests
├── validation/
│   ├── calibrate.mjs              # Least-squares regression & leave-one-out analyzer
│   ├── cari7_reference.json       # FAA AC 120-61B Table 2 benchmark dataset (27 flights)
│   ├── compare.js                 # Statistical comparison engine (MAE, bias, error)
│   └── run.mjs                    # CLI runner for `npm run validate`
├── .env_example                   # Template for optional API credentials
├── AI_USAGE_LOG.md                # Comprehensive AI disclosure log (Congressional App Challenge)
├── package.json                   # Dependencies & npm script definitions
└── vercel.json                    # Edge deployment configuration
```

---

## 🤖 AI Disclosure

This project was developed with AI assistance (code scaffolding, design iterations, and test harness assembly) in accordance with Congressional App Challenge guidelines. All scientific citations, physics models, calibration logic, and final reviews were directed and verified by Jake Lee.

See [AI_USAGE_LOG.md](AI_USAGE_LOG.md) for the complete disclosure log and division of work.

---

## 📄 License

MIT - see [LICENSE](LICENSE)

