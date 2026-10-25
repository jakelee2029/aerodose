# AI_USAGE_LOG.md — AeroDose
## Congressional App Challenge 2026 · District NY-06 · Jake Lee

This document discloses all Artificial Intelligence tool usage in the development of **AeroDose**, in accordance with Congressional App Challenge submission guidelines and academic integrity standards. 

Per competition rules, AI tools did not constitute the entirety of technical development. AI was utilized as an intelligent developer accelerator and architecture sounding board—analogous to a high-powered IDE and pair-programmer. All scientific evaluation, physics equations, mathematical model verification, calibration against FAA data, design direction, civic letter drafting, and code audits were directed, verified, and finalized by **Jake Lee**.

---

## 1. Overview & Human vs. AI Responsibility

| Domain | Jake Lee (Student Developer) | AI Assistance (Antigravity IDE / Claude / Gemini) |
|---|---|---|
| **Problem Definition** | Conceptualized bringing cosmic radiation transparency (historically limited to aircrew under FAA AC 120-61B) to public airline passengers. | Suggested UI breakdown into educational, telemetry, and civic engagement panels. |
| **Scientific Foundations** | Researched and selected FAA CARI-7, ICRP 132, Lindborg 2004, and NCRP 160 as the authoritative scientific benchmarks. | Compiled raw data points into structured lookup matrices and formulas. |
| **Physics & Math Calibration** | Discovered the initial model was ~92% too high vs. FAA CARI-7; directed numerical calibration (cruise scale 0.295, polar factor 3.9, 12-substep climb/descent profile). | Assisted in drafting calibration scripts (`calibrate.mjs`) and calculating leave-one-out cross-validation statistics. |
| **Frontend & UI/UX** | Directed design system (dark navy theme, Viridis color-blind safe trajectory gradient, plain-language risk banners, logarithmic comparison scales). | Scaffolded React 19 / Tailwind v4 component structures, JSX markup, and CSS design tokens. |
| **Testing & Quality Assurance** | Defined the test cases and required tolerance criteria ($\pm 15\%$ target on flights $\ge 3$ hours); reviewed all 36 automated tests. | Scaffolded test runner files using Node.js native test suite (`node --test`). |
| **Presentation & Submission** | Structured the 3-minute video narrative, wrote speaking notes, recorded demonstration footage, and finalized CAC submission answers. | Generated visual deck layouts (PPTX/Google Slides) and assisted with teleprompter timing formatting. |

---

## 2. Granular Development Breakdown by Phase

### Phase 1 — Scientific Grounding & Physics Model
| Component / Task | Lead / Contributor | Details & Division of Labor |
|---|---|---|
| Authoritative Model Selection | **Jake** | Selected FAA CARI-7 & ICRP Publication 132 after reviewing radiobiology literature (CREDO project & Homola/Wozniak). |
| Altitude Dose-Rate Curve | **AI scaffold, Jake verified** | Digitized Lindborg et al. (2004) table (0 to 50,000 ft); Jake confirmed base rates against published literature. |
| Geomagnetic Coordinate Transform | **AI scaffold, Jake verified** | Implemented spherical geomagnetic dipole coordinate transform using NOAA WMM 2020 pole coordinates (80.7°N, 72.7°W). |
| Latitude Enhancement Factor ($f_{\text{lat}}$) | **AI scaffold, Jake verified** | Modeled smooth transition from equator to geomagnetic polar factor (up to 3.9), constrained to fade toward sea level. |
| Solar Modulation Function ($f_{\text{solar}}$) | **Jake verified** | Linear Forbush modulation based on 10.7 cm solar flux ($F_{10.7}$), verified against ICRP 132 §3.3. |
| Geodesic Route Waypoints | **AI scaffold** | Haversine distance and great-circle spherical intermediate waypoint interpolation sampled every 150 nautical miles. |

### Phase 2 — Calibration, Rigor & Automated Testing
| Component / Task | Lead / Contributor | Details & Division of Labor |
|---|---|---|
| FAA Benchmark Compilation | **Jake** | Transcribed CARI-7 calculated doses for 27 real nonstop flights from FAA Advisory Circular 120-61B, Table 2. |
| Error Discovery & Recalibration | **Jake (Direction) / AI (Scripting)** | Found first uncalibrated version was ~92% too high. Designed optimization to fit cruise scale (0.295) and polar factor (3.9). |
| Validation Suite (`npm run validate`) | **AI scaffold, Jake tested** | Built flight-by-flight comparative table comparing AeroDose predictions to CARI-7 doses with and without FAA air times. |
| Leave-One-Out Cross-Validation | **AI scaffold, Jake verified** | Executed leave-one-out analysis (12.7% mean error) proving model generalization on unseen flight pairs. |
| Automated Test Suite (`npm test`) | **AI scaffold, Jake verified** | Created 36 test assertions across `physics.test.js`, `scenarios.test.js`, and `validation.test.js`. |

