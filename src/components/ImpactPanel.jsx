import { useEffect, useRef, useState } from 'react';
import { Plane, Globe2 } from 'lucide-react';

/* Typography contract for this section (WCAG 2.1 AAA, contrast ≥ 7:1 on surface-1 #161B22):
   - body copy:      text-fg-soft  #C9D1D9  (≈11:1)
   - headings/values: text-fg      #F0F6FC  (≈15:1)
   - accent text:    *-text tokens #79C0FF / #E3B341 / #56D364 / #FFA198 (all ≥ 7:1)
   No text-fg-muted (#8B949E, AA only) is used here. */

function useReveal() {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setShown(true); return; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShown(true); io.disconnect(); }
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, shown];
}

const BADGE_TONES = {
  danger:  'border-danger-text text-danger-text',
  caution: 'border-caution-text text-caution-text',
  safe:    'border-safe-text text-safe-text',
};

function Badge({ tone, children }) {
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${BADGE_TONES[tone]}`}>{children}</span>
  );
}

function Card({ icon: Icon, badge, tone, title, delay, children }) {
  const [ref, shown] = useReveal();
  return (
    <article ref={ref} className={`impact-card${shown ? ' impact-card-in' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <Icon size={20} className={BADGE_TONES[tone].split(' ')[1]} aria-hidden="true" />
        <Badge tone={tone}>{badge}</Badge>
      </div>
      <h3 className="mb-2 text-base font-medium leading-snug text-fg">{title}</h3>
      <div className="tech-body">{children}</div>
    </article>
  );
}

/** Atmospheric shielding vs. altitude: two-column comparison. */
function ShieldComparison() {
  const cols = [
    { label: 'Sea level', big: '1,033', unit: 'g/cm² of air above you', pct: 100, bar: 'bg-safe', note: 'Blocks nearly all cosmic particles' },
    { label: '37,000 ft', big: '264', unit: 'g/cm² of air above you', pct: 26, bar: 'bg-danger', note: 'About 74% less shielding' },
  ];
  return (
    <div className="my-4 grid grid-cols-2 gap-3" role="group" aria-label="Atmospheric shielding at sea level versus 37,000 feet">
      {cols.map(c => (
        <div key={c.label} className="rounded-ctl border border-line bg-canvas p-3">
          <div className="text-sm font-semibold text-fg">{c.label}</div>
          <div className="mono mt-1 text-2xl font-semibold text-fg">{c.big}</div>
          <div className="text-sm text-fg-soft">{c.unit}</div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2" role="presentation">
            <div className={`h-full ${c.bar}`} style={{ width: `${c.pct}%` }} />
          </div>
          <div className="mt-2 text-sm text-fg-soft">{c.note}</div>
        </div>
      ))}
    </div>
  );
}

const SOURCES = [
  { label: 'FAA CARI-7 dose calculator', href: 'https://www.faa.gov/data_research/research/med_humanfacs/aeromedical/radiobiology/cari7' },
  { label: 'ICRP Publication 132: Cosmic radiation in aviation', href: 'https://doi.org/10.1177/0146645315616368' },
  { label: 'CREDO cosmic-ray network (Homola et al., 2020)', href: 'https://doi.org/10.3390/sym12111835' },
];

