import { useMemo, useState } from 'react';
import { Megaphone } from 'lucide-react';
import { buildLetter, RECIPIENTS } from '../utils/letter.js';
import { useLiveF107, clampF107 } from '../hooks/useLiveF107.js';

const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export default function ActionKit({ log }) {
  const [recipient, setRecipient] = useState('rep');
  const [name, setName] = useState('');
  const [place, setPlace] = useState('');
  const [edited, setEdited] = useState(null); // user's own edits override the generated draft
  const [copied, setCopied] = useState(false);
  const [now] = useState(() => Date.now());

  const live = useLiveF107();
  const f107 = clampF107(live.status === 'ready' ? live.data.flux : 150);
  // Example flights loaded from "Who flies?" are never presented as the writer's own flights
  const logTotalUsv = log.filter(e => !e.example && now - e.addedAt < YEAR_MS).reduce((s, e) => s + e.doseUsv, 0);
  const usingExample = log.some(e => e.example);

  const generated = useMemo(
    () => buildLetter({ recipient, name, place, logTotalUsv, f107 }),
    [recipient, name, place, logTotalUsv, f107],
  );
  const body = edited ?? generated.body;

  async function copy() {
    try {
      await navigator.clipboard.writeText(`Subject: ${generated.subject}\n\n${body}`);
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    } catch { window.prompt('Copy your letter:', body); }
  }

  const mailto = `mailto:?subject=${encodeURIComponent(generated.subject)}&body=${encodeURIComponent(body)}`;

  return (
    <section aria-labelledby="action-title" className="border-t border-line bg-canvas px-4 py-6">
      <div className="flex items-center gap-2">
        <Megaphone size={20} className="text-brand-text" aria-hidden="true" />
        <h2 id="action-title" className="text-xl font-semibold text-fg">Take action</h2>
      </div>
      <p className="mt-1 max-w-[70ch] text-[0.9375rem] text-fg-soft">
        Numbers matter most when someone with influence sees them. Write a short letter that uses your own results and asks clear questions.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[18rem_1fr]">
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="kit-recipient" className="field-label">Who are you writing to?</label>
            <select id="kit-recipient" className="field-select" value={recipient}
              onChange={e => { setRecipient(e.target.value); setEdited(null); }}>
              {Object.entries(RECIPIENTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="kit-name" className="field-label">Your name</label>
            <input id="kit-name" className="field-input" style={{ fontFamily: 'var(--font-sans)' }} value={name}
              onChange={e => { setName(e.target.value); setEdited(null); }} autoComplete="name" />
          </div>
          <div>
            <label htmlFor="kit-place" className="field-label">Your town or district</label>
            <input id="kit-place" className="field-input" style={{ fontFamily: 'var(--font-sans)' }} value={place}
              onChange={e => { setPlace(e.target.value); setEdited(null); }} />
          </div>
          <p className="text-[0.8125rem] text-fg-muted">
            {logTotalUsv > 0
              ? 'The letter uses the total from "My year in the air."'
              : usingExample
                ? 'Your log is showing an example, so the letter does not claim those flights as yours. Clear it and add your own flights to include them.'
                : 'Add flights to "My year in the air" and the letter will use your own total.'}
          </p>
          {recipient === 'rep' && (
            <a href="https://www.house.gov/representatives/find-your-representative" target="_blank" rel="noopener noreferrer"
              className="text-[0.9375rem] font-medium text-brand-text">
              Find your U.S. Representative ↗
            </a>
          )}
        </div>

        <div>
          <label htmlFor="kit-letter" className="field-label">Your draft (you can edit it)</label>
          <textarea id="kit-letter" value={body} onChange={e => setEdited(e.target.value)} rows={18}
            className="field-input" style={{ fontFamily: 'var(--font-sans)', lineHeight: 1.6, resize: 'vertical' }} />
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="btn-execute" onClick={copy}>{copied ? 'Copied!' : 'Copy letter'}</button>
            <a className="btn-ghost no-underline" href={mailto}>Open in my email app</a>
            {edited != null && <button type="button" className="btn-ghost" onClick={() => setEdited(null)}>Reset to generated draft</button>}
          </div>
          <div className="mt-4 rounded-ctl border border-line bg-surface-1 p-4 text-[0.9375rem] text-fg-soft">
            <strong className="text-fg">Before you send:</strong>
            <ul className="impact-list">
              <li>Check the statement about FAA Advisory Circular 120-61B and the airline requirements yourself. Edit or delete anything you can't confirm.</li>
              <li>Fill in your name and town. Parents or teachers should look it over first.</li>
              <li>Doses are estimates from AeroDose, not medical advice.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
