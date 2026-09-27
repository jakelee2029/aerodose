export default function Header() {
  return (
    <header style={{
      padding: '32px 20px 8px',
      maxWidth: '920px',
      margin: '0 auto',
    }}>
      {/* Nav bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '60px',
        borderBottom: '1px solid rgba(59,142,243,0.1)',
        paddingBottom: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #3b8ef3 0%, #9b5de5 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', boxShadow: '0 4px 14px rgba(59,142,243,0.4)',
          }}>☢</div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
            AeroDose
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div className="pulse-dot" />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Live Model</span>
        </div>
      </div>

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(59,142,243,0.12)',
          border: '1px solid rgba(59,142,243,0.25)',
          borderRadius: '100px',
          padding: '6px 18px',
          fontSize: '0.8rem',
          color: 'var(--accent-cyan)',
          marginBottom: '24px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontWeight: 500,
        }}>
          Congressional App Challenge · NY-06 · 2026
        </div>
        <h1 className="gradient-text" style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 'clamp(2.2rem, 6vw, 3.6rem)',
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: '-0.03em',
          marginBottom: '20px',
        }}>
          How Much Cosmic Radiation<br />Does Your Flight Give You?
        </h1>
        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-secondary)',
          maxWidth: '560px',
          margin: '0 auto',
          lineHeight: 1.65,
        }}>
          Enter any flight route to get a science-backed effective dose estimate —
          calculated from the same FAA and ICRP models used by aviation safety researchers.
        </p>
      </div>
    </header>
  );
}
