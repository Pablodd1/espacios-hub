import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpenCheck,
  Clock3,
  Eye,
  HandCoins,
  Landmark,
  Loader2,
  Percent,
  RotateCcw,
  Search,
  Ship,
  Truck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import StatusBadge from '@/components/StatusBadge';
import SyncPair from '@/components/SyncPair';
import { formatRelative, moduleLabels, useLanguage } from '@/i18n';
import type { DictKey } from '@/i18n';
import { REFERENCE_NOW, getJobDurationSec, syncJobs } from '@/lib/data';
import type { SyncJob, SyncJobEstado } from '@/lib/types';
import { ConfirmPopover, MiniSwitch } from '@/components/comisiones/ui-bits';
import { cn } from '@/lib/utils';
import { jobTipo } from './stats';
import type { JobTipo } from './stats';

export type JobOverride = 'en_proceso' | 'completado';

const MODULE_ICON: Record<string, LucideIcon> = {
  Tesoreria: Landmark,
  Cartera: HandCoins,
  'Comercio Exterior': Ship,
  Comisiones: Percent,
  Contabilidad: BookOpenCheck,
  Logistica: Truck,
};

const MODULE_ORDER = ['Tesoreria', 'Cartera', 'Comercio Exterior', 'Comisiones', 'Contabilidad', 'Logistica'];

const STATUS_META: Record<SyncJobEstado, { key: DictKey; color: string }> = {
  completado: { key: 'status.completed', color: 'var(--brand)' },
  error: { key: 'status.error', color: 'var(--danger)' },
  en_proceso: { key: 'status.inProgress', color: 'var(--sync)' },
  pendiente: { key: 'sync.enCola', color: 'var(--text-muted)' },
};

const TIPO_KEY: Record<JobTipo, DictKey> = {
  egreso: 'sync.type.egreso',
  recibo: 'sync.type.recibo',
  causacion: 'sync.type.causacion',
  compra: 'sync.type.compra',
  contenedor: 'sync.type.contenedor',
  conciliacion: 'sync.type.conciliacion',
  calculo: 'sync.type.calculo',
  otro: 'sync.type.otro',
};

interface JobsTableProps {
  overrides: Partial<Record<string, JobOverride>>;
  onRetry: (job: SyncJob) => void;
  onOpen: (job: SyncJob) => void;
}

