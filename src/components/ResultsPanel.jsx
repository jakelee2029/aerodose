import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import RouteMap from './RouteMap.jsx';

function fmt(n, decimals=1) { return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }); }

function useIsMobile() {
  const [mobile, setMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 600);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 600);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return mobile;
}

export default function ResultsPanel({ result }) {
  const { totalDoseUsv, flightTimeHr, distanceNm, avgDoseRateUsvHr, waypoints, altFt, context } = result;
  const totalMsv = totalDoseUsv / 1000;
  const isMobile = useIsMobile();

  const chartData = waypoints.map(wp => ({
    name: `${Math.round(wp.distFromOriginNm)} nm`,
    doseRate: +wp.doseRate.toFixed(3),
  }));

  // FIX 4: Reduce X-axis ticks on mobile
  const tickInterval = isMobile ? Math.max(1, Math.floor(chartData.length / 4)) : 'preserveStartEnd';

  return (
    <section id="results-panel" className="fade-in" style={{ marginBottom: '48px' }}>
      {/* Main dose display */}
      <div className="glass-card" style={{ padding: isMobile ? '28px 20px' : '40px', marginBottom: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
          Total Effective Dose
        </div>
        <div style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 'clamp(2.8rem, 10vw, 5rem)',
          fontWeight: 800, lineHeight: 1,
          background: 'linear-gradient(135deg, #06d6d6 0%, #3b8ef3 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text', marginBottom: '8px',
        }}>
          {fmt(totalDoseUsv, 1)} <span style={{ fontSize: '40%', opacity: 0.85 }}>µSv</span>
        </div>
        <div style={{ fontSize: isMobile ? '0.9rem' : '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          = {fmt(totalMsv, 3)} mSv{isMobile ? <br/> : ' · '}{fmt(flightTimeHr, 1)} hr{isMobile ? ', ' : ' · '}{fmt(distanceNm, 0)} nm great-circle
        </div>
        <div style={{ marginTop: '10px', fontSize: '0.75rem', color: 'rgba(148,163,184,0.55)' }}>
          Approximation ±15% — FAA CARI-7 analytical model · ICRP Publication 132 (2016)
        </div>
      </div>

      {/* FIX 3: Stats row — responsive grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
        gap: '12px', marginBottom: '24px',
      }}>
        <StatCard
          label="Avg. Dose Rate" value={`${fmt(avgDoseRateUsvHr, 2)} µSv/hr`} sub="During cruise"
          tip="Effective dose rate averaged over the flight. Rates are higher at polar latitudes due to reduced geomagnetic shielding."
          icon="📡" isMobile={isMobile}
        />
        <StatCard
          label="Cruise Altitude" value={`FL${Math.round(altFt/100)}`} sub={`${(altFt * 0.0003048).toFixed(1)} km MSL`}
          tip="Higher altitude = thinner atmosphere = less shielding from cosmic rays. Dose rate roughly doubles for every 6,500 ft gain."
          icon="✈" isMobile={isMobile}
        />
        <StatCard
          label="% of Annual Limit" value={`${fmt(context.percentOfAircrewLimit, 2)}%`} sub="FAA 20 mSv/yr limit"
          tip="FAA Advisory Circular 120-61B sets a 20 mSv/year limit for flight crew (5-year average). A single flight is a small fraction of this."
          icon="🛡" isMobile={isMobile}
        />
      </div>

      {/* Context comparisons */}
      <div className="glass-card" style={{ padding: isMobile ? '20px' : '28px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>
          📊 Putting {fmt(totalDoseUsv, 1)} µSv in Context
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <ContextBar label="Chest X-rays equivalent" value={context.chestXrays}
            valueFmt={v => `${fmt(v, 1)}×`}
            ref_="20 µSv per PA chest radiograph — NCRP Report 160 (2009)" color="#3b8ef3" max={10} />
          <ContextBar label="Daily background radiation" value={context.percentOfDailyBackground}
            valueFmt={v => `${fmt(v, 0)}%`}
            ref_="US average background ~8.5 µSv/day — NCRP Report 160 (2009)" color="#06d6d6" max={200} />
          <ContextBar label="Annual US background" value={context.percentOfAnnualBackground}
            valueFmt={v => `${fmt(v, 2)}%`}
            ref_="US average background ~3.1 mSv/yr from all sources — NCRP 160" color="#9b5de5" max={5} />
          <ContextBar label="Bananas (K-40 equivalent)" value={context.bananas}
            valueFmt={v => v > 1000 ? `${fmt(v/1000,1)}k` : `${fmt(v, 0)}`}
            ref_="~0.098 µSv per banana from potassium-40 — Health Physics Society FAQ" color="#f4c430" max={5000} />
        </div>
      </div>

      {/* Route map */}
      <RouteMap waypoints={waypoints} />

      {/* Dose rate chart */}
      <div className="glass-card" style={{ padding: isMobile ? '20px' : '28px', marginBottom: '0' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>Dose Rate Along Route</h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
          Effective dose rate (µSv/hr) varies with geomagnetic latitude.
          Polar routes receive higher doses — Earth's magnetic field provides less shielding near the poles.
        </p>
        <ResponsiveContainer width="100%" height={isMobile ? 180 : 220}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,142,243,0.1)" />
            <XAxis dataKey="name"
              tick={{ fill: '#64748b', fontSize: isMobile ? 9 : 10 }}
              tickLine={false}
              interval={tickInterval}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: isMobile ? 9 : 10 }}
              tickLine={false} axisLine={false}
              unit=" µSv/h"
              width={isMobile ? 58 : 70}
            />
            <Tooltip
              contentStyle={{ background: 'rgba(10,22,40,0.95)', border: '1px solid rgba(59,142,243,0.3)', borderRadius: '8px', fontSize: '0.82rem' }}
              labelStyle={{ color: '#94a3b8' }}
              formatter={v => [`${fmt(v, 3)} µSv/hr`, 'Dose Rate']}
            />
            <Line type="monotone" dataKey="doseRate" stroke="#06d6d6" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function StatCard({ label, value, sub, tip, icon, isMobile }) {
  return (
    <div className="glass-card glass-card-hover" style={{
      padding: isMobile ? '16px 20px' : '20px',
      textAlign: isMobile ? 'left' : 'center',
      display: isMobile ? 'flex' : 'block',
      alignItems: isMobile ? 'center' : undefined,
      gap: isMobile ? '16px' : undefined,
    }}>
      <div style={{ fontSize: isMobile ? '1.8rem' : '1.6rem', flexShrink: 0, marginBottom: isMobile ? 0 : '8px' }}>{icon}</div>
      <div>
        <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{label}</div>
        <span className="tooltip-wrap">
          <div style={{ fontSize: isMobile ? '1.15rem' : '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px', cursor: 'help' }}>{value}</div>
          <span className="tooltip-content">{tip}</span>
        </span>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{sub}</div>
      </div>
    </div>
  );
}

function ContextBar({ label, value, valueFmt, ref_, color, max }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'baseline', gap: '8px' }}>
        <span className="tooltip-wrap" style={{ minWidth: 0 }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 500, cursor: 'help' }}>{label}</span>
          <span className="tooltip-content">Source: {ref_}</span>
        </span>
        <span style={{ fontWeight: 700, color, fontSize: '1rem', flexShrink: 0 }}>{valueFmt(value)}</span>
      </div>
      <div style={{ height: '6px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}80, ${color})`,
          borderRadius: '4px', transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
    </div>
  );
}
