import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export type GapAccent = 'warning' | 'danger';

const ACCENT: Record<GapAccent, { solid: string; dim: string }> = {
  warning: { solid: 'var(--warning)', dim: 'var(--warning-dim)' },
  danger: { solid: 'var(--danger)', dim: 'var(--danger-dim)' },
};

interface GapPanelProps {
  accent: GapAccent;
  title: string;
  caption: string;
  count: number;
  footer: ReactNode;
  /** Re-run the cross-check (scanning shimmer handled by parent state). */
  onRecheck: () => void;
  scanning: boolean;
  recheckLabel: string;
  /** Rows keyed list — re-mounted on scan to re-stagger. */
  children: ReactNode;
  className?: string;
}

/**
 * Gap dashboard panel (logistica §B) — elevated card with 2px colored top
 * hairline, count badge, recheck action and totals footer.
 */
export default function GapPanel({
  accent,
  title,
  caption,
  count,
  footer,
  onRecheck,
  scanning,
  recheckLabel,
  children,
  className,
}: GapPanelProps) {
  const colors = ACCENT[accent];
  return (
    <section
      className={cn('relative flex flex-col overflow-hidden rounded-xl border border-hairline bg-elevated', className)}
      aria-label={title}
    >
      {/* colored top hairline */}
      <span className="h-0.5 w-full" style={{ backgroundColor: colors.solid }} aria-hidden />
      <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-display text-[17px] font-semibold leading-6 tracking-[-0.01em] text-txt-primary">{title}</h2>
            <span
              className="tabular inline-flex h-[22px] items-center rounded-md px-2 text-xs font-semibold"
              style={{ backgroundColor: colors.dim, color: colors.solid }}
            >
              {count}
            </span>
          </div>
          <p className="mt-1 max-w-[420px] text-xs leading-5 text-txt-muted">{caption}</p>
        </div>
        <button
          type="button"
          onClick={onRecheck}
          disabled={scanning}
          title={recheckLabel}
          aria-label={recheckLabel}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-txt-muted transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary disabled:opacity-60"
        >
          <RefreshCw className={cn('size-4', scanning && 'animate-spin')} strokeWidth={1.75} />
        </button>
      </div>

      <div className="relative flex-1 px-2 pb-2">
        {children}
        {/* scanning shimmer overlay */}
        {scanning && (
          <motion.div
            className="skeleton-shimmer pointer-events-none absolute inset-0 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden
          />
        )}
      </div>

      <div className="border-t border-hairline px-5 py-3">
        <p className="text-xs font-medium text-txt-secondary">{footer}</p>
      </div>
    </section>
  );
}