/** [C] Historial de trabajos — filters, retry with confirm, error hints, drawer trigger. */
export default function JobsTable({ overrides, onRetry, onOpen }: JobsTableProps) {
  const { t, lang, formatNumber } = useLanguage();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [query, setQuery] = useState('');
  const [modulos, setModulos] = useState<Set<string>>(new Set());
  const [estados, setEstados] = useState<Set<SyncJobEstado>>(new Set());
  const [retryFor, setRetryFor] = useState<{ job: SyncJob; anchor: DOMRect } | null>(null);

  const jobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...syncJobs]
      .sort((a, b) => b.started_at.localeCompare(a.started_at))
      .filter((j) => {
        if (modulos.size > 0 && !modulos.has(j.modulo)) return false;
        const effective = overrides[j.id] ?? j.estado;
        if (estados.size > 0 && !estados.has(effective)) return false;
        if (q && !j.id.toLowerCase().includes(q) && !(j.mensaje ?? '').toLowerCase().includes(q)) return false;
        return true;
      });
  }, [query, modulos, estados, overrides]);

  const toggleSet = <T,>(set: Set<T>, value: T): Set<T> => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  };

  const chipCls = (active: boolean) =>
    cn(
      'flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-[11px] font-semibold transition-all duration-180 ease-standard',
      active
        ? 'border-border-strong bg-overlay text-txt-primary'
        : 'border-transparent bg-inset text-txt-muted hover:text-txt-secondary',
    );

  return (
    <motion.section
      className="overflow-hidden rounded-xl border border-hairline bg-elevated"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      {/* Header: title + auto-refresh */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-3">
        <div>
          <h2 className="font-display text-[17px] font-semibold leading-6 text-txt-primary">{t('sync.jobs')}</h2>
          <p className="mt-0.5 text-xs text-txt-muted">{t('sync.jobsCaption')}</p>
        </div>
        <label className="flex items-center gap-2.5">
          <span className="text-xs font-medium" style={{ color: autoRefresh ? 'var(--sync)' : 'var(--text-muted)' }}>
            {t('sync.autoRefresh')}
          </span>
          <MiniSwitch checked={autoRefresh} onChange={setAutoRefresh} ariaLabel={t('sync.autoRefresh')} tone="sync" />
        </label>
      </div>

      {/* Toolbar: search + module chips + status chips */}
      <div className="flex flex-wrap items-center gap-2 border-y border-hairline bg-surface px-5 py-3">
        <div className="flex h-8 items-center gap-2 rounded-lg bg-inset px-2.5">
          <Search className="size-3.5 text-txt-muted" strokeWidth={1.75} aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('sync.searchJobs')}
            className="w-48 bg-transparent font-mono-data text-xs text-txt-primary placeholder:text-txt-muted focus:outline-none"
          />
        </div>
        <span className="mx-1 h-5 w-px bg-hairline" aria-hidden />
        {MODULE_ORDER.map((m) => (
          <button key={m} type="button" className={chipCls(modulos.has(m))} onClick={() => setModulos((s) => toggleSet(s, m))}>
            {(() => {
              const Icon = MODULE_ICON[m] ?? Loader2;
              return <Icon className="size-3" strokeWidth={2} aria-hidden />;
            })()}
            {t(moduleLabels[m as keyof typeof moduleLabels])}
          </button>
        ))}
        <span className="mx-1 h-5 w-px bg-hairline" aria-hidden />
        {(Object.keys(STATUS_META) as SyncJobEstado[]).map((s) => (
          <button key={s} type="button" className={chipCls(estados.has(s))} onClick={() => setEstados((prev) => toggleSet(prev, s))}>
            <span className="size-1.5 rounded-full" style={{ backgroundColor: STATUS_META[s].color }} />
            {t(STATUS_META[s].key)}
          </button>
        ))}
      </div>

      {jobs.length === 0 ? (
        <EmptyState title={t('sync.emptyJobs')} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="h-9 border-b border-hairline">
                <th className="text-overline px-5 font-semibold text-txt-muted">{t('sync.colJob')}</th>
                <th className="text-overline px-4 font-semibold text-txt-muted">{t('common.module')}</th>
                <th className="text-overline px-4 font-semibold text-txt-muted">{t('sync.colFlow')}</th>
                <th className="text-overline px-4 font-semibold text-txt-muted">{t('sync.colType')}</th>
                <th className="text-overline px-4 text-right font-semibold text-txt-muted">{t('sync.colRecords')}</th>
                <th className="text-overline px-4 text-right font-semibold text-txt-muted">{t('sync.colDuration')}</th>
                <th className="text-overline px-4 font-semibold text-txt-muted">{t('common.status')}</th>
                <th className="text-overline px-4 font-semibold text-txt-muted">{t('sync.colTime')}</th>
                <th className="text-overline px-4 text-right font-semibold text-txt-muted">{t('sync.colActions')}</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, i) => {
                const effective = overrides[job.id] ?? job.estado;
                const dur = getJobDurationSec(job);
                const Icon = MODULE_ICON[job.modulo] ?? Loader2;
                const retrying = overrides[job.id] === 'en_proceso';
                return (
                  <motion.tr
                    key={job.id}
                    className={cn(
                      'h-11 cursor-pointer border-b border-hairline transition-colors duration-120 ease-standard last:border-b-0 hover:bg-[var(--bg-hover)]',
                      effective === 'error' && 'shadow-[inset_2px_0_0_var(--danger)]',
                    )}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(i * 0.025, 0.5), ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => onOpen(job)}
                  >
                    <td className="px-5 font-mono-data text-[13px] font-medium text-txt-primary">{job.id}</td>
                    <td className="px-4">
                      <span className="flex items-center gap-2 text-[13px] text-txt-secondary">
                        <Icon className="size-4 shrink-0 text-txt-muted" strokeWidth={1.75} aria-hidden />
                        {t(moduleLabels[job.modulo as keyof typeof moduleLabels] ?? 'modules.tesoreria')}
                      </span>
                    </td>
                    <td className="px-4">
                      <SyncPair direction={job.direccion} />
                    </td>
                    <td className="px-4">
                      <span className="inline-flex h-[22px] items-center rounded-md bg-inset px-2 font-mono-data text-[11px] font-medium text-txt-secondary">
                        {t(TIPO_KEY[jobTipo(job)])}
                      </span>
                    </td>
                    <td className="tabular px-4 text-right font-mono-data text-[13px] text-txt-primary">
                      {formatNumber(job.docs_procesados)}
                    </td>
                    <td className="tabular px-4 text-right font-mono-data text-[13px] text-txt-secondary">
                      {dur !== null ? `${formatNumber(dur, 1)} s` : '—'}
                    </td>
                    <td className="px-4">
                      <div className="group relative w-fit">
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
                            label={retrying || effective === 'en_proceso' ? t('sync.retrying') : undefined}
                          />
                        )}
                        {effective === 'en_proceso' && (
                          <span className="ml-1.5 font-mono-data text-[10px] text-txt-muted">({t('sync.attempt')} 2/3)</span>
                        )}
                        {effective === 'error' && job.mensaje && (
                          <span className="pointer-events-none absolute bottom-full left-0 z-20 mb-1.5 hidden w-64 rounded-md border border-border-strong bg-overlay p-2.5 text-[11px] leading-4 text-txt-secondary shadow-xl group-hover:block">
                          <span className="font-semibold" style={{ color: 'var(--danger)' }}>
                              {t('status.error')}
                            </span>{' '}
                            · {job.mensaje}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 text-xs text-txt-muted">
                      {formatRelative(job.started_at, lang, REFERENCE_NOW)}
                    </td>
                    <td className="px-4">
                      <div className="flex items-center justify-end gap-1">
                        {effective === 'error' && (
                          <button
                            type="button"
                            aria-label={`${t('action.retry')} — ${job.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setRetryFor({ job, anchor: e.currentTarget.getBoundingClientRect() });
                            }}
                            className="inline-flex size-7 items-center justify-center rounded-md text-txt-muted transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary"
                          >
                            <RotateCcw className="size-4" strokeWidth={1.75} />
                          </button>
                        )}
                        <button
                          type="button"
                          aria-label={`${t('action.viewDetail')} — ${job.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpen(job);
                          }}
                          className="inline-flex size-7 items-center justify-center rounded-md text-txt-muted transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary"
                        >
                          <Eye className="size-4" strokeWidth={1.75} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmPopover
        open={retryFor !== null}
        anchor={retryFor?.anchor ?? null}
        text={`${t('sync.retryTitle')} ${retryFor?.job.id ?? ''} — ${t('sync.retryBody')}`}
        confirmLabel={t('action.retry')}
        cancelLabel={t('action.cancel')}
        onConfirm={() => {
          if (retryFor) onRetry(retryFor.job);
          setRetryFor(null);
        }}
        onCancel={() => setRetryFor(null)}
      />
    </motion.section>
  );
}
