import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Clock3, Link2, X } from 'lucide-react';
import { useLanguage } from '@/i18n';
import { cn } from '@/lib/utils';
import { interp } from './model';
import type { SuggestedMatch } from './model';
import type { ReactNode } from 'react';

/**
 * Cartera detail drawer — design.md §9.5 anatomy:
 * right 520px panel, `--bg-overlay`, strong left border, sticky header,
 * hairline-separated sections. Esc closes.
 */
export default function CarteraDrawer({
  open,
  onClose,
  title,
  subtitle,
  headerAside,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  headerAside?: ReactNode;
  children: ReactNode;
}) {
  const { t } = useLanguage();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-[rgba(4,6,10,0.5)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.aside
            role="dialog"
            aria-modal
            aria-label={title}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[520px] flex-col border-l border-border-strong bg-overlay shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-hairline bg-overlay px-6 py-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <h2 className="font-mono-data text-[15px] font-medium text-txt-primary">{title}</h2>
                  {headerAside}
                </div>
                {subtitle && <p className="mt-1 truncate text-[13px] text-txt-secondary">{subtitle}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={t('action.close')}
                className="rounded-md p-1.5 text-txt-muted transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary"
              >
                <X className="size-4" strokeWidth={1.75} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/** Titled drawer section with hairline separation. */
export function DrawerSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-b border-hairline px-6 py-5 last:border-b-0">
      <h3 className="text-overline mb-4 text-txt-muted">{title}</h3>
      {children}
    </section>
  );
}

/** Key-value grid (label 11px uppercase / value 14px) per §9.5. */
export function KV({ label, value, mono = false }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-overline text-txt-muted">{label}</p>
      <p className={cn('mt-1 truncate text-sm text-txt-primary', mono && 'font-mono-data text-[13px]')}>{value}</p>
    </div>
  );
}

/** One side (SIIGO or HGI) of the comparison viewer. */
export function CompareColumn({
  system,
  rows,
  highlightKey,
}: {
  system: 'siigo' | 'hgi';
  rows: { key: string; label: string; value: ReactNode }[];
  highlightKey?: string;
}) {
  return (
    <div
      className="rounded-lg border p-3.5"
      style={{
        borderColor: system === 'siigo' ? 'rgba(255,138,0,0.3)' : 'rgba(79,140,255,0.3)',
        backgroundColor: 'var(--bg-inset)',
      }}
    >
      <div className="mb-3 flex items-center gap-1.5">
        <span className="size-1.5 rounded-full" style={{ backgroundColor: system === 'siigo' ? 'var(--siigo)' : 'var(--hgi)' }} />
        <span className="text-xs font-semibold tracking-wide" style={{ color: system === 'siigo' ? '#FFB25E' : '#8FB4FF' }}>
          {system === 'siigo' ? 'SIIGO' : 'HGI'}
        </span>
      </div>
      <dl className="flex flex-col gap-2.5">
        {rows.map((r) => {
          const hot = r.key === highlightKey;
          return (
            <div
              key={r.key}
              className={cn('flex items-baseline justify-between gap-2 rounded-md px-1.5 py-1', hot && 'bg-[var(--danger-dim)]')}
            >
              <dt className="text-[11px] uppercase tracking-[0.06em] text-txt-muted">{r.label}</dt>
              <dd className={cn('font-mono-data text-[13px]', hot ? 'font-semibold text-danger' : 'text-txt-primary')}>{r.value}</dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

export interface TimelineStep {
  label: string;
  detail: string;
  state: 'done' | 'pending' | 'error';
}

/** Vertical sync timeline (created → job → HGI). */
export function SyncTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="flex flex-col">
      {steps.map((s, i) => (
        <li key={s.label} className="relative flex gap-3 pb-5 last:pb-0">
          {i < steps.length - 1 && <span className="absolute left-[7px] top-4 h-full w-px bg-border-strong" aria-hidden />}
          <span className="relative mt-0.5 flex size-[15px] shrink-0 items-center justify-center">
            {s.state === 'done' ? (
              <CheckCircle2 className="size-[15px] text-brand" strokeWidth={2} />
            ) : s.state === 'error' ? (
              <span className="flex size-[15px] items-center justify-center rounded-full bg-[var(--danger-dim)]">
                <span className="size-1.5 rounded-full bg-danger" />
              </span>
            ) : (
              <Clock3 className="size-[15px] text-warn" strokeWidth={2} />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-txt-primary">{s.label}</p>
            <p className="mt-0.5 font-mono-data text-[11px] text-txt-muted">{s.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Suggested-match card — slides x 12→0, confirm/reject per spec Tab 5. */
export function SuggestedMatchCard({
  match,
  onConfirm,
  onReject,
}: {
  match: SuggestedMatch;
  onConfirm: () => void;
  onReject: () => void;
}) {
  const { t, formatDate } = useLanguage();
  return (
    <motion.div
      className="rounded-xl border border-brand/30 bg-[var(--brand-dim)] p-4"
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center gap-2">
        <Link2 className="size-4 text-brand" strokeWidth={1.75} />
        <p className="text-[13px] font-semibold text-txt-primary">{t('cart.recon.suggestedTitle')}</p>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-txt-secondary">
        {interp(t('cart.recon.suggestedBody'), {
          rc: match.recibo.numero,
          fv: match.factura.numero,
          fecha: formatDate(match.recibo.fecha, 'day'),
        })}
      </p>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={onConfirm}
          className="h-8 rounded-lg bg-brand px-3.5 text-[13px] font-semibold text-canvas transition-all duration-100 ease-standard hover:bg-brand-hover active:scale-[0.97]"
        >
          {t('cart.recon.confirm')}
        </button>
        <button
          type="button"
          onClick={onReject}
          className="h-8 rounded-lg border border-border-strong px-3.5 text-[13px] font-medium text-txt-secondary transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary"
        >
          {t('cart.recon.reject')}
        </button>
      </div>
    </motion.div>
  );
}
