import { Plane } from 'lucide-react';
import { useLiveF107 } from '../hooks/useLiveF107.js';

export default function AppHeader() {
  const { status, data } = useLiveF107();
  return (
    <header className="sticky top-0 z-[100] flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-line bg-surface-1 px-4 py-2.5">
      <div className="flex items-center gap-3 min-w-0">
        <Plane size={20} className="shrink-0 text-brand-text" aria-hidden="true" />
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold tracking-tight text-fg">AeroDose</span>
            <span className="text-sm text-fg-soft">Flight radiation estimator</span>
          </div>
          <p className="hidden text-[0.8125rem] leading-snug text-fg-muted sm:block">
            The FAA recommends radiation tracking for aircrew (Advisory Circular 120-61B). AeroDose gives every passenger the same transparency.
          </p>
        </div>
      </div>

      <div className="header-status-bar flex items-center gap-4 text-sm text-fg-soft">
        <span>
          Sun today (NOAA){' '}
          <span className="mono text-fg">
            {status === 'ready' ? `F10.7 ${data.flux} sfu` : status === 'loading' ? 'loading…' : 'unavailable'}
          </span>
        </span>
      </div>
    </header>
  );
}
