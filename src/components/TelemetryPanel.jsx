import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import RouteMapEnterprise from './RouteMapEnterprise.jsx';
import { Info } from 'lucide-react';

function fmt(n, d = 2) { return (n ?? 0).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }); }

/** Atmospheric depth in g/cm² at pressure altitude in feet (US Standard Atmosphere 1976, exponential approximation). */
function atmDepthGcm2(altFt) {
  const altKm = altFt * 0.0003048;
  const pHpa = 1013.25 * Math.exp(-altKm / 8.5);
  return +(pHpa * 1.0197).toFixed(1);
}

const ICRP_PUBLIC_USV = 1000;   // 1 mSv/yr — ICRP 103 §2

/** Plain-language verdict from the share of the yearly public limit used by this flight. */
function verdictFor(totalDoseUsv, annualPct) {
  const flightsToLimit = Math.floor(ICRP_PUBLIC_USV / totalDoseUsv);
  if (annualPct < 5) return {
    level: 'Low risk', tone: 'safe', headline: 'Nothing to worry about for this trip',
    body: `This flight uses ${annualPct}% of the yearly public guideline. It would take about ${flightsToLimit.toLocaleString()} similar flights in one year to reach it.`,
  };
  if (annualPct < 20) return {
    level: 'Moderate', tone: 'caution', headline: 'Fine once, worth tracking if you fly often',
    body: `This flight uses ${annualPct}% of the yearly public guideline. About ${flightsToLimit} like it in one year would reach the limit, which matters for frequent flyers and crew.`,
  };
  return {
    level: 'Elevated', tone: 'danger', headline: 'A big share of a year in a single trip',
    body: `This flight uses ${annualPct}% of the yearly public guideline. Frequent travelers on routes like this should keep a running total.`,
  };
}

const TONES = {
  safe:    { box: 'border-safe/40 bg-safe/10',       badge: 'status-nominal' },
  caution: { box: 'border-caution/40 bg-caution/10', badge: 'status-advisory' },
  danger:  { box: 'border-danger/40 bg-danger/10',   badge: 'status-alert' },
};

function AdvisoryBanner({ totalDoseUsv, totalDoseMsv, annualPct, onAddToLog }) {
  const v = verdictFor(totalDoseUsv, annualPct);
  const tone = TONES[v.tone];
  return (
    <section aria-labelledby="advisory-title" className={`rounded-card border p-5 ${tone.box}`}>
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="advisory-title" className="text-xl font-semibold text-fg">Should you be concerned?</h2>
        <span className={`status-badge ${tone.badge}`}>
          {v.level.toUpperCase()}: <span className="mono">{fmt(totalDoseMsv, 3)} mSv</span>
        </span>
      </div>
      <p className="mt-2 text-base font-medium text-fg">{v.headline}</p>
      <p className="mt-1 max-w-[70ch] text-[0.9375rem] leading-relaxed text-fg-soft">{v.body}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        {onAddToLog && (
          <button type="button" className="btn-ghost" onClick={onAddToLog}>Add to my year</button>
        )}
        <a href="#impact" className="text-[0.9375rem] font-medium text-brand-text">
          Why does flying add radiation? Find out ↓
        </a>
      </div>
    </section>
  );
}

