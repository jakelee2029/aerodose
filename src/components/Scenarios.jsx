import { useMemo } from 'react';
import { Users } from 'lucide-react';
import { SCENARIOS, scenarioDoseUsv, scenarioLogEntries, formatDose } from '../physics/scenarios.js';
import { useLiveF107, clampF107 } from '../hooks/useLiveF107.js';

export default function Scenarios({ onAddToLog }) {
  const live = useLiveF107();
  const f107 = clampF107(live.status === 'ready' ? live.data.flux : 150);

  const cards = useMemo(() => SCENARIOS.map(s => {
    const dose = scenarioDoseUsv(s, f107);
    const ratio = dose / s.benchmark.usv;
    return { s, dose, ratio, context: s.context ? dose / s.context.usv : null };
  }), [f107]);

  return (
    <section aria-labelledby="who-title" className="border-t border-line bg-canvas px-4 py-6">
      <div className="flex items-center gap-2">
        <Users size={20} className="text-brand-text" aria-hidden="true" />
        <h2 id="who-title" className="text-xl font-semibold text-fg">Who flies, and what adds up?</h2>
      </div>
      <p className="mt-1 max-w-[70ch] text-[0.9375rem] text-fg-soft">
        A single flight is small. For some people the flights add up. These made-up examples use the AeroDose model with today's solar activity.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {cards.map(({ s, dose, ratio, context }) => {
          const over = ratio >= 1;
          const tone = ratio < 0.25 ? 'bg-safe' : 'bg-caution';
          return (
            <article key={s.id} className="panel flex flex-col p-5">
              <h3 className="text-base font-medium text-fg">{s.who}</h3>
              <p className="mt-1 text-[0.9375rem] text-fg-soft">{s.blurb}</p>

              <div className="mono mt-4 text-3xl font-semibold text-fg">
                {formatDose(dose)} <span className="text-base font-normal text-fg-soft">in {s.period}</span>
              </div>

              <div className="mt-3 h-3 overflow-hidden rounded-full bg-surface-2" role="meter"
                aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(Math.min(ratio, 1) * 100)}
                aria-label={`Share of ${s.benchmark.label}`}>
                <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.min(100, Math.max(2, ratio * 100))}%` }} />
              </div>
              <p className="mt-1.5 text-sm text-fg-soft">
                {over
                  ? <><strong className="text-fg">{ratio.toFixed(1)}×</strong> {s.benchmark.label}</>
                  : <><strong className="text-fg">{(ratio * 100).toFixed(ratio < 0.1 ? 1 : 0)}%</strong> of {s.benchmark.label}</>}
              </p>
              {context != null && (
                <p className="text-sm text-fg-soft">
                  For comparison, that is <strong className="text-fg">{context.toFixed(1)}×</strong> {s.context.label}.
                </p>
              )}

              <div className="mt-auto pt-4">
                <button type="button" className="btn-ghost"
                  onClick={() => onAddToLog(scenarioLogEntries(s, f107))}>
                  Use this as my log
                </button>
              </div>
            </article>
          );
        })}
      </div>
      <p className="mt-3 text-[0.8125rem] text-fg-muted">
        Examples are illustrations, not statistics about real people, and not medical advice. Guidelines are those of ICRP and FAA Advisory Circular 120-61B.
      </p>
    </section>
  );
}
