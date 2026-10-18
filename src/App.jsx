import { useEffect, useState } from 'react';
import AppHeader from './components/AppHeader.jsx';
import Hero from './components/Hero.jsx';
import FlightParameters from './components/FlightParameters.jsx';
import TelemetryPanel from './components/TelemetryPanel.jsx';
import LocalFlights from './components/LocalFlights.jsx';
import FlightLog from './components/FlightLog.jsx';
import Scenarios from './components/Scenarios.jsx';
import ActionKit from './components/ActionKit.jsx';
import ImpactPanel from './components/ImpactPanel.jsx';

const LOG_KEY = 'aerodose.flightLog.v1';

function readLog() {
  try {
    const v = JSON.parse(localStorage.getItem(LOG_KEY) ?? '[]');
    return Array.isArray(v) ? v : [];
  } catch { return []; }
}

export default function App() {
  const [result, setResult] = useState(null);
  const [routeRequest, setRouteRequest] = useState(null);
  const [log, setLog] = useState(readLog);

  useEffect(() => {
    try { localStorage.setItem(LOG_KEY, JSON.stringify(log)); } catch { /* storage unavailable */ }
  }, [log]);

  function addToLog(r) {
    setLog(l => [...l, { id: `${Date.now()}-${l.length}`, label: r.routeLabel, doseUsv: r.totalDoseUsv, addedAt: Date.now() }]);
    setTimeout(() => document.getElementById('log-title')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  }

  // Replace the log with a scenario's flights so "My year in the air" and the letter use them
  function loadScenario(entries) {
    if (log.length > 0 && !window.confirm('This replaces the flights in "My year in the air" with this example. Continue?')) return;
    const stamp = Date.now();
    setLog(entries.map((e, i) => ({ id: `${stamp}-${i}`, label: e.label, doseUsv: e.doseUsv, addedAt: stamp, example: true })));
    setTimeout(() => document.getElementById('log-title')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppHeader />
      <Hero />
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
          {/* Left pane: flight parameters */}
          <aside className="workbench-left" style={{
            borderRight: '1px solid var(--border-subtle)',
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 72px)',
            position: 'sticky', top: '72px',
          }}>
            <FlightParameters onResult={setResult} routeRequest={routeRequest} />
          </aside>

          {/* Right pane: results, local view, personal log, impact */}
          <main style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <TelemetryPanel result={result} onAddToLog={addToLog} />
            <ImpactPanel />
            <LocalFlights onPickRoute={setRouteRequest} />
            <Scenarios onAddToLog={loadScenario} />
            <FlightLog log={log} onRemove={id => setLog(l => l.filter(e => e.id !== id))} onClear={() => setLog([])} />
            <ActionKit log={log} />
          </main>
        </div>
      </div>
    </div>
  );
}