export default function ImpactPanel() {
  return (
    <section id="impact" className="border-t border-line bg-canvas">
      <div className="impact-wrap">
        <header className="mb-6 max-w-[70ch]">
          <h2 className="text-2xl font-semibold text-fg">Why every microsievert matters</h2>
          <p className="tech-body mt-2">
            Every flight crosses a shower of particles from exploded stars. You can't see or feel it,
            but it adds up for the people who fly the most, and it is easy to measure once you know where to look.
          </p>
        </header>

        <div className="impact-two">
          <Card icon={Plane} badge="Health impact" tone="danger" title="Thinner sky, thinner shield" delay={0}>
            <p>
              At ground level, a thick blanket of air stops most cosmic particles. At cruise altitude most of that
              blanket is gone, and dose rates rise to roughly 30 to 150 times the ground-level rate, depending on latitude. Cabin walls do little to stop particles this energetic.
            </p>
            <ShieldComparison />
            <p>
              For an occasional traveler this is tiny. For pilots, flight attendants and frequent flyers, small
              amounts add up year after year, which is why aviation health agencies track it.
            </p>
          </Card>

          <Card icon={Globe2} badge="Civic equity" tone="caution" title="Your route decides your dose" delay={120}>
            <p>
              Earth's magnetic field shields the equator best and the poles least. Two flights of the same length
              can deliver noticeably different doses depending on how far north they travel and how active the Sun is.
            </p>
            <p>
              A transpolar crew member and a short-haul one are not flying through the same sky. Route-level numbers,
              not a single global average, make fair decisions possible for crew scheduling and for pregnant crew, who face a lower recommended limit.
            </p>
            <p>
              Pick your nearest airport in <a href="#local-title">Flights from my area</a> to compare routes from your community.
            </p>
          </Card>
        </div>

        <div className="impact-two">
          <section className="impact-card impact-card-in" aria-labelledby="why-track">
            <Badge tone="danger">Why it matters</Badge>
            <h3 id="why-track" className="mb-2 mt-3 text-base font-medium text-fg">Why do health agencies track this?</h3>
            <div className="tech-body">
              <p>
                Cosmic particles are <strong>ionizing radiation</strong>: they can damage DNA inside cells. Most damage
                is repaired, but a small amount can slightly raise lifetime cancer risk.
              </p>
              <ul className="impact-list">
                <li><strong>It adds up.</strong> Limits are about total dose over a year, not one flight. Crew can log hundreds of hours at altitude.</li>
                <li><strong>Small but real.</strong> Standard models estimate roughly a 1-in-18,000 added lifetime cancer risk per 1 mSv. One flight is a small fraction of that.</li>
                <li><strong>Pregnancy is more sensitive.</strong> The FAA recommends a lower limit (1 mSv for the whole pregnancy).</li>
                <li><strong>Solar storms</strong> can briefly raise doses on high-latitude routes.</li>
              </ul>
              <p>
                Agencies track dose because it is easy to measure and worth keeping low. Aircrew health is still being
                studied, and sleep disruption and UV play a part too.
              </p>
            </div>
          </section>

          <section className="impact-card impact-card-in" aria-labelledby="reduce-exposure">
            <Badge tone="safe">What you can do</Badge>
            <h3 id="reduce-exposure" className="mb-2 mt-3 text-base font-medium text-fg">How to lower your exposure</h3>
            <div className="tech-body">
              <p>
                Clothing, masks and seat choice can't block cosmic rays, and plane walls barely slow them. What works is
                choosing <em>how much</em> time you spend up high:
              </p>
              <ul className="impact-list">
                <li><strong>Fly less, or fly shorter.</strong> Dose scales with hours in the air, so a nonstop beats a multi-leg trip.</li>
                <li><strong>Pick lower-latitude routes</strong> when you can. Routes near the equator get more magnetic shielding than polar ones.</li>
                <li><strong>Track your yearly total</strong> in "My year in the air" against the 1 mSv guideline.</li>
                <li><strong>If you're pregnant or crew,</strong> talk to your doctor or employer about dose limits.</li>
              </ul>
              <p>For most travelers, a few flights a year is well within guidelines. This is about informed choices, not fear.</p>
            </div>
          </section>
        </div>

        <div className="tech-body mt-6 text-sm">
          <span className="mr-2 font-semibold text-fg">Sources:</span>
          {SOURCES.map((s, i) => (
            <span key={s.href}>
              <a href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>
              {i < SOURCES.length - 1 && ' · '}
            </span>
          ))}
          <p className="mt-1">Doses on this site come from a simplified model calibrated to the FAA's CARI-7 results (typical difference about 12%, individual flights up to about 35%). They are illustrations, not medical advice.</p>
        </div>
      </div>
    </section>
  );
}
