# AI_USAGE_LOG.md — AeroDose
## Congressional App Challenge NY-06 · 2026

This document discloses all AI tool usage in the development of AeroDose, per CAC requirements.
AI must not constitute the entirety of technical development; this log tracks the division of work.

**Last reviewed by Jake:** _(Jake must date-stamp before final submission)_

---

## Overview

AeroDose was developed by **Jake** with AI-assisted scaffolding. AI (Antigravity IDE / Claude) was
used as a build-accelerator — analogous to a powerful IDE, operating at the architectural level.
All physics understanding, scientific sourcing, design decisions, and final review are Jakes responsibility.

---

## Phase 1 — Physics & Data Foundation

| Component | Who | Notes |
|---|---|---|
| Selected FAA CARI-7 as authoritative dose model | Jake | Jake knew this from CREDO work and Homola/Wozniak EPJ paper |
| Read ICRP Publication 132 source material | Jake | Jake reviewed the ICRP 132 summary |
| Altitude dose-rate lookup table | AI-scaffolded | Compiled from Lindborg 2004 and published CARI-7 comparisons |
| Geomagnetic latitude conversion | AI-scaffolded | Standard dipole approx (NOAA WMM); Jake verified |
| Latitude enhancement factor (1.0 to 2.05) | AI-scaffolded | Fitted to ICRP 132 sec 3.2; Jake verified against source |
| Solar modulation factor | AI-scaffolded | ICRP 132 sec 3.3; Jake reviewed |
| Great-circle route math | AI-scaffolded | Standard spherical geometry; Jake understood the math |

---

## Phase 2 — Core App Build

| Component | Who | Notes |
|---|---|---|
| React + Vite + Tailwind setup | AI-scaffolded | Standard scaffold |
| Airport database (IATA + coordinates) | AI-scaffolded | OurAirports.com public domain data |
| Airport search UI | AI-scaffolded | Jake specified UX requirements |
| Dose calculator integration | AI-scaffolded | Jake specified inputs/outputs |
| Context comparisons (X-rays, bananas, etc.) | AI-scaffolded | Citations verified by Jake |
| Physics explanation panel | AI-scaffolded draft, Jake edits | Jake must read, verify, and edit |
| Leaflet route map | AI-scaffolded | Jake specified color-coding by dose rate |
| Recharts dose-rate chart | AI-scaffolded | Jake specified axes |

---

## What Jake Must Do Before Submission

- [ ] Read every cited source (ICRP 132, FAA AC 120-61B, NCRP 160, Lindborg 2004)
- [ ] Verify dose rate table values against Lindborg 2004
- [ ] Edit the Physics panel into your own words
- [ ] Test multiple routes and sanity-check results
- [ ] Record the demo video
- [ ] Write CAC written responses (inspiration, challenges, learned, 2.0 version)
- [ ] Review and sign off on this AI_USAGE_LOG.md

---

## Tools Used

- Antigravity IDE / Claude Sonnet — code scaffolding, physics research compilation
- Vite, React, Tailwind CSS, Recharts, Leaflet

---

## Non-AI Sources

- FAA CARI-7: https://www.faa.gov/data_research/research/med_humanfacs/aeromedical/radiobiology/cari7
- FAA Advisory Circular 120-61B
- ICRP Publication 132 (2016)
- Lindborg et al. (2004) Radiat. Prot. Dosim. 110:417-422
- NCRP Report No. 160 (2009)
- NOAA NGDC World Magnetic Model 2020-2025
- OurAirports.com (public domain)
- Homola & Wozniak (2020) EPJ Special Topics (CREDO)
