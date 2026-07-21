import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Clock3, FileInput, RefreshCw, X } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import SystemChip from '@/components/SystemChip';
import { useLanguage } from '@/i18n';
import { getTercero } from '@/lib/data';
import type { Documento } from '@/lib/types';
import { cn } from '@/lib/utils';
import { itemsOf } from './logistica-vm';

function KV({ label, value, mono = false, large = false }: { label: string; value: string; mono?: boolean; large?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-overline text-txt-muted">{label}</p>
      <p
        className={cn(
          'mt-1 truncate text-txt-primary',
          large ? 'tabular font-mono-data text-[15px] font-medium' : 'text-sm',
          mono && !large && 'font-mono-data text-[13px]',
        )}
      >
        {value}
      </p>
    </div>
  );
}

interface CompraDrawerProps {
  doc: Documento | null;
  onClose: () => void;
}

/** Compra detail drawer — resumen / trazabilidad / comparación SIIGO vs HGI. */
export default function CompraDrawer({ doc, onClose }: CompraDrawerProps) {
  const { t, formatCOP, formatDate, formatNumber } = useLanguage();

  useEffect(() => {
    if (!doc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [doc, onClose]);

  const d = doc;
  const synced = d?.sincronizado_hgi ?? false;
  const hasDiff = d?.estado === 'diferencia' || d?.estado === 'error';

  // SIIGO vs HGI comparison rows — HGI mirrors unless diferencia/error
  const compare = d
    ? ([
        { label: t('logi.fieldValor'), siigo: d.valor, hgi: hasDiff ? d.valor - Math.round(d.valor * 0.002) : d.valor },
        { label: t('logi.fieldBase'), siigo: d.base, hgi: d.base },
        { label: t('logi.fieldIva'), siigo: d.iva, hgi: d.iva },
      ] as const)
    : [];

  const timeline = d
    ? [
        { label: t('logi.compraStepEntered'), state: 'done' as const, ts: d.created_at, icon: FileInput },
        {
          label: t('logi.compraStepValidated'),
          state: d.estado === 'error' ? ('error' as const) : ('done' as const),
          ts: d.created_at,
          icon: d.estado === 'error' ? Clock3 : Check,
        },
        {
          label: synced ? t('logi.compraStepSynced') : t('logi.compraStepPending'),
          state: synced ? ('done' as const) : ('pending' as const),
          ts: d.created_at,
          icon: synced ? Check : RefreshCw,
        },
      ]
    : [];

  return (
    <AnimatePresence>
      {d && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-[rgba(4,6,10,0.5)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal
            aria-label={d.numero}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[520px] flex-col border-l border-border-strong bg-overlay"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-hairline px-6 py-5">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-mono-data text-[17px] font-semibold text-txt-primary">{d.numero}</h2>
                  <StatusBadge status={d.estado} />
                </div>
                <p className="mt-1.5 text-xs text-txt-muted">
                  {formatDate(d.fecha, 'day')} · {getTercero(d.tercero_id)?.nombre ?? t('logi.unmapped')}
                </p>
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
              {/* Resumen */}
              <section className="border-b border-hairline px-6 py-5">
                <h3 className="text-overline mb-4 text-txt-muted">{t('logi.compraSummary')}</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <KV label={t('logi.colProveedor')} value={getTercero(d.tercero_id)?.nombre ?? t('logi.unmapped')} />
                  <KV label={t('common.date')} value={formatDate(d.fecha, 'day')} />
                  <KV label={t('logi.fieldValor')} value={formatCOP(d.valor)} large />
                  <KV label={t('logi.colItems')} value={formatNumber(itemsOf(d))} mono />
                  <KV label={t('logi.fieldBase')} value={formatCOP(d.base)} mono />
                  <KV label={t('logi.fieldIva')} value={formatCOP(d.iva)} mono />
                  <KV label={t('common.origin')} value={d.sistema_origen} mono />
                  <KV label={t('common.status')} value={t(d.estado === 'sincronizado' ? 'status.synced' : d.estado === 'pendiente' ? 'status.pending' : d.estado === 'diferencia' ? 'status.diff' : 'status.error')} />
                </div>
                {d.notas && (
                  <p className="mt-4 rounded-lg bg-inset px-3 py-2 text-xs text-txt-secondary">{d.notas}</p>
                )}
              </section>

              {/* Trazabilidad */}
              <section className="border-b border-hairline px-6 py-5">
                <h3 className="text-overline mb-4 text-txt-muted">{t('logi.compraTimeline')}</h3>
                <ul className="flex flex-col gap-3">
                  {timeline.map((step, i) => {
                    const Icon = step.icon;
                    return (
                      <motion.li
                        key={step.label}
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 + i * 0.09, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <span
                          className="flex size-6 items-center justify-center rounded-full"
                          style={{
                            backgroundColor:
                              step.state === 'done'
                                ? 'var(--brand-dim)'
                                : step.state === 'error'
                                  ? 'var(--danger-dim)'
                                  : 'var(--warning-dim)',
                          }}
                        >
                          <Icon
                            className="size-3"
                            style={{
                              color:
                                step.state === 'done'
                                  ? 'var(--brand)'
                                  : step.state === 'error'
                                    ? 'var(--danger)'
                                    : 'var(--warning)',
                            }}
                            strokeWidth={2}
                          />
                        </span>
                        <span className="flex-1 text-sm text-txt-primary">{step.label}</span>
                        <span className="font-mono-data text-[11px] text-txt-muted">{formatDate(step.ts, 'short')}</span>
                      </motion.li>
                    );
                  })}
                </ul>
              </section>

              {/* Comparación SIIGO vs HGI */}
              <section className="px-6 py-5">
                <h3 className="text-overline mb-4 text-txt-muted">{t('logi.compraCompare')}</h3>
                <div className="overflow-hidden rounded-lg border border-hairline">
                  <div className="grid grid-cols-[1fr_1fr_1fr] items-center gap-px border-b border-hairline bg-inset px-3 py-2">
                    <span />
                    <SystemChip system="siigo" />
                    <SystemChip system="hgi" />
                  </div>
                  {compare.map((row) => {
                    const mismatch = row.siigo !== row.hgi;
                    return (
                      <div
                        key={row.label}
                        className="grid grid-cols-[1fr_1fr_1fr] items-center gap-px border-b border-hairline px-3 py-2.5 last:border-b-0"
                      >
                        <span className="text-xs text-txt-secondary">{row.label}</span>
                        <span className="tabular font-mono-data text-[13px] text-txt-primary">{formatCOP(row.siigo)}</span>
                        <span
                          className={cn('tabular rounded px-1 font-mono-data text-[13px]', mismatch ? 'text-txt-primary' : 'text-txt-primary')}
                          style={mismatch ? { backgroundColor: 'var(--danger-dim)' } : undefined}
                        >
                          {formatCOP(row.hgi)}
                          {mismatch && (
                            <span className="ml-1.5 text-[11px] font-semibold" style={{ color: 'var(--danger)' }}>
                              Δ {formatCOP(row.siigo - row.hgi)}
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
