import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import RouteMapEnterprise from './RouteMapEnterprise.jsx';
import { Info } from 'lucide-react';

function fmt(n, d = 2) { return (n ?? 0).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }); }

/** Vertical cutoff rigidity (Störmer, dipole approximation)
 *  Rc(λ) ≈ 14.9 · cos⁴(λ) GV — lambda in radians
 *  Source: Störmer (1930); Smart & Shea (2009) Adv. Space Res. 44:1107
 */
function cutoffRigidityGV(geomagLatDeg) {
  const lam = Math.abs(geomagLatDeg) * Math.PI / 180;
  return +(14.9 * Math.pow(Math.cos(lam), 4)).toFixed(3);
}

/** Atmospheric depth in g/cm² at pressure altitude in feet.
 *  Uses US Standard Atmosphere 1976 exponential approximation.
 *  P(h) = 1013.25 · exp(−h/H), H = 8.5 km scale height
 *  X(h) = P(h) / g × 10  (hPa → g/cm²)
 */
function atmDepthGcm2(altFt) {
  const altKm = altFt * 0.0003048;
  const pHpa = 1013.25 * Math.exp(-altKm / 8.5);
  return +(pHpa * 1.0197).toFixed(1); // ×10 for g/cm², ×0.10197 hPa→g/cm² combined
}

const ICRP_CREW_USV   = 20000;  // 20 mSv/yr — FAA AC 120-61B
const ICRP_PUBLIC_USV = 1000;   // 1 mSv/yr — ICRP 103 §2
const CHEST_XRAY_USV  = 20;     // NCRP 160

function ThresholdRow({ label, value, max, color, tip, unit }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="threshold-row">
      <span className="tip-wrap threshold-label">
        {label}
        <span className="tip-box">{tip}</span>
      </span>
      <div className="threshold-track">
        <div className="threshold-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="threshold-pct">{fmt(pct, 2)}%</span>
    </div>
  );
}

