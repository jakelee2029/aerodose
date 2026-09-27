const Cite = ({ children }) => (
  <span style={{
    display: 'inline-block',
    background: 'rgba(6,214,214,0.12)',
    border: '1px solid rgba(6,214,214,0.25)',
    borderRadius: '4px',
    padding: '1px 6px',
    fontSize: '0.78em',
    color: 'var(--accent-cyan)',
    fontWeight: 500,
    marginLeft: '4px',
    verticalAlign: 'middle',
    cursor: 'default',
  }} title={children}>[src]</span>
);

const Section = ({ icon, title, children }) => (
  <div style={{
    borderLeft: '3px solid var(--accent-blue)',
    paddingLeft: '20px',
    marginBottom: '28px',
  }}>
    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span>{icon}</span>{title}
    </h3>
    <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
      {children}
    </div>
  </div>
);

export default function PhysicsPanel() {
  return (
    <section id="physics-panel" style={{ marginBottom: '48px' }}>
      <div className="glass-card" style={{ padding: '36px' }}>
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            display: 'inline-block', background: 'rgba(155,93,229,0.12)',
            border: '1px solid rgba(155,93,229,0.25)', borderRadius: '8px',
            padding: '5px 14px', fontSize: '0.78rem', color: '#b07fef',
            fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '14px',
          }}>About the Physics</div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '8px' }}>
            Why Does Flying Expose You to Cosmic Radiation?
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}>
            This section explains the real physics behind the numbers — the same principles used by FAA researchers and the International Commission on Radiological Protection (ICRP).
          </p>
        </div>

        <Section icon="🌌" title="What are Cosmic Rays?">
          <p>
            Cosmic rays are high-energy particles — mostly protons and atomic nuclei — that travel at nearly the speed of light from distant supernovae, neutron stars, and other violent events in the universe. When they collide with molecules in Earth's upper atmosphere, they produce a shower of secondary particles (muons, neutrons, electrons, and gamma rays) that rain down toward the surface.
          </p>
          <br />
          <p>
            At sea level, the thick blanket of air above you absorbs most of this radiation. But at cruising altitude (35,000–40,000 ft), you're above about 75% of the Earth's atmosphere, so the shielding is dramatically reduced.
            <Cite>NCRP Report No. 160 (2009)</Cite>
          </p>
        </Section>

        <Section icon="🌍" title="Why Does Altitude Matter?">
          <p>
            The atmosphere acts as a radiation shield — the more air above you, the more secondary particles are stopped before they reach you. At FL350 (~10.7 km), the effective dose rate from galactic cosmic radiation is roughly <strong style={{color:'var(--accent-cyan)'}}>3–6 µSv/hr</strong>, compared to just ~0.03 µSv/hr at sea level — a factor of roughly 100×.
          </p>
          <br />
          <p>
            In this model, the altitude dependence uses reference dose rates validated against published CARI-7 program output.
            <Cite>FAA CARI-7A Documentation, Civil Aerospace Medical Institute</Cite>
            <Cite>Lindborg et al. (2004) Radiat. Prot. Dosim. 110:417–422</Cite>
          </p>
        </Section>

        <Section icon="🧲" title="Why Does Latitude Matter? (Geomagnetic Cutoff)">
          <p>
            Earth's magnetic field deflects charged cosmic ray particles — but its strength varies by location. Near the equator, the field lines are roughly horizontal and particles must cross a lot of field to penetrate, so fewer reach aircraft altitudes. Near the poles, field lines are nearly vertical, providing much less deflection.
          </p>
          <br />
          <p>
            This effect is quantified as the <em>geomagnetic cutoff rigidity</em> — the minimum momentum-to-charge ratio a particle needs to penetrate to a given location. The result: <strong style={{color:'var(--accent-cyan)'}}>dose rates at high latitudes (polar routes) are roughly twice those at the equator</strong> at the same altitude.
            <Cite>ICRP Publication 132 (2016), Section 3.2</Cite>
          </p>
          <br />
          <p>
            This is why a New York–London route (high latitude, arcing near Greenland) gives more radiation than a Miami–Mexico City route of similar length. AeroDose computes the geomagnetic latitude at each point along the great-circle route and weights the dose accordingly.
          </p>
        </Section>

        <Section icon="☀" title="Why the Solar Cycle Matters">
          <p>
            The Sun has an 11-year activity cycle. During solar maximum, the solar wind is stronger and carries an enhanced magnetic field that deflects incoming galactic cosmic rays — reducing dose rates by about 15–20%. During solar minimum, the shielding weakens and GCR flux increases.
          </p>
          <br />
          <p>
            We are currently in Solar Cycle 25, which peaked around 2024–2025. As of late 2026, activity is declining from maximum, so dose rates are currently <em>slightly higher than they were at the peak</em> and trending toward the next minimum.
            <Cite>ICRP 132 (2016), Section 3.3</Cite>
            <Cite>O'Brien et al. (1996) Radiat. Prot. Dosim. 68:237</Cite>
          </p>
        </Section>

        <Section icon="📐" title="About This Model">
          <p>
            AeroDose uses an analytical approximation that reproduces published FAA CARI-7 results within approximately ±15% for typical subsonic commercial flight conditions. The model was parameterized against:
          </p>
          <ul style={{ marginTop: '10px', paddingLeft: '20px', lineHeight: 2 }}>
            <li>Lindborg, L. et al. (2004). <em>Cosmic radiation exposure of aircraft crew: compilation of measured and calculated data.</em> Radiat. Prot. Dosim. 110(1-4):417–422.</li>
            <li>FAA Advisory Circular 120-61B — <em>In-Flight Radiation Exposure</em></li>
            <li>ICRP Publication 132 (2016) — <em>Radiological Protection from Cosmic Radiation in Aviation</em></li>
            <li>NCRP Report No. 160 (2009) — reference dose values</li>
          </ul>
          <br />
          <p>
            For regulatory purposes, use the official <strong>FAA CARI-7</strong> software. AeroDose is an educational estimator built to explain the physics — all approximations are labeled as such.
          </p>
        </Section>

        {/* CREDO connection */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(59,142,243,0.08) 0%, rgba(155,93,229,0.08) 100%)',
          border: '1px solid rgba(59,142,243,0.2)',
          borderRadius: '12px', padding: '24px', marginTop: '8px',
        }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '2rem', flexShrink: 0 }}>🔬</div>
            <div>
              <h3 style={{ fontWeight: 700, marginBottom: '8px', fontSize: '1rem' }}>Connected to Real Detector Data</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, fontSize: '0.92rem' }}>
                This project was inspired by running a live CREDO (Cosmic Ray Extremely Distributed Observatory) detector — a Raspberry Pi node with a modified phone camera sensor. The CREDO network, described in Homola & Woźniak (2020) <em>Eur. Phys. J. Special Topics</em>, uses distributed smartphones and single-board computers worldwide to detect secondary cosmic ray particles at ground level. The detector counts that come in from that node are the same secondary particles that, at 35,000 feet, would be delivering the doses this app calculates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