### Phase 3 — User Interface & Civic Features
| Component / Task | Lead / Contributor | Details & Division of Labor |
|---|---|---|
| React 19 + Vite 8 Setup | **AI scaffold** | Initial project scaffolding with Tailwind CSS v4 and vanilla design tokens. |
| Airport Autocomplete & Search | **AI scaffold, Jake reviewed** | Public-domain airport database (~OurAirports) with instant IATA/city autocomplete. |
| Interactive Leaflet Route Map | **Jake (Design) / AI (Code)** | Leaflet map with Esri Dark Gray canvas and Viridis color ramp matching dose rate. |
| Recharts Dose Profile Chart | **Jake (Design) / AI (Code)** | Profile curve displaying dose rate (µSv/hr) versus flight distance (nm). |
| Live NOAA SWPC API Hook | **Jake / AI scaffold** | Custom React hook fetching daily measured 10.7 cm solar radio flux from NOAA Space Weather Prediction Center. |
| Comparative Risk Meter | **Jake / AI scaffold** | Sourced NCRP 160 and ICRP 103 equivalencies (chest X-rays, banana potassium-40 equivalent doses, daily background). |
| Civic Action Kit ("Take Action") | **Jake** | Drafted congressional and airline inquiry letter templates referencing 14 CFR § 120.109 and FAA AC 120-61B. |
| Local Log & Scenarios | **Jake (Logic) / AI (Code)** | Client-side `localStorage` running tally against 1 mSv public guideline; illustrative persona benchmarks. |

### Phase 4 — Presentation & Submission Deck
| Component / Task | Lead / Contributor | Details & Division of Labor |
|---|---|---|
| 3-Minute Video Script & Strategy | **Jake / AI consultation** | Crafted script ensuring strict adherence to all 6 CAC mandatory demonstration requirements. |
| Deck Generator Script (`build_deck.mjs`) | **AI scaffold, Jake edited** | Programmatic generation of 16:9 widescreen presentation deck (PPTX) and Google Slides script (`.gs`). |
| Shot List & Voiceover Pacing | **AI assistance, Jake executed** | Timed teleprompter script (396 spoken words, ~2:49 duration) and step-by-step browser recording shot list. |

---

## 3. Tool Inventory

### AI Systems
- **Antigravity IDE / Claude (Sonnet 3.5 & 3.7 / Opus) & Google Gemini:** Used for pair programming, architectural scaffolding, formula refactoring, and test script generation.

### Software, Frameworks & Libraries
- **Runtime & Languages:** Node.js, JavaScript (ES2024), JSX, HTML5, CSS3.
- **Frontend Framework:** React 19.2.8, Vite 8.3.0.
- **Styling:** Tailwind CSS 4.3.3, `@tailwindcss/vite`, custom CSS tokens.
- **Mapping & Charts:** Leaflet 1.9.4, React-Leaflet 5.0.0, Recharts 3.10.1.
- **Linters & Tooling:** Oxlint 1.81.0.
- **Hosting & Infrastructure:** Vercel Edge Network.

---

## 4. Primary Scientific & Reference Sources (Non-AI)
1. **Federal Aviation Administration (FAA):** CAMI CARI-7 / CARI-7A Computer Program.
2. **FAA Advisory Circular 120-61B:** *In-Flight Radiation Exposure* (2014) — Table 2 reference data.
3. **International Commission on Radiological Protection (ICRP):** Publication 132 (2016), *Radiological Protection from Cosmic Radiation in Aviation*.
4. **ICRP:** Publication 103 (2007), *The 2007 Recommendations of the International Commission on Radiological Protection*.
5. **Lindborg, L. et al. (2004):** *Cosmic Radiation Exposure of Aircraft Crew: Compilation of Experimental and Calculated Data*, Radiation Protection Dosimetry 110(1-4):417–422.
6. **National Council on Radiation Protection and Measurements (NCRP):** Report No. 160 (2009), *Ionizing Radiation Exposure of the Population of the United States*.
7. **National Oceanic and Atmospheric Administration (NOAA):** National Geophysical Data Center World Magnetic Model (WMM 2020–2025).
8. **NOAA Space Weather Prediction Center (SWPC):** Penticton 10.7 cm Solar Radio Flux real-time data service.
9. **OurAirports.com:** Public domain open airport coordinate database.
