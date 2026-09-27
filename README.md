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
| **Total effective dose** | µSv and mSv, with FAA CARI-7 ±15% uncertainty |
| **Plain-language summary** | Banana equivalents 🍌, chest X-rays 🏥, background hours 🌍, % of annual limit 📋 |
| **Dose rate profile chart** | µSv/hr vs. flight distance (nm) |
| **Great-circle route map** | Color-coded blue→amber by dose rate intensity |
| **Waypoint trajectory table** | Lat, lon, geomagnetic latitude, cutoff rigidity, atmospheric depth at each segment |
| **Regulatory thresholds** | ICRP aircrew limit (20 mSv/yr), public limit (1 mSv/yr) |
| **Physics methodology** | Full collapsible panel with equations, citations, and bibliography |

---

## 🔬 Physics Model

The dose calculation is an analytical parameterization of the **FAA CARI-7/7A** model, accurate to ±~15% of full Monte Carlo results.

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
│   │   ├── MethodologyPanel.jsx  # Physics explainer
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
