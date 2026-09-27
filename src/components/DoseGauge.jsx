// Simple SVG arc gauge for dose display
export default function DoseGauge({ valueUsv, maxUsv = 100 }) {
  const pct = Math.min(1, valueUsv / maxUsv);
  const angle = pct * 180;
  const r = 60, cx = 80, cy = 75;
  const startAngle = -180;
  const endAngle = startAngle + angle;
  const toRad = (d) => d * Math.PI / 180;
  const x1 = cx + r * Math.cos(toRad(startAngle));
  const y1 = cy + r * Math.sin(toRad(startAngle));
  const x2 = cx + r * Math.cos(toRad(endAngle));
  const y2 = cy + r * Math.sin(toRad(endAngle));
  const largeArc = angle > 180 ? 1 : 0;
  return (
    <svg width="160" height="90" viewBox="0 0 160 90">
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" strokeLinecap="round" />
      <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`} fill="none" stroke="url(#gaugeGrad)" strokeWidth="10" strokeLinecap="round" />
      <defs>
        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b8ef3" />
          <stop offset="100%" stopColor="#9b5de5" />
        </linearGradient>
      </defs>
    </svg>
  );
}
