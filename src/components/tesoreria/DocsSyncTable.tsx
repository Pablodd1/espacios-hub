import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Clock3, Eye, GitCompareArrows, Loader2, RotateCcw, X } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import StatusBadge from '@/components/StatusBadge';
import SystemChip from '@/components/SystemChip';
import { useLanguage } from '@/i18n';
import { getBanco, getTercero } from '@/lib/data';
import type { Documento, DocumentoEstado } from '@/lib/types';
import { cn } from '@/lib/utils';
import Toast from './Toast';

export type DocStatusFilter = DocumentoEstado | 'todos';

/** Date-only ISO strings (`YYYY-MM-DD`) parse as UTC midnight — anchor them to local noon. */
const dayOnly = (iso: string): string => (iso.length === 10 ? `${iso}T12:00:00` : iso);

/* ---------- Toolbar chips (shared by both pages' toolbars) ---------- */

interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  /** Brand (default) or sync accent when active. */
  tone?: 'brand' | 'sync';
}

/** Toggle chip used for bank / status / date filters — pop easeSnap 180ms. */
export function FilterChip({ active, onClick, children, tone = 'brand' }: FilterChipProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-xs font-semibold transition-colors duration-180 ease-standard',
        active
          ? tone === 'brand'
            ? 'border-brand/50 bg-brand-dim text-brand'
            : 'border-sync/50 bg-sync-dim text-sync'
          : 'border-hairline text-txt-secondary hover:border-border-strong hover:bg-[var(--bg-hover)] hover:text-txt-primary',
      )}
    >
      {children}
    </motion.button>
  );
}

/** Dismissible chip rendered in the active-filters row under the toolbar. */
export function DismissChip({ label, onDismiss }: { label: string; onDismiss: () => void }) {
  return (
    <motion.span
      className="flex h-6 items-center gap-1.5 rounded-md border border-border-strong bg-overlay px-2 text-[11px] font-medium text-txt-secondary"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.18, ease: [0.3, 1.4, 0.5, 1] }}
    >
      {label}
      <button
        type="button"
        onClick={onDismiss}
        aria-label={label}
        className="rounded-sm text-txt-muted transition-colors hover:text-txt-primary"
      >
        <X className="size-3" strokeWidth={2} />
      </button>
    </motion.span>
  );
}

/* ---------- HGI cell glyph per doc estado ---------- */

function HgiGlyph({ estado }: { estado: DocumentoEstado }) {
  switch (estado) {
    case 'sincronizado':
      return <Check className="size-3.5 text-brand" strokeWidth={2.5} />;
    case 'pendiente':
      return <Clock3 className="size-3.5 text-warn" strokeWidth={2} />;
    case 'error':
      return <X className="size-3.5 text-danger" strokeWidth={2.5} />;
    case 'diferencia':
      return <GitCompareArrows className="size-3.5 text-danger" strokeWidth={2} />;
  }
}

/* ---------- Inline retry confirm popover ---------- */

interface RetryState {
  doc: Documento;
  phase: 'confirm' | 'working';
}

/* ---------- Table ---------- */

interface DocsSyncTableProps {
  docs: Documento[];
  /** Show the Banco column (egresos). */
  showBank?: boolean;
  /** Show the Impuestos column (causaciones). */
  showTaxes?: boolean;
  onView: (doc: Documento) => void;
  /** Changes when filters change → re-runs the 25ms row stagger. */
  filterKey: string;
  emptyTitle?: string;
  emptyCaption?: string;
}

/**
 * Authoritative sync documents table (tesoreria.md §[D] / contabilidad.md §[C]):
 * per-system SIIGO/HGI status, hover-revealed actions, inline retry confirm,
 * 2px danger inset on error/diferencia rows, 25ms row stagger.
 */
