import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, CheckCircle2, Loader2 } from 'lucide-react';
import { useLanguage } from '@/i18n';
import { cn } from '@/lib/utils';

export interface SyncStep {
  id: string;
  name: string;
  docs: number;
}

interface SyncProgressModalProps {
  open: boolean;
  steps: SyncStep[];
  onClose: () => void;
  /** Fired once when the run completes (page shows the toast). */
  onFinish?: () => void;
}

const STEP_MS = 1100;

/**
 * "Sincronizar ahora" progress modal (tesoreria.md §[F]) — overall brand
 * progress bar + per-bank step list that flips to brand checks as banks
 * complete; finish state swaps title and shows the run summary.
 */
export default function SyncProgressModal({ open, steps, onClose, onFinish }: SyncProgressModalProps) {
  const { t, formatNumber } = useLanguage();
  const [completed, setCompleted] = useState(0);
  const [done, setDone] = useState(false);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const totalDocs = steps.reduce((acc, s) => acc + s.docs, 0);
  const elapsedSec = (steps.length * STEP_MS + 100) / 1000;

  useEffect(() => {
    if (!open) return;
    setCompleted(0);
    setDone(false);
    const timers: number[] = [];
    steps.forEach((_, i) => {
      timers.push(window.setTimeout(() => setCompleted(i + 1), (i + 1) * STEP_MS));
    });
    timers.push(
      window.setTimeout(() => {
        setDone(true);
        onFinishRef.current?.();
      }, steps.length * STEP_MS + 100),
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const docsDone = steps.slice(0, completed).reduce((acc, s) => acc + s.docs, 0);
  const pct = totalDocs === 0 ? 0 : Math.round((docsDone / totalDocs) * 100);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-[rgba(4,6,10,0.6)] backdrop-blur-[8px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={done ? onClose : undefined}
          />
          <motion.div
            role="dialog"
            aria-modal
            className="fixed left-1/2 top-1/2 z-50 w-[480px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border-strong bg-overlay p-6 shadow-2xl"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-3">
              {done ? (
                <motion.span initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.2, ease: [0.3, 1.4, 0.5, 1] }}>
                  <CheckCircle2 className="size-5 text-brand" strokeWidth={1.75} />
                </motion.span>
              ) : (
                <Loader2 className="size-5 animate-spin" style={{ color: 'var(--sync)' }} strokeWidth={1.75} />
              )}
              <h2 className="font-display text-[17px] font-semibold text-txt-primary">
                {done ? t('teso.modalDone') : t('teso.modalTitle')}
              </h2>
            </div>

            {/* Overall progress bar */}
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-inset">
              <motion.div
                className="h-full rounded-full bg-brand"
                initial={{ width: '0%' }}
                animate={{ width: `${done ? 100 : pct}%` }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>

            {/* Per-bank steps */}
            <ul className="mt-4 flex flex-col gap-1">
              {steps.map((step, i) => {
                const isDone = i < completed;
                const isCurrent = !done && i === completed;
                return (
                  <li
                    key={step.id}
                    className={cn(
                      'flex items-center justify-between rounded-lg px-2 py-2',
                      isCurrent && 'bg-[var(--bg-hover)]',
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      {isDone ? (
                        <motion.span
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.2, ease: [0.3, 1.4, 0.5, 1] }}
                          className="flex size-5 items-center justify-center rounded-full bg-brand-dim"
                        >
                          <Check className="size-3 text-brand" strokeWidth={3} />
                        </motion.span>
                      ) : isCurrent ? (
                        <span className="flex size-5 items-center justify-center">
                          <Loader2 className="size-4 animate-spin" style={{ color: 'var(--sync)' }} strokeWidth={2} />
                        </span>
                      ) : (
                        <span className="flex size-5 items-center justify-center">
                          <span className="size-1.5 rounded-full bg-border-strong" />
                        </span>
                      )}
                      <span className={cn('text-[13px]', isDone || isCurrent ? 'text-txt-primary' : 'text-txt-muted')}>
                        {step.name}
                      </span>
                    </span>
                    <span className="tabular font-mono-data text-xs text-txt-muted">
                      {step.docs} {t('dash.docsCount')}
                    </span>
                  </li>
                );
              })}
            </ul>

            {/* Finish summary + close */}
            <div className="mt-5 flex items-center justify-between border-t border-hairline pt-4">
              <p className="text-xs text-txt-muted">
                {done
                  ? `${formatNumber(totalDocs)} ${t('teso.modalDocsMigrated')} · 0 ${t('teso.errors')} · ${formatNumber(elapsedSec, 1)} s`
                  : `${formatNumber(docsDone)}/${formatNumber(totalDocs)} ${t('dash.docsCount')}`}
              </p>
              <button
                type="button"
                onClick={onClose}
                disabled={!done}
                className="h-9 rounded-lg bg-brand px-4 text-sm font-semibold text-canvas transition-all duration-100 ease-standard hover:bg-brand-hover active:scale-[0.97] disabled:cursor-default disabled:opacity-40"
              >
                {t('action.close')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
