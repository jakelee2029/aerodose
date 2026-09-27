import { Radio, Cpu } from 'lucide-react';

export default function AppHeader() {
  return (
    <header style={{
      minHeight: '44px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 16px',
      background: 'var(--surface-base)',
      borderBottom: '1px solid var(--border-default)',
      position: 'sticky', top: 0, zIndex: 100,
      flexShrink: 0, flexWrap: 'wrap', gap: '8px',
    }}>
      {/* Product identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <Cpu size={14} color="var(--accent-blue)" strokeWidth={1.5} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 700,
              letterSpacing: '0.06em', color: 'var(--text-primary)',
            }}>AERODOSE</span>
            <span style={{ color: 'var(--border-strong)', fontSize: '0.75rem' }}>/</span>
            <span style={{
              fontFamily: 'var(--font-ui)', fontSize: '0.72rem',
              color: 'var(--text-secondary)', letterSpacing: '0.03em',
            }}>Flight Radiation Dosimetry Model</span>
          </div>
          {/* Civic hook — visible on all screen sizes */}
          <div style={{
            fontFamily: 'var(--font-ui)', fontSize: '0.6rem',
            color: 'var(--text-muted)', letterSpacing: '0.02em', lineHeight: 1.3,
          }}>
            Congress mandates FAA aircrew radiation tracking (14&nbsp;CFR&nbsp;§&nbsp;120.109) —&nbsp;AeroDose extends that transparency to every passenger.
          </div>
        </div>
      </div>

      {/* Status indicators — hidden on small screens via .header-status-bar class */}
      <div className="header-status-bar" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div className="pulse-dot" />
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
            color: 'var(--text-secondary)', letterSpacing: '0.04em',
          }}>SOLAR CYCLE&nbsp;25&nbsp;|&nbsp;F10.7:&nbsp;150&nbsp;sfu&nbsp;[DECLINING]</span>
        </div>
        <div style={{ height: '16px', width: '1px', background: 'var(--border-default)' }} />
        <span className="status-badge status-nominal">
          CARI-7 PARITY v7.x
        </span>
        <div style={{ height: '16px', width: '1px', background: 'var(--border-default)' }} />
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)',
        }}>ICRP 132 · FAA AC 120-61B</span>
      </div>
    </header>
  );
}
