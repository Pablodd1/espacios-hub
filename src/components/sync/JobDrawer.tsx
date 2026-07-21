import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Clock3, Loader2, X } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import SyncPair from '@/components/SyncPair';
import { moduleLabels, useLanguage } from '@/i18n';
import { getJobDurationSec } from '@/lib/data';
import type { SyncJob, SyncJobEstado } from '@/lib/types';
import { cn } from '@/lib/utils';
import type { JobOverride } from './JobsTable';
import { buildJobPayload, jobAttempts } from './payload';
import type { PayloadEntry } from './payload';

function PayloadWell({
  title,
  accent,
  entries,
  mismatches,
}: {
  title: string;
  accent: string;
  entries: PayloadEntry[];
  mismatches: Set<string>;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-hairline">
      <div
        className="flex h-8 items-center px-3 text-[11px] font-bold uppercase tracking-[0.08em]"
        style={{ backgroundColor: `${accent}1A`, color: accent }}
      >
        {title}
      </div>
      <div className="flex flex-col gap-0.5 bg-inset p-3">
        {entries.map((e) => (
          <div
            key={e.key}
            className={cn('flex items-baseline gap-2 rounded px-1.5 py-1', mismatches.has(e.key) && 'bg-danger-dim')}
          >
            <span className="w-32 shrink-0 font-mono-data text-[11px] text-txt-muted">{e.key}</span>
            <span className="break-all font-mono-data text-xs text-txt-primary">{e.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const ATTEMPT_ICON: Record<SyncJobEstado, { icon: typeof CheckCircle2; color: string; spin?: boolean }> = {
  completado: { icon: CheckCircle2, color: 'var(--brand)' },
  error: { icon: AlertTriangle, color: 'var(--danger)' },
  pendiente: { icon: Clock3, color: 'var(--warning)' },
  en_proceso: { icon: Loader2, color: 'var(--sync)', spin: true },
};

interface JobDrawerProps {
  job: SyncJob | null;
  override?: JobOverride;
  onClose: () => void;
}

/** Job drawer — SIIGO vs HGI payload diff, attempts timeline, idempotency key. */
export default function JobDrawer({ job, override, onClose }: JobDrawerProps) {
  const { t, lang, formatDate, formatNumber } = useLanguage();

  return (
    <AnimatePresence>
      {job && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-[rgba(4,6,10,0.6)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal
            aria-label={t('sync.drawerTitle')}
            className="fixed inset-y-0 right-0 z-50 flex w-[520px] max-w-[94vw] flex-col border-l border-border-strong bg-overlay shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            {(() => {
              const effective = override ?? job.estado;
              const payload = buildJobPayload(job, lang);
              const attempts = jobAttempts(job, override);
              const dur = getJobDurationSec(job);
              return (
                <>
                  {/* Sticky header */}
                  <div className="flex items-start justify-between gap-3 border-b border-hairline p-5">
                    <div>
                      <p className="text-overline text-txt-muted">{t('sync.drawerTitle')}</p>
                      <h2 className="mt-1 font-mono-data text-[17px] font-semibold text-txt-primary">{job.id}</h2>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <SyncPair direction={job.direccion} />
                        {effective === 'pendiente' ? (
                          <span
                            className="inline-flex h-[22px] items-center gap-1.5 rounded-md px-2 text-xs font-semibold"
                            style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}
                          >
                            <Clock3 className="size-3" strokeWidth={2.25} aria-hidden />
                            {t('sync.enCola')}
                          </span>
                        ) : (
                          <StatusBadge
                            status={effective}
                            label={effective === 'en_proceso' ? t('sync.retrying') : undefined}
                          />
                        )}
                      </div>
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

                  <div className="flex-1 overflow-y-auto">
                    {/* Key facts */}
                    <div className="grid grid-cols-2 gap-px border-b border-hairline bg-hairline">
                      {[
                        { label: t('common.module'), value: t(moduleLabels[job.modulo as keyof typeof moduleLabels] ?? 'modules.tesoreria') },
                        { label: t('sync.colRecords'), value: formatNumber(job.docs_procesados) },
                        { label: t('sync.colDuration'), value: dur !== null ? `${formatNumber(dur, 1)} s` : '—' },
                        { label: t('sync.colTime'), value: formatDate(job.started_at, 'short') },
                      ].map((kv) => (
                        <div key={kv.label} className="bg-overlay px-5 py-3">
                          <p className="text-overline text-txt-muted">{kv.label}</p>
                          <p className="tabular mt-1 text-sm font-medium text-txt-primary">{kv.value}</p>
                        </div>
                      ))}
                    </div>

                    {job.mensaje && (
                      <div className="border-b border-hairline p-5">
                        <p className="text-overline text-txt-muted">{t('common.description')}</p>
                        <p className="mt-1.5 text-[13px] leading-5 text-txt-secondary">{job.mensaje}</p>
                      </div>
                    )}

                    {/* Payload diff viewer */}
                    <div className="border-b border-hairline p-5">
                      <div className="grid grid-cols-1 gap-3">
                        <PayloadWell
                          title={t('sync.payloadSiigo')}
                          accent="#FF8A00"
                          entries={payload.siigo}
                          mismatches={payload.mismatches}
                        />
                        <PayloadWell
                          title={t('sync.payloadHgi')}
                          accent="#4F8CFF"
                          entries={payload.hgi}
                          mismatches={payload.mismatches}
                        />
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <p className="text-overline text-txt-muted">{t('sync.idempotency')}</p>
                        <span className="inline-flex h-[22px] items-center rounded-md bg-inset px-2 font-mono-data text-[11px] font-medium text-txt-secondary">
                          {payload.idempotency}
                        </span>
                      </div>
                    </div>

                    {/* Attempts timeline */}
                    <div className="p-5">
                      <p className="text-overline text-txt-muted">{t('sync.attempts')}</p>
                      <ul className="mt-3 flex flex-col">
                        {attempts.map((a, i) => {
                          const meta = ATTEMPT_ICON[a.estado];
                          const Icon = meta.icon;
                          return (
                            <li key={a.n} className="relative flex gap-3 pb-4 last:pb-0">
                              {i < attempts.length - 1 && (
                                <span className="absolute left-[7px] top-4 h-full w-px bg-border-strong" aria-hidden />
                              )}
                              <Icon
                                className={cn('relative z-10 mt-0.5 size-3.5 shrink-0 bg-overlay', meta.spin && 'animate-spin')}
                                style={{ color: meta.color }}
                                strokeWidth={2}
                                aria-hidden
                              />
                              <div className="flex flex-1 items-baseline justify-between gap-2">
                                <p className="text-[13px] text-txt-primary">
                                  {t('sync.attempt')} {a.n}/3 ·{' '}
                                  <StatusBadge status={a.estado} hideIcon className="ml-1" />
                                </p>
                                <span className="tabular font-mono-data text-[11px] text-txt-muted">
                                  {a.durationSec !== null ? `${formatNumber(a.durationSec, 1)} s · ` : ''}
                                  {formatDate(a.at, 'time')}
                                </span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </>
              );
            })()}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
