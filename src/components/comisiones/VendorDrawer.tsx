import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { statusComisionLabels, useLanguage } from '@/i18n';
import { cn } from '@/lib/utils';
import type { EffectiveComision, VendorRow } from './aggregate';
import { RuleBadge } from './ui-bits';

interface VendorDrawerProps {
  row: VendorRow | null;
  onClose: () => void;
}

function groupByPedido(rows: EffectiveComision[]): [string, EffectiveComision[]][] {
  const map = new Map<string, EffectiveComision[]>();
  for (const r of rows) {
    const key = r.pedido ?? '—';
    const list = map.get(key) ?? [];
    list.push(r);
    map.set(key, list);
  }
  return [...map.entries()];
}

/** Rule-traceability drawer — every pedido behind a vendor total with its rule badges. */
export default function VendorDrawer({ row, onClose }: VendorDrawerProps) {
  const { t, formatCOP, formatPercent, formatDate } = useLanguage();

  return (
    <AnimatePresence>
      {row && (
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
            aria-label={t('comi.drawerTitle')}
            className="fixed inset-y-0 right-0 z-50 flex w-[520px] max-w-[94vw] flex-col border-l border-border-strong bg-overlay shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Sticky header */}
            <div className="flex items-start justify-between gap-3 border-b border-hairline p-5">
              <div>
                <p className="text-overline text-txt-muted">{t('comi.drawerTitle')}</p>
                <h2 className="mt-1 font-display text-[22px] font-semibold leading-7 tracking-[-0.015em] text-txt-primary">
                  {row.vendedor}
                </h2>
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

            {/* Key-value summary */}
            <div className="grid grid-cols-2 gap-px border-b border-hairline bg-hairline">
              {[
                { label: t('comi.col.sales'), value: formatCOP(row.ventas), color: 'var(--text-primary)' },
                { label: t('comi.drawerCommission'), value: formatCOP(row.comisionTotal), color: 'var(--text-primary)' },
                { label: t('comi.held'), value: row.retenido > 0 ? `−${formatCOP(row.retenido)}` : formatCOP(0), color: 'var(--warning)' },
                { label: t('comi.col.total'), value: formatCOP(row.total), color: 'var(--brand)' },
              ].map((kv) => (
                <div key={kv.label} className="bg-overlay px-5 py-3.5">
                  <p className="text-overline text-txt-muted">{kv.label}</p>
                  <p className="tabular mt-1 font-mono-data text-[15px] font-medium leading-[22px]" style={{ color: kv.color }}>
                    {kv.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Rules applied */}
            <div className="border-b border-hairline p-5">
              <p className="text-overline text-txt-muted">{t('comi.rulesApplied')}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {row.reglas.map((r) => (
                  <RuleBadge key={r} regla={r} />
                ))}
              </div>
            </div>

            {/* Pedidos contributing */}
            <div className="flex-1 overflow-y-auto p-5">
              <p className="text-overline text-txt-muted">{t('comi.drawerOrders')}</p>
              <ul className="mt-3 flex flex-col gap-2.5">
                {groupByPedido(row.rows).map(([pedido, lines], gi) => {
                  const venta = lines.find((l) => l.estado !== 'anulada')?.valor_base ?? lines[0]?.valor_base ?? 0;
                  return (
                    <motion.li
                      key={pedido}
                      className="rounded-lg border border-hairline bg-elevated p-3.5"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 + gi * 0.04, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-mono-data text-[13px] font-medium text-txt-primary">{pedido}</span>
                        <span className="tabular font-mono-data text-xs text-txt-muted">{formatCOP(venta)}</span>
                      </div>
                      <ul className="mt-2.5 flex flex-col gap-2 border-t border-hairline pt-2.5">
                        {lines.map((line) => (
                          <li key={line.id} className="flex flex-wrap items-center gap-2">
                            <RuleBadge regla={line.regla} className={cn(line.estado === 'anulada' && 'opacity-50 line-through')} />
                            {line.reglaOriginal && line.reglaOriginal !== line.regla && (
                              <RuleBadge regla={line.reglaOriginal} className="opacity-50 line-through" />
                            )}
                            <span className="tabular font-mono-data text-[11px] text-txt-muted">
                              {typeof line.pct === 'number' ? formatPercent(line.pct) : '—'}
                            </span>
                            <span
                              className={cn(
                                'tabular ml-auto font-mono-data text-xs',
                                line.estado === 'anulada' ? 'text-txt-muted line-through' : 'text-txt-primary',
                              )}
                            >
                              {formatCOP(line.valor ?? 0)}
                            </span>
                            <StatusBadge
                              status={line.estado === 'pagada' ? 'completado' : line.estado === 'anulada' ? 'error' : 'pendiente'}
                              label={t(statusComisionLabels[line.estado])}
                              hideIcon
                            />
                          </li>
                        ))}
                        <li className="text-[11px] text-txt-muted">{formatDate(lines[0]?.created_at ?? '', 'short')}</li>
                      </ul>
                    </motion.li>
                  );
                })}
              </ul>
            </div>

            {/* Footer */}
            <div className="border-t border-hairline p-4 text-center text-xs text-txt-muted">
              {t('comi.drawerFooter')} · {formatCOP(row.total)}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
