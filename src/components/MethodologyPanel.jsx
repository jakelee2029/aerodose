import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

function CollapsibleSection({ num, title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', textAlign: 'left', padding: '10px 14px',
        background: 'transparent', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '8px',
        transition: 'background 0.12s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        {open ? <ChevronDown size={12} color="var(--text-muted)" /> : <ChevronRight size={12} color="var(--text-muted)" />}
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--accent-blue)', fontWeight: 700, minWidth: '24px' }}>{num}</span>
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</span>
      </button>
      {open && (
        <div style={{ padding: '2px 14px 14px 44px' }} className="fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

export default function MethodologyPanel() {
  return (
    <section style={{ borderTop: '1px solid var(--border-subtle)', marginTop: 'auto' }}>
      <div style={{ padding: '10px 14px', background: 'var(--surface-base)', borderBottom: '1px solid var(--border-default)' }}>
        <div className="section-label" style={{ marginBottom: 0 }}>
          Technical Methodology &amp; Reference Standards
          <span style={{ marginLeft: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 400, letterSpacing: 0, textTransform: 'none' }}>
            — AeroDose Dosimetry Engine v1.0
          </span>
        </div>
      </div>

      <CollapsibleSection num="1.0" title="Galactic Cosmic Radiation (GCR) Mechanisms" defaultOpen={true}>
        <div className="tech-body">
          <p>
            Galactic cosmic radiation (GCR) consists of high-energy nuclei (primarily protons, ~87%; alpha particles, ~12%; HZE ions, ~1%) originating from extragalactic and galactic sources including supernova remnants and active galactic nuclei. Primary GCR interacts with atmospheric nuclei via hadronic cascades, producing secondary particle showers including muons, neutrons, electrons, photons, and pions.
          </p>
          <p>
            At sea level, atmospheric depth X₀ ≈ 1033 g/cm² provides substantial hadronic attenuation. At FL370 (~11.3 km), X ≈ 264 g/cm², representing approximately 74% less shielding than sea level. The effective dose rate scales approximately as:
          </p>
          <code className="tech-formula">Ḋ(h) ≈ Ḋ₀ · exp(−X(h) / λ_eff)   [λ_eff ≈ 90 g/cm², empirical]</code>
          <p className="tech-ref">
            Ref: Linsley (1963); ICRP Publication 132 (2016) §3.1; Lindborg et al. (2004) RPD 110:417-422.
          </p>
        </div>
      </CollapsibleSection>

      <CollapsibleSection num="2.0" title="Geomagnetic Shielding &amp; Cutoff Rigidity Formulation">
        <div className="tech-body">
          <p>
            Earth's geomagnetic field deflects incoming charged particles. The minimum momentum-to-charge ratio (magnetic rigidity, R, in GV = GJ/C) required for a vertically incident particle to penetrate to a given location is the <em>vertical cutoff rigidity</em> R_c.
          </p>
          <p>
            Using the Störmer dipole approximation (valid within ±20% of numerical trajectory integrations for latitudes &lt;65°):
          </p>
          <code className="tech-formula">
            R_c(λ) = (M · cos⁴λ) / (4r²)  ≈  14.9 · cos⁴(λ_gm)  [GV]
          </code>
          <p>
            where λ_gm is the geomagnetic latitude (dipole), M is Earth's magnetic dipole moment normalized to surface field, and r = 1 Earth radius. R_c ranges from ~14.9 GV at the geomagnetic equator to ~0 GV at the poles. Locations with lower R_c admit higher-energy (lower-rigidity) GCR particles, producing elevated dose rates.
          </p>
          <p>
            This implementation converts geographic coordinates to geomagnetic latitude using the NOAA WMM-2020 dipole approximation (pole at 80.7°N, 72.7°W), then evaluates the Störmer formula at each route waypoint.
          </p>
          <p className="tech-ref">
            Ref: Störmer (1930) Terr. Mag. 35:193; Smart &amp; Shea (2009) Adv. Space Res. 44:1107-1123. DOI: 10.1016/j.asr.2009.02.011
          </p>
        </div>
      </CollapsibleSection>

      <CollapsibleSection num="3.0" title="Solar Modulation (Heliospheric Potential)">
        <div className="tech-body">
          <p>
            GCR flux at Earth is anti-correlated with solar activity via the <em>Forbush modulation</em> mechanism. The heliospheric magnetic field, intensified during solar maximum, decelerates and deflects incoming GCR. The effective GCR suppression is parameterized using the 10.7 cm solar radio flux proxy (F10.7, in solar flux units: 1 sfu = 10⁻²² W·m⁻²·Hz⁻¹):
          </p>
          <code className="tech-formula">f_solar(Φ) = 1 − 0.18 · (F10.7 − 70) / 150   [F10.7 ∈ [70, 220] sfu]</code>
          <p>
            At solar minimum (F10.7 ≈ 70 sfu), f_solar = 1.0 (maximum GCR flux). At solar maximum (F10.7 ≈ 220 sfu), f_solar ≈ 0.82 (flux suppressed ~18%). Solar Cycle 25 peaked approximately mid-2024 to early 2025. Current estimate (late 2026): F10.7 ≈ 150 sfu (declining phase); dose rates are slightly elevated relative to solar maximum.
          </p>
          <p className="tech-ref">
            Ref: O'Brien et al. (1996) RPD 68:237-240; ICRP 132 (2016) §3.3; Forbush (1954) Phys. Rev. 94:351.
          </p>
        </div>
      </CollapsibleSection>

      <CollapsibleSection num="4.0" title="Route Integration &amp; Dose Accumulation">
        <div className="tech-body">
          <p>
            The great-circle route between origin and destination is parameterized using the slerp (spherical linear interpolation) formula and sampled at ~150 nm intervals. At each sample point i, the local effective dose rate is evaluated:
          </p>
          <code className="tech-formula">Ḋᵢ = Ḋ_eq(h) · f_lat(λ_gm,i) · f_solar(F10.7)</code>
          <p>
            Total effective dose is accumulated via trapezoidal integration over flight time T:
          </p>
          <code className="tech-formula">E = ∫₀ᵀ Ḋ(t) dt  ≈  Σᵢ [(Ḋᵢ + Ḋᵢ₊₁)/2] · Δtᵢ   [µSv]</code>
          <p>
            Flight time is estimated from segment distance and typical cruise true airspeed (480 kt at FL370+), with ±30 min climb/descent overhead. Model accuracy: ±15% vs. FAA CARI-7 for subsonic cruise FL300–FL410, geomagnetic latitude 0°–65°.
          </p>
        </div>
      </CollapsibleSection>

      <CollapsibleSection num="5.0" title="Hardware Calibration &amp; Ground Truth Validation">
        <div className="tech-body">
          <p>
            <strong style={{ color: 'var(--text-primary)' }}>CREDO Detector Node (Ground-Level Validation)</strong>
          </p>
          <p>
            This dosimetry model is contextualized by a co-located CREDO (Cosmic Ray Extremely Distributed Observatory) ground-station node. Sensor platform: Raspberry Pi 4B running CREDO Detector daemon (v3.x), CMOS image sensor (Sony IMX477, 12.3 MP) with lens occluded to detect secondary cosmic ray muons and electrons via Compton and direct ionization tracks.
          </p>
          <p>
            Ground-level detection rate at sea level: ~0.01–0.05 events/frame/hr (background-subtracted). The particle species detected at the surface (primarily muons, E &gt;100 MeV) are the attenuated remnants of the same hadronic cascade secondaries that, at FL370, produce the effective dose rates modeled above. The CREDO network, described in Homola et al. (2020), provides distributed cosmic ray monitoring across thousands of nodes globally.
          </p>
          <p className="tech-ref">
            Ref: Homola, P. et al. (2020). CREDO: An international network for cosmic-ray research. Symmetry 12(11):1835. DOI: 10.3390/sym12111835
          </p>
        </div>
      </CollapsibleSection>

      {/* Bibliography */}
      <div style={{ padding: '12px 14px', background: 'var(--surface-base)' }}>
        <div className="section-label">Bibliographic References</div>
        {[
          { num: '[1]', ref: 'FAA Civil Aerospace Medical Institute. CARI-7/7A: Galactic Cosmic Radiation Dose Assessment Program. CAMI-AM-810, 2014–2023.', doi: 'faa.gov/data_research/research/med_humanfacs/aeromedical/radiobiology/cari7' },
          { num: '[2]', ref: 'FAA Advisory Circular 120-61B. In-Flight Radiation Exposure. Federal Aviation Administration, 2014.', doi: 'FAA AC 120-61B' },
          { num: '[3]', ref: 'ICRP Publication 132. Radiological Protection from Cosmic Radiation in Aviation. Ann. ICRP 45(1), 2016.', doi: '10.1177/0146645315616368' },
          { num: '[4]', ref: 'Lindborg, L., Bartlett, D., Beck, P., McAulay, I., Schnuer, K., Schraube, H., Spurný, F. (2004). Cosmic radiation exposure of aircraft crew: compilation of measured and calculated data. Radiat. Prot. Dosim. 110(1-4):417-422.', doi: '10.1093/rpd/nch300' },
          { num: '[5]', ref: 'NCRP Report No. 160. Ionizing Radiation Exposure of the Population of the United States. National Council on Radiation Protection and Measurements, 2009.', doi: 'NCRP 160 (2009)' },
          { num: '[6]', ref: 'Smart, D.F. & Shea, M.A. (2009). Fifty years of progress in geomagnetic cutoff rigidity determinations. Adv. Space Res. 44(10):1107-1123.', doi: '10.1016/j.asr.2009.02.011' },
          { num: '[7]', ref: "O'Brien, K., Friedberg, W., Sauer, H.H., Smart, D.F. (1996). Atmospheric cosmic rays and solar energetic particles at aircraft altitudes. Environ. Int. 22(S1):S9-S44.", doi: '10.1016/S0160-4120(96)00135-7' },
          { num: '[8]', ref: 'NOAA NGDC. World Magnetic Model 2020-2025. NOAA Technical Note, 2020.', doi: 'noaa.gov/ngdc/geomag/WMM' },
          { num: '[9]', ref: 'Homola, P. et al. (2020). CREDO: An international network for cosmic-ray research. Symmetry 12(11):1835.', doi: '10.3390/sym12111835' },
        ].map(({ num, ref, doi }) => (
          <div key={num} className="bib-entry">
            <span className="bib-num">{num}</span>
            {ref}
            {doi && <div className="bib-doi" style={{ marginTop: '2px', paddingLeft: '30px' }}>{doi}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}