export default function TelemetryPanel({ result }) {
  if (!result) {
    return (
      <div id="telemetry-panel" style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '60px 24px', flexDirection: 'column', gap: '12px',
      }}>
        <div style={{ width: '48px', height: '48px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Info size={20} color="var(--text-muted)" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>No profile loaded</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Select an origin, destination, and cruise altitude in the Flight Parameters panel, then execute the profile.
          </div>
        </div>
      </div>
    );
  }

  const { totalDoseUsv, totalDoseMsv, flightTimeHr, distanceNm, avgDoseRateUsvHr, waypoints, altFt, solarF10_7, context } = result;

  // ── Plain-English analogies ──────────────────────────────────────────────────
  // Banana Equivalent Dose: 1 banana ≈ 0.1 µSv (NCRP 160)
  const bananas = Math.round(totalDoseUsv / 0.1);
  // Background radiation at sea level: ~0.34 µSv/hr (UNSCEAR 2008)
  const bgHours = +(totalDoseUsv / 0.34).toFixed(1);
  // Chest X-ray: ~20 µSv (NCRP 160)
  const xrays = +(totalDoseUsv / 20).toFixed(2);
  // Annual public limit fraction: 1000 µSv/yr (ICRP 103)
  const annualPct = +(totalDoseUsv / 1000 * 100).toFixed(2);

  // Augment waypoints with Rc and atmospheric depth

  const augWps = waypoints.map(wp => ({
    ...wp,
    rc:   cutoffRigidityGV(wp.geomagLat),
    xAtm: atmDepthGcm2(altFt),
  }));

  const maxDoseRate = Math.max(...augWps.map(w => w.doseRate));
  const maxDoseRateWp = augWps.find(w => w.doseRate === maxDoseRate);
  const totalXAtm = atmDepthGcm2(altFt); // constant at cruise alt

  const chartData = augWps.map(wp => ({
    nm:   Math.round(wp.distFromOriginNm),
    rate: +wp.doseRate.toFixed(4),
    rc:   wp.rc,
  }));

  return (
    <div id="telemetry-panel" className="fade-in" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* ── PLAIN-ENGLISH SUMMARY ──────────────────────────────────────────────── */}
      <div className="plain-english-card" style={{
        background: 'linear-gradient(135deg, rgba(56,189,248,0.08) 0%, rgba(34,197,94,0.05) 100%)',
        border: '1px solid rgba(56,189,248,0.25)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
      }}>
        <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-blue)', letterSpacing: '0.08em', marginBottom: '10px', textTransform: 'uppercase' }}>
          ✦ What this means in plain language
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
          {[
            { emoji: '🍌', value: bananas.toLocaleString(), label: 'Banana equivalents', sub: '0.1 µSv each · NCRP 160' },
            { emoji: '🏥', value: `${xrays}×`, label: 'Chest X-ray equivalents', sub: '20 µSv per exam · NCRP 160' },
            { emoji: '🌍', value: `${bgHours} hrs`, label: 'Sea-level background', sub: '0.34 µSv/hr · UNSCEAR 2008' },
            { emoji: '📋', value: `${annualPct}%`, label: 'Of annual public limit', sub: '1 mSv/yr · ICRP 103 §2' },
          ].map(({ emoji, value, label, sub }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>{emoji}</span>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{value}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: '1px' }}>{label}</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(56,189,248,0.12)', fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          For context: a transatlantic flight typically delivers 30–80 µSv — below the 1 mSv annual public limit, and far below the 20 mSv/yr FAA occupational threshold for aircrew.
        </div>
      </div>

      {/* ── KPI TELEMETRY RAIL ─────────────────────────────────────────────── */}
      <section>
        <div className="section-label">Route Telemetry</div>
        <div className="kpi-rail" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>

          <div className="kpi-cell">
            <span className="kpi-label">Total Effective Dose (E)</span>
            <span className="kpi-value" style={{ color: 'var(--accent-blue)' }}>
              {fmt(totalDoseUsv, 1)}<span className="kpi-unit"> µSv</span>
            </span>
            <span className="kpi-sub">{fmt(totalDoseMsv, 4)} mSv &nbsp;·&nbsp; FAA CARI-7 ±15%</span>
          </div>
          <div className="kpi-cell">
            <span className="kpi-label">Mean Dose Rate (D̄)</span>
            <span className="kpi-value">{fmt(avgDoseRateUsvHr, 3)}<span className="kpi-unit"> µSv/hr</span></span>
            <span className="kpi-sub">Route-averaged</span>
          </div>
          <div className="kpi-cell">
            <span className="kpi-label">Peak Dose Rate (apex lat.)</span>
            <span className="kpi-value" style={{ color: maxDoseRate > 6 ? 'var(--accent-amber)' : 'var(--text-primary)' }}>
              {fmt(maxDoseRate, 3)}<span className="kpi-unit"> µSv/hr</span>
            </span>
            <span className="kpi-sub">
              {maxDoseRateWp ? `Geomag. lat. ${fmt(maxDoseRateWp.geomagLat, 1)}°` : '—'}
            </span>
          </div>
          <div className="kpi-cell">
            <span className="kpi-label">Flight Time</span>
            <span className="kpi-value">{fmt(flightTimeHr, 2)}<span className="kpi-unit"> hr</span></span>
            <span className="kpi-sub">{fmt(distanceNm, 0)} nm great-circle</span>
          </div>
          <div className="kpi-cell">
            <span className="kpi-label">Atm. Depth at Cruise Alt.</span>
            <span className="kpi-value">{fmt(totalXAtm, 0)}<span className="kpi-unit"> g/cm²</span></span>
            <span className="kpi-sub">FL{Math.round(altFt / 100)} — US Std. Atm. 1976</span>
          </div>
          <div className="kpi-cell">
            <span className="kpi-label">Solar F10.7</span>
            <span className="kpi-value">{solarF10_7}<span className="kpi-unit"> sfu</span></span>
            <span className="kpi-sub">SC25 declining · GCR mod. active</span>
          </div>
        </div>
      </section>

      {/* ── REGULATORY THRESHOLDS ─────────────────────────────────────────── */}
      <section>
        <div className="section-label">Regulatory & Reference Thresholds</div>
        <div className="panel" style={{ padding: '10px 14px' }}>
          <ThresholdRow
            label="ICRP Aircrew Limit (20 mSv/yr, ICRP 103 / FAA AC 120-61B)"
            value={totalDoseUsv} max={ICRP_CREW_USV}
            color="var(--accent-blue)"
            tip="FAA AC 120-61B and ICRP Publication 103 recommend a 20 mSv/yr occupational limit (5-year average) for aircrew. A single transatlantic flight represents a small fraction of this."
          />
          <ThresholdRow
            label="ICRP Public Dose Limit (1 mSv/yr, ICRP 103 §2)"
            value={totalDoseUsv} max={ICRP_PUBLIC_USV}
            color="var(--accent-amber)"
            tip="ICRP Publication 103 recommends 1 mSv/yr as the public exposure limit. Occasional air travel does not approach this threshold for typical passengers."
          />
          <ThresholdRow
            label={`Chest Radiograph Equivalents (${fmt(context.chestXrays, 2)}× @ 20 µSv/exam)`}
            value={totalDoseUsv} max={CHEST_XRAY_USV * 20}
            color="var(--accent-green)"
            tip="Reference: NCRP Report No. 160 (2009), Table B.1. A PA chest radiograph delivers approximately 20 µSv effective dose."
          />
        </div>
      </section>

      {/* ── ROUTE MAP ─────────────────────────────────────────────────────── */}
      <section>
        <div className="section-label">Geospatial Vector — Great-Circle Track</div>
        <RouteMapEnterprise waypoints={augWps} />
      </section>

      {/* ── DOSE RATE CHART ───────────────────────────────────────────────── */}
      <section>
        <div className="section-label">Effective Dose Rate Profile (µSv/hr vs. Flight Distance)</div>
        <div className="panel" style={{ padding: '12px 10px 8px' }}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nm" tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'var(--font-mono)' }} tickLine={false}
                label={{ value: 'nm', position: 'insideRight', fill: 'var(--text-muted)', fontSize: 9, dx: 8 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false} width={58}
                tickFormatter={v => `${v.toFixed(2)}`}
                label={{ value: 'µSv/hr', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)', fontSize: 9, dx: -2 }}
              />
              <Tooltip
                contentStyle={{ background: 'var(--surface-base)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius)', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}
                formatter={(v, name) => [name === 'rate' ? `${v.toFixed(4)} µSv/hr` : `${v.toFixed(2)} GV`, name === 'rate' ? 'Dose Rate' : 'Cutoff Rig.']}
                labelFormatter={v => `${v} nm`}
              />
              <Line type="monotone" dataKey="rate" stroke="var(--accent-blue)" strokeWidth={1.5} dot={false} name="rate" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ── WAYPOINT TRAJECTORY TABLE ─────────────────────────────────────── */}
      <section>
        <div className="section-label">Route Trajectory — Segment Waypoints</div>
        <div className="data-table-wrap">
        <div className="panel" style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>WPT</th>
                <th>Lat (°)</th>
                <th>Lon (°)</th>
                <th>Geomag. Lat (°)</th>
                <th>Rc (GV)</th>
                <th>Atm. Depth (g/cm²)</th>
                <th>Dose Rate (µSv/hr)</th>
                <th>Dist. (nm)</th>
              </tr>
            </thead>
            <tbody>
              {augWps.filter((_, i) => i % Math.max(1, Math.floor(augWps.length / 20)) === 0 || i === augWps.length - 1).map((wp, i) => (
                <tr key={i}>
                  <td>{wp.distFromOriginNm < 5 ? 'ORIG' : wp.fractionAlongRoute >= 0.99 ? 'DEST' : `W${String(i).padStart(2,'0')}`}</td>
                  <td>{wp.lat.toFixed(3)}</td>
                  <td>{wp.lon.toFixed(3)}</td>
                  <td>{wp.geomagLat.toFixed(3)}</td>
                  <td>{wp.rc.toFixed(2)}</td>
                  <td>{wp.xAtm.toFixed(1)}</td>
                  <td style={{ color: wp.doseRate > 6 ? 'var(--accent-amber)' : 'var(--text-mono)' }}>{wp.doseRate.toFixed(4)}</td>
                  <td>{Math.round(wp.distFromOriginNm)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={6} style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.65rem', fontFamily: 'var(--font-ui)' }}>
                  Rc: Störmer vertical cutoff rigidity (dipole approx.) · Atm. Depth: US Std. Atm. 1976
                </td>
                <td style={{ color: 'var(--accent-blue)' }}>{fmt(totalDoseUsv / flightTimeHr, 4)}</td>
                <td>{fmt(distanceNm, 0)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        </div>{/* end data-table-wrap */}
      </section>

    </div>
  );
}
