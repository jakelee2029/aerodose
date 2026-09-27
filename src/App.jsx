import { useState } from 'react';
import AppHeader from './components/AppHeader.jsx';
import FlightParameters from './components/FlightParameters.jsx';
import TelemetryPanel from './components/TelemetryPanel.jsx';
import MethodologyPanel from './components/MethodologyPanel.jsx';

export default function App() {
  const [result, setResult] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppHeader />
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        maxWidth: '1440px', width: '100%', margin: '0 auto', padding: '0',
      }}>
        {/* Workbench grid */}
        <div className="workbench-grid" style={{
          display: 'grid',
          gridTemplateColumns: '340px 1fr',
          flex: 1,
          borderTop: '1px solid var(--border-subtle)',
        }}>
          {/* Left pane — flight parameters */}
          <aside className="workbench-left" style={{
            borderRight: '1px solid var(--border-subtle)',
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 44px)',
            position: 'sticky', top: '44px',
          }}>
            <FlightParameters onResult={setResult} />
          </aside>

          {/* Right pane — telemetry + methodology */}
          <main style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <TelemetryPanel result={result} />
            <MethodologyPanel />
          </main>
        </div>
      </div>
    </div>
  );
}
