import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import Toast from '@/components/tesoreria/Toast';
import { useLanguage } from '@/i18n';
import { anticiposProveedor, getContenedor, getTercero } from '@/lib/data';
import { cn } from '@/lib/utils';
import { PARTIAL_APPLIED_PCT, PROVIDER_CONTAINER, PROVIDER_INVOICE } from './debt-model';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as [number, number, number, number];

/** Advance id (`ant-002`) → mono display label (`ANT-002`). */
function advanceLabel(id: string): string {
  return `ANT-${id.split('-')[1] ?? id}`.toUpperCase();
}

/**
 * Anticipos a proveedores del exterior (contabilidad.md §[D]) — each advance
 * linked to its línea/contenedor with an applied-progress bar; auto-apply is
 * demoed live (ANT-002 flips to fully applied with a toast).
 */
export default function AnticiposTable() {
  const { t, formatCOP, formatDate, formatNumber } = useLanguage();
  const navigate = useNavigate();
  const [autoAppliedId, setAutoAppliedId] = useState<string | null>(null);
  const [toastText, setToastText] = useState<string | null>(null);

  const rows = useMemo(
    () => [...anticiposProveedor].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [],
  );

  // Demo auto-apply: ANT-002's invoice "arrives" 6s after mount.
  useEffect(() => {
    const target = rows.find((r) => !r.aplicado && (PARTIAL_APPLIED_PCT[r.id] ?? 0) > 0);
    if (!target) return;
    const timer = window.setTimeout(() => {
      setAutoAppliedId(target.id);
      const invoice = PROVIDER_INVOICE[target.proveedor_id ?? ''] ?? '';
      setToastText(`${advanceLabel(target.id)} ${t('conta.autoApplied')} ${invoice}`);
      window.setTimeout(() => setToastText(null), 4500);
    }, 6000);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  const appliedPct = (id: string, aplicado: boolean): number => {
    if (aplicado || autoAppliedId === id) return 100;
    return PARTIAL_APPLIED_PCT[id] ?? 0;
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2, ease: EASE_OUT_EXPO }}
    >
      <div className="mb-3">
        <h2 className="font-display text-[17px] font-semibold leading-6 text-txt-primary">{t('conta.advances')}</h2>
        <p className="mt-0.5 text-xs text-txt-muted">{t('conta.advancesCaption')}</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-hairline bg-elevated">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="h-9 border-b border-hairline">
                <th scope="col" className="text-overline px-4 font-semibold text-txt-muted">{t('conta.advanceCol')}</th>
                <th scope="col" className="text-overline px-4 font-semibold text-txt-muted">{t('conta.supplierCol')}</th>
                <th scope="col" className="text-overline px-4 font-semibold text-txt-muted">{t('conta.lineContainerCol')}</th>
                <th scope="col" className="text-overline px-4 font-semibold text-txt-muted">{t('conta.wiredAtCol')}</th>
                <th scope="col" className="text-overline px-4 text-right font-semibold text-txt-muted">{t('conta.wiredCol')}</th>
                <th scope="col" className="text-overline px-4 font-semibold text-txt-muted">{t('conta.appliedCol')}</th>
                <th scope="col" className="text-overline px-4 font-semibold text-txt-muted">{t('common.status')}</th>
                <th scope="col" className="text-overline w-16 px-4 text-right font-semibold text-txt-muted">{t('teso.tableActions')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const proveedor = getTercero(row.proveedor_id);
                const contenedor = getContenedor(PROVIDER_CONTAINER[row.proveedor_id ?? '']);
                const pct = appliedPct(row.id, row.aplicado);
                const valor = row.valor ?? 0;
                const estadoKey = pct === 100 ? 'full' : pct > 0 ? 'partial' : 'vigente';
                return (
                  <motion.tr
                    key={row.id}
                    className="group h-12 border-b border-hairline transition-colors duration-120 ease-standard last:border-b-0 hover:bg-[var(--bg-hover)]"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(i * 0.025, 0.5), ease: EASE_OUT_EXPO }}
                  >
                    <td className="px-4 font-mono-data text-[13px] font-medium text-txt-primary">{advanceLabel(row.id)}</td>
                    <td className="max-w-[220px] truncate px-4 text-[13px] text-txt-secondary">{proveedor?.nombre ?? '—'}</td>
                    <td className="px-4">
                      <span className="flex items-center gap-2">
                        <span className="text-[13px] text-txt-secondary">{row.linea ?? '—'}</span>
                        {contenedor && (
                          <button
                            type="button"
                            onClick={() => navigate('/comercio-exterior')}
                            title={t('common.container')}
                            className="rounded-md border border-hairline bg-inset px-1.5 py-0.5 font-mono-data text-[11px] text-txt-muted transition-colors hover:border-sync hover:text-sync"
                          >
                            {contenedor.numero_contenedor}
                          </button>
                        )}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 text-[13px] text-txt-secondary">{formatDate(row.created_at, 'day')}</td>
                    <td className="tabular whitespace-nowrap px-4 text-right font-mono-data text-[13px] text-txt-primary">
                      {formatCOP(valor)}
                    </td>
                    <td className="px-4">
                      <span className="flex items-center gap-2.5">
                        <span className="tabular whitespace-nowrap font-mono-data text-[13px] text-txt-secondary">
                          {formatCOP((valor * pct) / 100)}
                        </span>
                        <span className="h-1.5 w-20 overflow-hidden rounded-full bg-inset">
                          <motion.span
                            className="block h-full rounded-full"
                            style={{ backgroundColor: pct === 100 ? 'var(--brand)' : pct > 0 ? 'var(--warning)' : 'transparent' }}
                            initial={{ width: '0%' }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
                          />
                        </span>
                        <span className="tabular w-9 text-right font-mono-data text-[11px] text-txt-muted">
                          {formatNumber(pct)} %
                        </span>
                      </span>
                    </td>
                    <td className="px-4">
                      {estadoKey === 'full' ? (
                        <StatusBadge status="completado" hideIcon label={t('conta.stateFull')} />
                      ) : estadoKey === 'partial' ? (
                        <StatusBadge status="pendiente" hideIcon label={t('conta.statePartial')} />
                      ) : (
                        <StatusBadge status="en_proceso" hideIcon label={t('conta.stateVigente')} />
                      )}
                    </td>
                    <td className="px-4">
                      <span className="flex items-center justify-end opacity-0 transition-opacity duration-120 group-hover:opacity-100">
                        <button
                          type="button"
                          aria-label={t('action.viewDetail')}
                          title={t('action.viewDetail')}
                          onClick={() => navigate('/comercio-exterior')}
                          className={cn(
                            'flex size-7 items-center justify-center rounded-md text-txt-muted transition-colors',
                            'hover:bg-[var(--bg-hover)] hover:text-txt-primary',
                          )}
                        >
                          <Eye className="size-3.5" strokeWidth={1.75} />
                        </button>
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Toast visible={toastText !== null} variant="sync" title={toastText ?? ''} />
    </motion.section>
  );
}
