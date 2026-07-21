import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, Paperclip } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { useLanguage } from '@/i18n';
import type { CumplidoRow, NovedadKind } from './logistica-vm';

const NOVEDAD_STYLE: Record<NovedadKind, { bg: string; color: string }> = {
  none: { bg: 'var(--brand-dim)', color: 'var(--brand)' },
  faltante: { bg: 'var(--danger-dim)', color: 'var(--danger)' },
  averia: { bg: 'var(--warning-dim)', color: 'var(--warning)' },
  precio: { bg: 'rgba(139,92,246,0.12)', color: 'var(--violet)' },
};

/** Left inset border for rows with a novedad (danger for faltante, warning otherwise). */
const INSET_COLOR: Record<NovedadKind, string | null> = {
  none: null,
  faltante: 'var(--danger)',
  averia: 'var(--warning)',
  precio: 'var(--warning)',
};

/** §D — Cumplidos de contenedores: checklist progress, novedad chips, attachment popover. */
export default function CumplidosTable({ rows }: { rows: CumplidoRow[] }) {
  const { t, formatDate, formatNumber } = useLanguage();
  const navigate = useNavigate();
  const [attachFor, setAttachFor] = useState<string | null>(null);

  const novedadLabel = (row: CumplidoRow): string => {
    switch (row.novedad) {
      case 'faltante':
        return t('logi.novShort').replace('{n}', formatNumber(row.faltanteUnds));
      case 'averia':
        return t('logi.novDamage');
      case 'precio':
        return t('logi.novPrice');
      default:
        return t('logi.novNone');
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-hairline bg-elevated">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-elevated">
            <tr className="h-9 border-b border-hairline">
              <th className="text-overline px-4 font-semibold text-txt-muted" scope="col">{t('logi.colCumplido')}</th>
              <th className="text-overline px-4 font-semibold text-txt-muted" scope="col">{t('common.container')}</th>
              <th className="text-overline px-4 font-semibold text-txt-muted" scope="col">{t('logi.colFechaRecibo')}</th>
              <th className="text-overline px-4 font-semibold text-txt-muted" scope="col">{t('logi.colChecklist')}</th>
              <th className="text-overline px-4 font-semibold text-txt-muted" scope="col">{t('logi.novelty')}</th>
              <th className="text-overline px-4 font-semibold text-txt-muted" scope="col">{t('logi.colEstadoContable')}</th>
              <th className="text-overline px-4 font-semibold text-txt-muted" scope="col">{t('comex.colActions')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const inset = INSET_COLOR[row.novedad];
              const chipStyle = NOVEDAD_STYLE[row.novedad];
              const pct = (row.checklistDone / row.checklistTotal) * 100;
              return (
                <motion.tr
                  key={row.id}
                  className="h-11 border-b border-hairline transition-colors duration-120 ease-standard last:border-b-0 hover:bg-[var(--bg-hover)]"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.025, 0.5), ease: [0.16, 1, 0.3, 1] }}
                >
                  <td
                    className="px-4 font-mono-data text-[13px] font-semibold text-txt-primary"
                    style={inset ? { boxShadow: `inset 2px 0 0 ${inset}` } : undefined}
                  >
                    {row.numero}
                  </td>
                  <td className="px-4">
                    <button
                      type="button"
                      onClick={() => navigate(`/comercio-exterior?cont=${encodeURIComponent(row.containerNum)}`)}
                      className="font-mono-data text-[13px] text-txt-secondary underline decoration-border-strong underline-offset-4 transition-colors hover:text-txt-primary"
                    >
                      {row.containerNum}
                    </button>
                  </td>
                  <td className="px-4 text-[13px] text-txt-secondary">{formatDate(row.fecha, 'day')}</td>
                  <td className="px-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-inset">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: row.checklistDone === row.checklistTotal ? 'var(--brand)' : 'var(--warning)' }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.5, delay: 0.15 + i * 0.025, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </div>
                      <span className="tabular font-mono-data text-[11px] text-txt-muted">
                        {row.checklistDone}/{row.checklistTotal}
                      </span>
                    </div>
                  </td>
                  <td className="px-4">
                    <motion.span
                      className="inline-flex h-[22px] items-center rounded-md px-2 text-xs font-semibold"
                      style={{ backgroundColor: chipStyle.bg, color: chipStyle.color }}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.22, delay: 0.2 + i * 0.025, ease: [0.3, 1.4, 0.5, 1] }}
                    >
                      {novedadLabel(row)}
                    </motion.span>
                  </td>
                  <td className="px-4">
                    {row.posted ? (
                      <StatusBadge status="sincronizado" label={t('logi.postedBoth')} />
                    ) : (
                      <StatusBadge status="pendiente" />
                    )}
                  </td>
                  <td className="px-4">
                    <div className="flex items-center gap-1">
                      <div className="relative">
                        <button
                          type="button"
                          aria-label={`${t('logi.attachments')} ${row.numero}`}
                          aria-expanded={attachFor === row.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setAttachFor((v) => (v === row.id ? null : row.id));
                          }}
                          className="flex size-7 items-center justify-center rounded-md text-txt-muted transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary"
                        >
                          <Paperclip className="size-4" strokeWidth={1.75} />
                        </button>
                        <AnimatePresence>
                          {attachFor === row.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setAttachFor(null)} aria-hidden />
                              <motion.div
                                className="absolute right-0 z-50 mt-1 w-56 rounded-lg border border-border-strong bg-overlay p-3 shadow-xl"
                                initial={{ opacity: 0, scale: 0.97, y: -4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.97, y: -4 }}
                                transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                              >
                                <p className="text-overline mb-2 text-txt-muted">{t('logi.attachments')}</p>
                                <ul className="flex flex-col gap-1.5">
                                  {row.attachments.map((file) => (
                                    <li key={file} className="flex items-center gap-2 font-mono-data text-[11px] text-txt-secondary">
                                      <Paperclip className="size-3 shrink-0 text-txt-muted" strokeWidth={1.75} />
                                      <span className="truncate">{file}</span>
                                    </li>
                                  ))}
                                </ul>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                      <button
                        type="button"
                        aria-label={`${t('logi.viewContainer')} ${row.containerNum}`}
                        onClick={() => navigate(`/comercio-exterior?cont=${encodeURIComponent(row.containerNum)}`)}
                        className="flex size-7 items-center justify-center rounded-md text-txt-muted transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary"
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
    </div>
  );
}
