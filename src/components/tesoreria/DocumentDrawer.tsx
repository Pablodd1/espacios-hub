import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Clock3, GitCompareArrows, Loader2, RotateCcw, X } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import SystemChip from '@/components/SystemChip';
import { docTypeLabels, useLanguage } from '@/i18n';
import { getBanco, getTercero, reconciliacion } from '@/lib/data';
import type { Documento, Reconciliacion } from '@/lib/types';
import { cn } from '@/lib/utils';
import { getBankMeta } from './bank-meta';
import Toast from './Toast';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as [number, number, number, number];

/** Latest open reconciliation row referencing this document, if any. */
function getDocReconciliacion(doc: Documento): Reconciliacion | undefined {
  return reconciliacion.find((r) => !r.resuelto && r.diferencia !== 0 && r.concepto.includes(doc.numero));
}

/** Deterministic HGI ledger entry number derived from the document number. */
function hgiEntryNumber(numero: string): number {
  const digits = Number.parseInt(numero.replace(/\D/g, ''), 10);
  return 4000 + (Number.isNaN(digits) ? 0 : digits % 900);
}

function addMinutes(iso: string, minutes: number): Date {
  return new Date(new Date(iso).getTime() + minutes * 60_000);
}

interface TimelineNode {
  label: string;
  time: string;
  dotColor: string;
  caption?: string;
  glyph?: 'check' | 'clock' | 'warn' | 'error';
}

function KeyValue({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-overline shrink-0 pt-0.5 text-txt-muted">{label}</span>
      <span className={cn('text-right text-sm text-txt-primary', mono && 'tabular font-mono-data text-[13px]')}>{value}</span>
    </div>
  );
}

interface DocumentDrawerProps {
  doc: Documento | null;
  onClose: () => void;
}

/**
 * Document detail drawer (tesoreria.md §[E] / contabilidad.md §[C]) — 520px
 * right panel: resumen key-value grid, sync mini-timeline, SIIGO vs HGI
 * side-by-side diff with highlighted mismatches, retry + audit footer.
 */