export default function DocsSyncTable({
  docs,
  showBank = false,
  showTaxes = false,
  onView,
  filterKey,
  emptyTitle,
  emptyCaption,
}: DocsSyncTableProps) {
  const { t, formatCOP, formatDate, formatNumber } = useLanguage();
  const [retry, setRetry] = useState<RetryState | null>(null);
  const [toastDoc, setToastDoc] = useState<Documento | null>(null);

  // Auto-dismiss the retry toast.
  useEffect(() => {
    if (!toastDoc) return;
    const timer = window.setTimeout(() => setToastDoc(null), 4500);
    return () => window.clearTimeout(timer);
  }, [toastDoc]);

  const confirmRetry = () => {
    if (!retry) return;
    setRetry({ ...retry, phase: 'working' });
    window.setTimeout(() => {
      setToastDoc(retry.doc);
      setRetry(null);
    }, 900);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-hairline bg-elevated">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="h-9 border-b border-hairline">
              <th scope="col" className="text-overline px-4 font-semibold text-txt-muted">
                {t('teso.tableDoc')}
              </th>
              <th scope="col" className="text-overline px-4 font-semibold text-txt-muted">
                {t('common.date')}
              </th>
              <th scope="col" className="text-overline px-4 font-semibold text-txt-muted">
                {t('common.tercero')}
              </th>
              <th scope="col" className="text-overline px-4 font-semibold text-txt-muted">
                {t('teso.tableConcept')}
              </th>
              {showBank && (
                <th scope="col" className="text-overline px-4 font-semibold text-txt-muted">
                  {t('common.banco')}
                </th>
              )}
              <th scope="col" className="text-overline px-4 text-right font-semibold text-txt-muted">
                {t('common.amount')}
              </th>
              {showTaxes && (
                <th scope="col" className="text-overline px-4 text-right font-semibold text-txt-muted">
                  {t('conta.taxesCol')}
                </th>
              )}
              <th scope="col" className="text-overline px-4 font-semibold text-txt-muted">
                {t('sys.siigo')}
              </th>
              <th scope="col" className="text-overline px-4 font-semibold text-txt-muted">
                {t('sys.hgi')}
              </th>
              <th scope="col" className="text-overline px-4 font-semibold text-txt-muted">
                {t('common.status')}
              </th>
              <th scope="col" className="text-overline w-24 px-4 text-right font-semibold text-txt-muted">
                {t('teso.tableActions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {docs.map((doc, i) => {
              const tercero = getTercero(doc.tercero_id);
              const banco = getBanco(doc.banco_id);
              const dangerInset = doc.estado === 'error' || doc.estado === 'diferencia';
              const isRetryTarget = retry?.doc.id === doc.id;
              return (
                <motion.tr
                  key={`${filterKey}:${doc.id}`}
                  className="group h-11 cursor-pointer border-b border-hairline transition-colors duration-120 ease-standard last:border-b-0 hover:bg-[var(--bg-hover)]"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.025, 0.5), ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => onView(doc)}
                >
                  <td className="px-4">
                    <span
                      className={cn(
                        'font-mono-data text-[13px] font-medium text-txt-primary',
                        dangerInset && '-ml-1.5 border-l-2 border-danger pl-2',
                      )}
                    >
                      {doc.numero}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 text-[13px] text-txt-secondary">
                    {formatDate(dayOnly(doc.fecha), 'day')}
                  </td>
                  <td className="max-w-[200px] truncate px-4 text-[13px] text-txt-secondary">
                    {tercero?.nombre ?? '—'}
                  </td>
                  <td className="max-w-[220px] truncate px-4 text-[13px] text-txt-muted" title={doc.notas ?? undefined}>
                    {doc.notas ?? '—'}
                  </td>
                  {showBank && <td className="whitespace-nowrap px-4 text-[13px] text-txt-secondary">{banco?.nombre ?? '—'}</td>}
                  <td className="tabular whitespace-nowrap px-4 text-right font-mono-data text-[13px] text-txt-primary">
                    {formatCOP(doc.valor)}
                  </td>
                  {showTaxes && (
                    <td className="tabular whitespace-nowrap px-4 text-right font-mono-data text-[13px] text-txt-secondary">
                      {formatCOP(doc.iva + doc.retencion)}
                    </td>
                  )}
                  <td className="px-4">
                    <span className="flex items-center gap-1.5">
                      <SystemChip system="siigo" />
                      <Check className="size-3.5 text-brand" strokeWidth={2.5} />
                    </span>
                  </td>
                  <td className="px-4">
                    <span className="flex items-center gap-1.5">
                      <SystemChip system="hgi" />
                      <HgiGlyph estado={doc.estado} />
                    </span>
                  </td>
                  <td className="px-4">
                    <StatusBadge status={doc.estado} hideIcon />
                  </td>
                  <td className="relative px-4">
                    <span
                      className={cn(
                        'flex items-center justify-end gap-1 transition-opacity duration-120 ease-standard',
                        isRetryTarget ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                      )}
                    >
                      <button
                        type="button"
                        aria-label={`${t('action.retry')} ${doc.numero}`}
                        title={t('action.retry')}
                        disabled={doc.estado === 'sincronizado'}
                        onClick={(e) => {
                          e.stopPropagation();
                          setRetry({ doc, phase: 'confirm' });
                        }}
                        className="flex size-7 items-center justify-center rounded-md text-txt-muted transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary disabled:cursor-default disabled:opacity-30"
                      >
                        <RotateCcw className="size-3.5" strokeWidth={1.75} />
                      </button>
                      <button
                        type="button"
                        aria-label={`${t('action.viewDetail')} ${doc.numero}`}
                        title={t('action.viewDetail')}
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(doc);
                        }}
                        className="flex size-7 items-center justify-center rounded-md text-txt-muted transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary"
                      >
                        <Eye className="size-3.5" strokeWidth={1.75} />
                      </button>
                    </span>

                    {/* Inline retry confirm popover */}
                    <AnimatePresence>
                      {isRetryTarget && (
                        <>
                          <span className="fixed inset-0 z-30" onClick={(e) => { e.stopPropagation(); setRetry(null); }} aria-hidden />
                          <motion.span
                            role="dialog"
                            className={cn(
                              'absolute right-2 z-40 block w-64 rounded-lg border border-border-strong bg-overlay p-3 text-left shadow-xl',
                              i < docs.length - 1 ? 'top-full mt-1' : 'bottom-full mb-1',
                            )}
                            initial={{ opacity: 0, scale: 0.97, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.97, y: -4 }}
                            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="block text-[13px] text-txt-primary">
                              {t('teso.retryConfirm')} <span className="font-mono-data">{doc.numero}</span>?
                            </span>
                            <span className="mt-2.5 flex justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRetry(null);
                                }}
                                className="h-7 rounded-md px-2.5 text-xs font-medium text-txt-secondary transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary"
                              >
                                {t('action.cancel')}
                              </button>
                              <button
                                type="button"
                                disabled={retry.phase === 'working'}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmRetry();
                                }}
                                className="flex h-7 items-center gap-1.5 rounded-md bg-brand px-2.5 text-xs font-semibold text-canvas transition-all duration-100 hover:bg-brand-hover active:scale-[0.97] disabled:opacity-80"
                              >
                                {retry.phase === 'working' ? (
                                  <>
                                    <Loader2 className="size-3 animate-spin" strokeWidth={2} />
                                    {t('teso.retrying')}
                                  </>
                                ) : (
                                  t('action.retry')
                                )}
                              </button>
                            </span>
                          </motion.span>
                        </>
                      )}
                    </AnimatePresence>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {docs.length === 0 && <EmptyState title={emptyTitle} caption={emptyCaption} />}

      {docs.length > 0 && (
        <div className="flex h-11 items-center border-t border-hairline px-4">
          <p className="text-xs text-txt-muted">
            {t('common.showing')} {formatNumber(1)}–{formatNumber(docs.length)} {t('common.of')} {formatNumber(docs.length)}
          </p>
        </div>
      )}

      <Toast
        visible={toastDoc !== null}
        variant="sync"
        title={toastDoc ? `${toastDoc.numero} ${t('teso.retryToast')}` : ''}
      />
    </div>
  );
}
