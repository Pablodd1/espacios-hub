import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Check, Loader2, RefreshCw } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { useLanguage } from '@/i18n';
import type { DictKey } from '@/i18n';
import { DATA_TODAY, documentos, reconciliacion } from '@/lib/data';
import type { Documento, Reconciliacion } from '@/lib/types';
import { cn } from '@/lib/utils';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as [number, number, number, number];

/** Date-only ISO strings (`YYYY-MM-DD`) parse as UTC midnight — anchor them to local noon. */
const dayOnly = (iso: string): string => (iso.length === 10 ? `${iso}T12:00:00` : iso);

type Bucket = 'base' | 'iva' | 'retencion';

const BUCKET_LABEL: Record<Bucket, DictKey> = {
  base: 'conta.bucketBase',
  iva: 'conta.bucketIva',
  retencion: 'conta.bucketRetencion',
};

/** Document referenced by a reconciliation row (`concepto` ends with the doc number). */
function docOf(rec: Reconciliacion): Documento | undefined {
  const numero = rec.concepto.split(' ').pop();
  return documentos.find((d) => d.numero === numero);
}

/** Classify an open difference into a fiscal bucket from the linked document's composition. */
function bucketOf(rec: Reconciliacion): Bucket {
  const doc = docOf(rec);
  if (!doc) return 'base';
  if (doc.retencion > 0) return 'retencion';
  if (doc.iva > 0) return 'iva';
  return 'base';
}

/** Causa probable hint derived from the linked document + relative size of the difference. */
function causaOf(rec: Reconciliacion): DictKey {
  const doc = docOf(rec);
  const base = Math.abs(rec.valor_siigo ?? 0) || 1;
  const ratio = Math.abs(rec.diferencia) / base;
  if (doc && (!doc.sincronizado_hgi && doc.estado === 'error')) return 'conta.causeMissingHgi';
  if (ratio < 0.05) return 'conta.causeRounding';
  if (doc && !doc.sincronizado_hgi) return 'conta.causeMissingHgi';
  return 'conta.causeThirdParty';
}

interface FiscalReconProps {
  onViewDetail: (doc: Documento) => void;
}

/**
 * Daily fiscal reconciliation — Bases / IVA / Retenciones (contabilidad.md §[E]).
 * SIIGO totals from today's causaciones/compras/facturas; HGI side folds in the
 * open `reconciliacion` differences per bucket. "Ejecutar cruce" replays the
 * scanning shimmer and re-staggers the differences table.
 */