export default function DocumentDrawer({ doc, onClose }: DocumentDrawerProps) {
  const { t, formatCOP, formatDate } = useLanguage();
  const navigate = useNavigate();
  const [retrying, setRetrying] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  // Esc closes the drawer.
  useEffect(() => {
    if (!doc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [doc, onClose]);

  useEffect(() => {
    if (!toastVisible) return;
    const timer = window.setTimeout(() => setToastVisible(false), 4500);
    return () => window.clearTimeout(timer);
  }, [toastVisible]);

  const startRetry = () => {
    if (retrying) return;
    setRetrying(true);
    window.setTimeout(() => {
      setRetrying(false);
      setToastVisible(true);
    }, 900);
  };

  const tercero = doc ? getTercero(doc.tercero_id) : undefined;
  const banco = doc ? getBanco(doc.banco_id) : undefined;
  const meta = getBankMeta(banco);
  const recRow = doc ? getDocReconciliacion(doc) : undefined;

  const timeline: TimelineNode[] = doc
    ? [
        {
          label: t('docDrawer.createdSiigo'),
          time: formatDate(doc.created_at, 'time'),
          dotColor: 'var(--siigo)',
        },
        {
          label: t('docDrawer.detected'),
          time: formatDate(addMinutes(doc.created_at, 3), 'time'),
          dotColor: 'var(--sync)',
        },
        doc.estado === 'sincronizado'
          ? {
              label: t('docDrawer.publishedHgi'),
              time: formatDate(addMinutes(doc.created_at, 5), 'time'),
              dotColor: 'var(--hgi)',
              caption: `${t('docDrawer.entry')} #${hgiEntryNumber(doc.numero)}`,
              glyph: 'check',
            }
          : doc.estado === 'diferencia'
            ? {
                label: t('docDrawer.publishedDiff'),
                time: formatDate(addMinutes(doc.created_at, 5), 'time'),
                dotColor: 'var(--warning)',
                caption: `${t('docDrawer.entry')} #${hgiEntryNumber(doc.numero)}`,
                glyph: 'warn',
              }
            : doc.estado === 'error'
              ? { label: t('docDrawer.failedHgi'), time: '—', dotColor: 'var(--danger)', glyph: 'error' }
              : { label: t('docDrawer.pendingHgi'), time: '—', dotColor: 'var(--warning)', glyph: 'clock' },
      ]
    : [];

  const siigoValor = doc?.valor ?? 0;
  const hgiValor = recRow?.valor_hgi ?? siigoValor;
  const valorMismatch = recRow !== undefined && hgiValor !== siigoValor;

  const compareRows: { label: string; siigo: string; hgi: string; mismatch: boolean; delta?: number }[] = doc
    ? [
        {
          label: t('docDrawer.account'),
          siigo: banco ? meta.siigoCuenta : '—',
          hgi: banco ? meta.hgiCuenta : '—',
          mismatch: false,
        },
        { label: t('common.tercero'), siigo: tercero?.nombre ?? '—', hgi: tercero?.nombre ?? '—', mismatch: false },
        {
          label: t('docDrawer.value'),
          siigo: formatCOP(siigoValor),
          hgi: formatCOP(hgiValor),
          mismatch: valorMismatch,
          delta: valorMismatch ? Math.abs(siigoValor - hgiValor) : undefined,
        },
        {
          label: t('docDrawer.taxes'),
          siigo: formatCOP(doc.iva + doc.retencion),
          hgi: formatCOP(doc.iva + doc.retencion),
          mismatch: false,
        },
      ]
    : [];

  const taxesDetail = doc
    ? `${t('docDrawer.retention')} ${formatCOP(doc.retencion)} · IVA ${formatCOP(doc.iva)}`
    : '';

  return (
    <>
      <AnimatePresence>
        {doc && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-[rgb(4,6,10)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={onClose}
            />
            <motion.aside
              role="dialog"
              aria-modal
              aria-label={doc.numero}
              className="fixed inset-y-0 right-0 z-50 flex w-[520px] max-w-full flex-col border-l border-border-strong bg-overlay"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.28, ease: EASE_OUT_EXPO }}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-hairline px-6 py-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="font-mono-data text-lg font-medium text-txt-primary">{doc.numero}</h2>
                    <StatusBadge status={doc.estado} />
                  </div>
                  <p className="mt-1 text-xs text-txt-muted">
                    {t(docTypeLabels[doc.tipo])} · {t('docDrawer.createdIn')} {formatDate(doc.created_at, 'short')}
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

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 pb-6">
                {/* Resumen */}
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.08, ease: EASE_OUT_EXPO }}
                  className="border-b border-hairline py-4"
                >
                  <h3 className="text-overline mb-2 text-txt-muted">{t('docDrawer.summary')}</h3>
                  <div className="divide-y divide-hairline/60">
                    <KeyValue label={t('common.tercero')} value={tercero?.nombre ?? '—'} />
                    <KeyValue label={t('docDrawer.nit')} value={tercero?.nit ?? '—'} mono />
                    <KeyValue label={t('docDrawer.concept')} value={doc.notas ?? '—'} />
                    {banco && <KeyValue label={t('docDrawer.bankAccount')} value={`${banco.nombre} · ${meta.mask}`} mono />}
                    <KeyValue label={t('common.amount')} value={formatCOP(doc.valor)} mono />
                    <KeyValue label={t('docDrawer.taxes')} value={taxesDetail} mono />
                    <KeyValue label={t('docDrawer.paymentMethod')} value={t('docDrawer.paymentTransfer')} />
                  </div>
                </motion.section>

                {/* Sincronización — vertical mini-timeline */}
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.15, ease: EASE_OUT_EXPO }}
                  className="border-b border-hairline py-4"
                >
                  <h3 className="text-overline mb-3 text-txt-muted">{t('docDrawer.syncSection')}</h3>
                  <div className="relative pl-6">
                    <motion.span
                      className="absolute bottom-2 left-[5px] top-2 w-px bg-border-strong"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.3, delay: 0.25 }}
                      style={{ transformOrigin: 'top' }}
                    />
                    {timeline.map((node, i) => (
                      <motion.div
                        key={node.label}
                        className="relative flex items-center justify-between gap-3 py-2"
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.28, delay: 0.2 + i * 0.07, ease: EASE_OUT_EXPO }}
                      >
                        <span
                          className="absolute -left-6 top-1/2 size-[11px] -translate-y-1/2 rounded-full border-2 border-overlay"
                          style={{ backgroundColor: node.dotColor }}
                        />
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="truncate text-[13px] text-txt-primary">{node.label}</span>
                          {node.glyph === 'check' && <CheckCircle2 className="size-3.5 shrink-0 text-brand" strokeWidth={2} />}
                          {node.glyph === 'clock' && <Clock3 className="size-3.5 shrink-0 text-warn" strokeWidth={2} />}
                          {node.glyph === 'warn' && <GitCompareArrows className="size-3.5 shrink-0 text-warn" strokeWidth={2} />}
                          {node.glyph === 'error' && <X className="size-3.5 shrink-0 text-danger" strokeWidth={2.5} />}
                          {node.caption && (
                            <span className="shrink-0 font-mono-data text-[11px] text-txt-muted">({node.caption})</span>
                          )}
                        </span>
                        <span className="tabular shrink-0 font-mono-data text-xs text-txt-muted">{node.time}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>

                {/* Comparación SIIGO vs HGI */}
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.22, ease: EASE_OUT_EXPO }}
                  className="py-4"
                >
                  <h3 className="text-overline mb-3 text-txt-muted">{t('docDrawer.compare')}</h3>
                  <div className="overflow-hidden rounded-lg border border-hairline bg-inset">
                    <div className="grid grid-cols-[110px_1fr_1fr] items-center gap-3 border-b border-hairline px-3 py-2">
                      <span />
                      <SystemChip system="siigo" className="justify-self-start" />
                      <SystemChip system="hgi" className="justify-self-start" />
                    </div>
                    {compareRows.map((row) => (
                      <div
                        key={row.label}
                        className={cn(
                          'grid grid-cols-[110px_1fr_1fr] items-center gap-3 border-b border-hairline px-3 py-2.5 last:border-b-0',
                          row.mismatch && 'bg-danger-dim',
                        )}
                      >
                        <span className="text-overline text-txt-muted">{row.label}</span>
                        <span className="truncate font-mono-data text-[13px] text-txt-primary">{row.siigo}</span>
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="truncate font-mono-data text-[13px] text-txt-primary">{row.hgi}</span>
                          {row.mismatch && row.delta !== undefined && (
                            <motion.span
                              className="tabular shrink-0 rounded-md bg-danger-dim px-1.5 py-0.5 font-mono-data text-[11px] font-semibold text-danger"
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.2, ease: [0.3, 1.4, 0.5, 1] }}
                            >
                              Δ {formatCOP(row.delta)}
                            </motion.span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.section>
              </div>

              {/* Footer actions */}
              <div className="flex items-center gap-2 border-t border-hairline px-6 py-4">
                <button
                  type="button"
                  onClick={startRetry}
                  disabled={retrying || doc.estado === 'sincronizado'}
                  className="flex h-9 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-canvas transition-all duration-100 ease-standard hover:bg-brand-hover active:scale-[0.97] disabled:cursor-default disabled:opacity-50"
                >
                  {retrying ? <Loader2 className="size-4 animate-spin" strokeWidth={1.75} /> : <RotateCcw className="size-4" strokeWidth={1.75} />}
                  {retrying ? t('teso.retrying') : t('docDrawer.retry')}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/sync-center')}
                  className="h-9 rounded-lg border border-border-strong px-4 text-sm font-medium text-txt-secondary transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary"
                >
                  {t('docDrawer.viewAudit')}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <Toast visible={toastVisible} variant="sync" title={doc ? `${doc.numero} ${t('teso.retryToast')}` : ''} />
    </>
  );
}
