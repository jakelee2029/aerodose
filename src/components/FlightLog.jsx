import { useState } from 'react';
import { BookOpen, Trash2 } from 'lucide-react';

const GUIDELINE_USV = 1000; // ICRP 103: 1 mSv/yr for the public
const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

function status(totalUsv) {
  const pct = (totalUsv / GUIDELINE_USV) * 100;
  if (pct < 25) return { label: 'Well under the guideline', tone: 'status-nominal', bar: 'bg-safe' };
  if (pct < 75) return { label: 'Building up', tone: 'status-advisory', bar: 'bg-caution' };
  if (pct < 100) return { label: 'Close to the guideline', tone: 'status-advisory', bar: 'bg-caution' };
  return { label: 'Over the guideline', tone: 'status-alert', bar: 'bg-danger' };
}

export default function FlightLog({ log, onRemove, onClear }) {
  const [copied, setCopied] = useState(false);
  const [now] = useState(() => Date.now());
  const recent = log.filter(e => now - e.addedAt < YEAR_MS);
  const showingExample = recent.some(e => e.example);
  const total = recent.reduce((s, e) => s + e.doseUsv, 0);
  const pct = (total / GUIDELINE_USV) * 100;
  const s = status(total);

  async function copySummary() {
    const lines = [
      showingExample ? `AeroDose example log (illustration, not real flights)` : `My AeroDose flight radiation log (last 12 months)`,
      ...recent.map(e => `- ${e.label}: ${e.doseUsv.toFixed(1)} µSv`),
      `Total: ${total.toFixed(1)} µSv (${pct.toFixed(1)}% of the 1 mSv/yr public guideline)`,
      `Estimated with AeroDose, not for regulatory use.`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    } catch { window.prompt('Copy your summary:', lines.join('\n')); }
  }

  return (
    <section aria-labelledby="log-title" className="border-t border-line bg-canvas px-4 py-6">
      <div className="flex items-center gap-2">
        <BookOpen size={20} className="text-brand-text" aria-hidden="true" />
        <h2 id="log-title" className="text-xl font-semibold text-fg">My year in the air</h2>
      </div>
      <p className="mt-1 max-w-[70ch] text-[0.9375rem] text-fg-soft">
        Add each flight you take to see your running total against the 1 mSv yearly guideline. Your log stays on this device only.
      </p>

      <div className="panel mt-4 p-5">
        {showingExample && (
          <p role="status" className="mb-4 rounded-ctl border border-caution/40 bg-caution/10 px-3 py-2 text-[0.9375rem] text-fg">
            <strong>Showing an example,</strong> not your own flights. Clear it to start your real log.
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <div className="mono text-3xl font-semibold text-fg">{total.toFixed(1)} <span className="text-base font-normal text-fg-soft">µSv</span></div>
          <span className={`status-badge ${s.tone}`}>{s.label}</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-surface-2"
          role="meter" aria-valuemin={0} aria-valuemax={GUIDELINE_USV} aria-valuenow={Math.min(total, GUIDELINE_USV)}
          aria-label="Share of the yearly radiation guideline used">
          <div className={`h-full rounded-full ${s.bar}`} style={{ width: `${Math.min(100, Math.max(pct, total > 0 ? 1.5 : 0))}%` }} />
        </div>
        <div className="mt-1 flex justify-between text-[0.8125rem] text-fg-soft">
          <span>{pct.toFixed(1)}% of the yearly guideline</span><span className="mono">1,000 µSv</span>
        </div>

        {recent.length === 0 ? (
          <p className="mt-5 text-[0.9375rem] text-fg-soft">
            No flights yet. Calculate a flight above, then choose "Add to my year".
          </p>
        ) : (
          <>
            <ul className="mt-5 divide-y divide-line">
              {recent.map(e => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="text-[0.9375rem] text-fg"><span className="mono font-semibold">{e.label}</span>
                    {e.example && <span className="status-badge status-advisory ml-2">Example</span>}
                    <span className="ml-2 text-sm text-fg-soft">{new Date(e.addedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="mono text-sm text-fg">{e.doseUsv.toFixed(1)} µSv</span>
                    <button type="button" className="btn-ghost px-2" onClick={() => onRemove(e.id)} aria-label={`Remove ${e.label} from my log`}>
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className="btn-ghost" onClick={copySummary}>{copied ? 'Copied!' : 'Copy summary to share'}</button>
              <button type="button" className="btn-ghost" onClick={onClear}>Clear log</button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