export default function FiscalRecon({ onViewDetail }: FiscalReconProps) {
  const { t, formatCOP, formatDate } = useLanguage();
  const [scanning, setScanning] = useState(false);
  const [revealKey, setRevealKey] = useState(0);

  const model = useMemo(() => {
    const fiscalDocs = documentos.filter(
      (d) => (d.tipo === 'compra' || d.tipo === 'factura' || d.tipo === 'causacion') && d.fecha === DATA_TODAY,
    );
    const siigo: Record<Bucket, number> = {
      base: fiscalDocs.reduce((acc, d) => acc + d.base, 0),
      iva: fiscalDocs.reduce((acc, d) => acc + d.iva, 0),
      retencion: fiscalDocs.reduce((acc, d) => acc + d.retencion, 0),
    };
    const diffs = reconciliacion.filter(
      (r) => r.modulo === 'Contabilidad' && !r.resuelto && r.diferencia !== 0 && r.fecha === DATA_TODAY,
    );
    const perBucket: Record<Bucket, number> = { base: 0, iva: 0, retencion: 0 };
    diffs.forEach((r) => {
      perBucket[bucketOf(r)] += Math.abs(r.diferencia);
    });
    return { siigo, perBucket, diffs };
  }, []);

  const runCross = () => {
    if (scanning) return;
    setScanning(true);
    window.setTimeout(() => {
      setScanning(false);
      setRevealKey((k) => k + 1);
    }, 1200);
  };

  const panels: { bucket: Bucket; labelKey: DictKey }[] = [
    { bucket: 'base', labelKey: 'conta.bases' },
    { bucket: 'iva', labelKey: 'conta.iva' },
    { bucket: 'retencion', labelKey: 'conta.retenciones' },
  ];

  return (
    <motion.section
      className="rounded-xl border border-hairline bg-elevated p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25, ease: EASE_OUT_EXPO }}
    >
      {/* Card header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-[17px] font-semibold leading-6 text-txt-primary">{t('conta.fiscalRecon')}</h2>
        <div className="flex items-center gap-2">
          <span className="flex h-9 items-center gap-2 rounded-lg border border-hairline bg-inset px-3 text-[13px] text-txt-secondary">
            <Calendar className="size-4 text-txt-muted" strokeWidth={1.75} />
            {t('time.today')}, {formatDate(dayOnly(DATA_TODAY), 'day')}
          </span>
          <button
            type="button"
            onClick={runCross}
            disabled={scanning}
            className="flex h-9 items-center gap-2 rounded-lg border border-border-strong px-4 text-sm font-medium text-txt-secondary transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary disabled:opacity-70"
          >
            {scanning ? (
              <>
                <Loader2 className="size-4 animate-spin" strokeWidth={1.75} />
                {t('conta.scanning')}
              </>
            ) : (
              <>
                <RefreshCw className="size-4" strokeWidth={1.75} />
                {t('conta.runCross')}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary mini-panels */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        {panels.map(({ bucket, labelKey }) => {
          const siigo = model.siigo[bucket];
          const diff = model.perBucket[bucket];
          const hgi = siigo - diff;
          const ok = diff === 0;
          return (
            <div key={bucket} className="relative overflow-hidden rounded-lg border border-hairline bg-surface p-4">
              {scanning && <span className="skeleton-shimmer absolute inset-0" aria-hidden />}
              <p className="text-overline text-txt-muted">{t(labelKey)}</p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-xs text-txt-muted">
                  <span className="size-1.5 rounded-full" style={{ backgroundColor: 'var(--siigo)' }} />
                  {t('sys.siigo')}
                </span>
                <span className="tabular font-mono-data text-[13px] text-txt-primary">{formatCOP(siigo)}</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-xs text-txt-muted">
                  <span className="size-1.5 rounded-full" style={{ backgroundColor: 'var(--hgi)' }} />
                  {t('sys.hgi')}
                </span>
                <span className="tabular font-mono-data text-[13px] text-txt-primary">{formatCOP(hgi)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-hairline pt-2.5">
                <span className="text-[11px] text-txt-muted">Δ</span>
                {ok ? (
                  <motion.span
                    key={`ok-${revealKey}`}
                    className="flex items-center gap-1 text-xs font-semibold text-brand"
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.22, ease: [0.3, 1.4, 0.5, 1] }}
                  >
                    <Check className="size-3.5" strokeWidth={2.5} />
                    Δ $0
                  </motion.span>
                ) : (
                  <motion.span
                    key={`diff-${revealKey}`}
                    className="tabular font-mono-data text-xs font-semibold text-danger"
                    initial={{ color: '#98A2B6' }}
                    animate={{ color: '#F04452' }}
                    transition={{ duration: 0.22 }}
                  >
                    Δ {formatCOP(diff)}
                  </motion.span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Differences table */}
      {model.diffs.length > 0 ? (
        <div className="mt-4 overflow-hidden rounded-lg border border-hairline">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="h-9 border-b border-hairline bg-surface">
                <th scope="col" className="text-overline px-4 font-semibold text-txt-muted">{t('common.date')}</th>
                <th scope="col" className="text-overline px-4 font-semibold text-txt-muted">{t('conta.typeCol')}</th>
                <th scope="col" className="text-overline px-4 font-semibold text-txt-muted">{t('common.document')}</th>
                <th scope="col" className="text-overline px-4 text-right font-semibold text-txt-muted">{t('conta.siigoValue')}</th>
                <th scope="col" className="text-overline px-4 text-right font-semibold text-txt-muted">{t('conta.hgiValue')}</th>
                <th scope="col" className="text-overline px-4 text-right font-semibold text-txt-muted">Δ</th>
                <th scope="col" className="text-overline px-4 font-semibold text-txt-muted">{t('conta.causeCol')}</th>
                <th scope="col" className="text-overline px-4 text-right font-semibold text-txt-muted">{t('teso.tableActions')}</th>
              </tr>
            </thead>
            <tbody key={revealKey}>
              {model.diffs.map((rec, i) => {
                const doc = docOf(rec);
                return (
                  <motion.tr
                    key={rec.id}
                    className="h-11 border-b border-hairline transition-colors duration-120 last:border-b-0 hover:bg-[var(--bg-hover)]"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.5), ease: EASE_OUT_EXPO }}
                  >
                    <td className="whitespace-nowrap px-4 text-[13px] text-txt-secondary">{formatDate(dayOnly(rec.fecha), 'day')}</td>
                    <td className="px-4">
                      <span className="rounded-md bg-warning-dim px-1.5 py-0.5 text-[11px] font-semibold" style={{ color: 'var(--warning)' }}>
                        {t(BUCKET_LABEL[bucketOf(rec)])}
                      </span>
                    </td>
                    <td className="px-4 font-mono-data text-[13px] font-medium text-txt-primary">{doc?.numero ?? rec.concepto}</td>
                    <td className="tabular whitespace-nowrap px-4 text-right font-mono-data text-[13px] text-txt-primary">
                      {formatCOP(rec.valor_siigo ?? 0)}
                    </td>
                    <td className="tabular whitespace-nowrap px-4 text-right font-mono-data text-[13px] text-txt-secondary">
                      {formatCOP(rec.valor_hgi ?? 0)}
                    </td>
                    <td className="tabular whitespace-nowrap px-4 text-right font-mono-data text-[13px] font-semibold text-danger">
                      {formatCOP(Math.abs(rec.diferencia))}
                    </td>
                    <td className="px-4">
                      <span className="rounded-md border border-warn/30 px-1.5 py-0.5 text-[11px] font-medium text-txt-secondary">
                        {t(causaOf(rec))}
                      </span>
                    </td>
                    <td className="px-4 text-right">
                      <button
                        type="button"
                        onClick={() => doc && onViewDetail(doc)}
                        className={cn(
                          'text-[13px] font-medium transition-colors hover:text-txt-primary',
                          !doc && 'cursor-default opacity-40',
                        )}
                        style={{ color: 'var(--sync)' }}
                        disabled={!doc}
                      >
                        {t('action.viewDetail')}
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-hairline">
          <EmptyState title={t('conta.fiscalEmpty')} />
        </div>
      )}

      <p className="mt-4 border-t border-hairline pt-3 text-xs text-txt-muted">{t('conta.fiscalFooter')}</p>
    </motion.section>
  );
}