/** One comparison meter: every reference dose and this flight on the same log-scaled track. */
function ComparisonMeter({ totalDoseUsv, bananas, xrays, bgHours }) {
  const MIN = 0.1, MAX = 2000;
  const pos = v => Math.max(2, Math.min(100, ((Math.log10(v) - Math.log10(MIN)) / (Math.log10(MAX) - Math.log10(MIN))) * 100));
  const rows = [
    { key: 'banana', label: 'One banana', value: 0.1, note: 'Natural potassium-40' },
    { key: 'ground', label: 'One day on the ground', value: 0.34 * 24, note: 'Natural background, sea level' },
    { key: 'xray',   label: 'One chest X-ray', value: 20, note: 'NCRP 160' },
    { key: 'flight', label: 'This flight', value: totalDoseUsv, note: 'Your estimate', highlight: true },
    { key: 'limit',  label: 'Yearly public limit', value: ICRP_PUBLIC_USV, note: 'ICRP 103: 1 mSv per year' },
  ].sort((a, b) => a.value - b.value);

  return (
    <section aria-labelledby="meter-title" className="panel p-5">
      <h2 id="meter-title" className="text-xl font-semibold text-fg">How does that compare?</h2>
      <p className="mt-1 text-[0.9375rem] text-fg-soft">
        About <strong className="font-semibold text-fg mono">{bananas.toLocaleString()}</strong> bananas,{' '}
        <strong className="font-semibold text-fg mono">{xrays}×</strong> a chest X-ray, or{' '}
        <strong className="font-semibold text-fg mono">{bgHours}</strong> hours of normal background radiation on the ground.
      </p>
      <ul className="mt-4 flex flex-col gap-3">
        {rows.map(r => (
          <li key={r.key} className="grid grid-cols-1 items-center gap-x-4 gap-y-1 sm:grid-cols-[13rem_1fr_6.5rem]">
            <div>
              <div className={`text-[0.9375rem] ${r.highlight ? 'font-semibold text-fg' : 'text-fg-soft'}`}>{r.label}</div>
              <div className="text-xs text-fg-muted">{r.note}</div>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-surface-2" role="presentation">
              <div className={`h-full rounded-full ${r.highlight ? 'bg-brand' : 'bg-line-strong'}`} style={{ width: `${pos(r.value)}%` }} />
            </div>
            <div className={`mono text-sm sm:text-right ${r.highlight ? 'font-semibold text-fg' : 'text-fg-soft'}`}>
              {fmt(r.value, r.value < 1 ? 2 : r.value < 100 ? 1 : 0)} µSv
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-fg-muted">Bars use a logarithmic scale: each step to the right is about 10× more radiation.</p>
    </section>
  );
}

function Kpi({ label, value, unit, sub, primary }) {
  return (
    <div className={`kpi-card${primary ? ' kpi-card--primary' : ''}`}>
      <span className="kpi-label">{label}</span>
      <span className="kpi-value">{value}{unit && <span className="kpi-unit"> {unit}</span>}</span>
      <span className="kpi-sub">{sub}</span>
    </div>
  );
}

function DoseTooltip({ active, payload, altFt }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-ctl border border-line-strong bg-surface-2 px-3 py-2 text-sm shadow-popover">
      <div className="mono font-semibold text-fg">{fmt(d.rate, 3)} µSv/hr</div>
      <dl className="mt-1 grid grid-cols-[auto_auto] gap-x-4 text-fg-soft">
        <dt>Distance</dt><dd className="mono text-right text-fg">{d.nm.toLocaleString('en-US')} nm</dd>
        <dt>Altitude</dt><dd className="mono text-right text-fg">{altFt.toLocaleString('en-US')} ft</dd>
        <dt>Geomagnetic lat.</dt><dd className="mono text-right text-fg">{fmt(d.geomagLat, 1)}°</dd>
      </dl>
    </div>
  );
}

export default function TelemetryPanel({ result, onAddToLog }) {
  if (!result) {
    return (
      <div id="telemetry-panel" className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-card border border-line">
          <Info size={22} className="text-fg-soft" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-semibold text-fg">Your results will appear here</h2>
        <p className="max-w-[48ch] text-[0.9375rem] text-fg-soft">
          Pick a quick-start route or choose an origin and destination, then select Calculate dose.
        </p>
      </div>
    );
  }

  const { totalDoseUsv, totalDoseMsv, flightTimeHr, distanceNm, avgDoseRateUsvHr, waypoints, altFt, solarF10_7 } = result;

  const bananas = Math.round(totalDoseUsv / 0.1);          // 0.1 µSv per banana (NCRP 160)
  const bgHours = +(totalDoseUsv / 0.34).toFixed(1);       // 0.34 µSv/hr at sea level (UNSCEAR 2008)
  const xrays = +(totalDoseUsv / 20).toFixed(2);           // 20 µSv per chest X-ray (NCRP 160)
  const annualPct = +(totalDoseUsv / ICRP_PUBLIC_USV * 100).toFixed(2);

  const maxDoseRate = Math.max(...waypoints.map(w => w.doseRate));
  const maxDoseRateWp = waypoints.find(w => w.doseRate === maxDoseRate);
  const xAtm = atmDepthGcm2(altFt);

  const chartData = waypoints.map(wp => ({
    nm: Math.round(wp.distFromOriginNm),
    rate: +wp.doseRate.toFixed(4),
    geomagLat: wp.geomagLat,
  }));

  return (
    <div id="telemetry-panel" className="fade-in flex flex-col gap-5 p-4">
      <AdvisoryBanner totalDoseUsv={totalDoseUsv} totalDoseMsv={totalDoseMsv} annualPct={annualPct}
        onAddToLog={onAddToLog ? () => onAddToLog(result) : undefined} />

      <ComparisonMeter totalDoseUsv={totalDoseUsv} bananas={bananas} xrays={xrays} bgHours={bgHours} />

      <section aria-labelledby="telemetry-title">
        <h2 id="telemetry-title" className="mb-3 text-xl font-semibold text-fg">Route telemetry</h2>
        <div className="kpi-grid">
          <Kpi primary label="Total effective dose" value={fmt(totalDoseUsv, 1)} unit="µSv"
            sub={`${fmt(totalDoseMsv, 4)} mSv · typically within ~12% of CARI-7`} />
          <Kpi label="Average dose rate" value={fmt(avgDoseRateUsvHr, 2)} unit="µSv/hr"
            sub="Averaged over the whole route" />
          <Kpi label="Peak dose rate" value={fmt(maxDoseRate, 2)} unit="µSv/hr"
            sub={maxDoseRateWp ? `At geomagnetic latitude ${fmt(maxDoseRateWp.geomagLat, 1)}°` : '—'} />
          <Kpi label="Flight time" value={fmt(flightTimeHr, 1)} unit="hr"
            sub={`${fmt(distanceNm, 0)} nm great-circle distance`} />
        </div>
        <p className="mt-3 text-[0.8125rem] text-fg-soft">
          Conditions: cruising at <span className="mono text-fg">{altFt.toLocaleString('en-US')} ft</span> with about{' '}
          <span className="mono text-fg">{fmt(xAtm, 0)} g/cm²</span> of air overhead; solar flux{' '}
          <span className="mono text-fg">{solarF10_7} sfu</span>.
        </p>
      </section>

      {/* Map and chart sit side by side on wide screens, stacked on tablets and phones */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <section aria-labelledby="map-title" className="flex min-w-0 flex-col">
        <h2 id="map-title" className="mb-3 text-xl font-semibold text-fg">Flight path</h2>
        <RouteMapEnterprise waypoints={waypoints} />
      </section>

      <section aria-labelledby="chart-title" className="flex min-w-0 flex-col">
        <h2 id="chart-title" className="mb-3 text-xl font-semibold text-fg">Dose rate along the route</h2>
        <div className="panel flex-1 px-3 pb-3 pt-4">
          <ResponsiveContainer width="100%" height={330}>
            <LineChart data={chartData} margin={{ top: 4, right: 16, left: 8, bottom: 24 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nm" tickLine={false} minTickGap={32} interval="preserveStartEnd" axisLine={{ stroke: '#484F58' }}
                tickFormatter={v => v.toLocaleString('en-US')}
                label={{ value: 'Distance flown (nautical miles)', position: 'insideBottom', offset: -14, fill: '#C9D1D9', fontSize: 13 }} />
              <YAxis tickLine={false} axisLine={{ stroke: '#484F58' }} width={64} domain={['auto', 'auto']}
                tickFormatter={v => v.toFixed(2)}
                label={{ value: 'Dose rate (µSv/hr)', angle: -90, position: 'insideLeft', offset: 0, style: { textAnchor: 'middle' }, fill: '#C9D1D9', fontSize: 13 }} />
              <Tooltip content={<DoseTooltip altFt={altFt} />} cursor={{ stroke: '#8B949E', strokeDasharray: '3 3' }} />
              <Line type="monotone" dataKey="rate" stroke="#388BFD" strokeWidth={2.5} dot={false}
                activeDot={{ r: 5, fill: '#388BFD', stroke: '#F0F6FC', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
      </div>
    </div>
  );
}
