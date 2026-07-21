import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { useLanguage } from '@/i18n';
import { cn } from '@/lib/utils';
import type { PipelineRow } from './logistica-vm';

interface ChipSpec {
  key: string;
  node: React.ReactNode;
}

const chipBase = 'inline-flex h-[22px] items-center gap-1 rounded-md px-2 text-[11px] font-semibold whitespace-nowrap';

function ChainChip({ spec, index, title }: { spec: ChipSpec; index: number; title?: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: 0.05 + index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      className="inline-flex items-center"
      title={title}
    >
      {index > 0 && <ChevronRight className="mx-1 size-3.5 text-txt-muted" strokeWidth={1.75} aria-hidden />}
      {spec.node}
    </motion.span>
  );
}

/** §E — Despacho → Pedido → Factura → Flete → Zona chain table; chips assemble left-to-right. */
export default function ChainTable({ rows }: { rows: PipelineRow[] }) {
  const { t, formatCOP, formatDate, formatPercent } = useLanguage();

  return (
    <div className="overflow-hidden rounded-xl border border-hairline bg-elevated">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-elevated">
            <tr className="h-9 border-b border-hairline">
              <th className="text-overline px-4 font-semibold text-txt-muted" scope="col">
                {t('logi.colChain')}
              </th>
              <th className="text-overline px-4 font-semibold text-txt-muted" scope="col">
                {t('logi.colCliente')}
              </th>
              <th className="text-overline px-4 text-right font-semibold text-txt-muted" scope="col">
                {t('common.amount')}
              </th>
              <th className="text-overline px-4 font-semibold text-txt-muted" scope="col">
                {t('logi.colFechaDespacho')}
              </th>
              <th className="text-overline px-4 font-semibold text-txt-muted" scope="col">
                {t('common.status')}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const chips: ChipSpec[] = [
                {
                  key: 'desp',
                  node: row.despachado ? (
                    <span className={cn(chipBase, 'font-mono-data')} style={{ backgroundColor: 'var(--sync-dim)', color: 'var(--sync)' }}>
                      {row.despachoNum}
                    </span>
                  ) : (
                    <span
                      className={cn(chipBase, 'font-mono-data border border-dashed')}
                      style={{ borderColor: 'var(--border-strong)', color: 'var(--text-muted)' }}
                    >
                      {row.despachoNum}
                    </span>
                  ),
                },
                {
                  key: 'ped',
                  node: (
                    <span className={cn(chipBase, 'font-mono-data')} style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                      {row.pedido}
                    </span>
                  ),
                },
                {
                  key: 'fv',
                  node: row.factura ? (
                    <span className={cn(chipBase, 'font-mono-data')} style={{ backgroundColor: 'var(--brand-dim)', color: 'var(--brand)' }}>
                      {row.factura}
                    </span>
                  ) : (
                    <span
                      className={cn(chipBase, 'border border-dashed')}
                      style={{ borderColor: 'rgba(240,68,82,0.5)', color: 'var(--danger)', backgroundColor: 'var(--danger-dim)' }}
                    >
                      {t('logi.unassigned')}
                    </span>
                  ),
                },
                {
                  key: 'flete',
                  node:
                    row.fletePct !== null ? (
                      <span
                        className={cn(chipBase, 'font-mono-data')}
                        style={{ backgroundColor: 'rgba(139,92,246,0.12)', color: 'var(--violet)' }}
                      >
                        {t('logi.fleteLabel').replace('{pct}', formatPercent(row.fletePct))}
                      </span>
                    ) : (
                      <span
                        className={cn(chipBase, 'border border-dashed')}
                        style={{ borderColor: 'rgba(240,68,82,0.5)', color: 'var(--danger)', backgroundColor: 'var(--danger-dim)' }}
                      >
                        {t('logi.unassigned')}
                      </span>
                    ),
                },
                {
                  key: 'zona',
                  node: (
                    <span
                      className={cn(chipBase, 'border')}
                      style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
                    >
                      {row.zona ? t('logi.zonaLabel').replace('{zona}', row.zona) : '—'}
                    </span>
                  ),
                },
              ];

              return (
                <motion.tr
                  key={row.id}
                  className="h-11 border-b border-hairline transition-colors duration-120 ease-standard last:border-b-0 hover:bg-[var(--bg-hover)]"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.5), ease: [0.16, 1, 0.3, 1] }}
                >
                  <td className="px-4">
                    <div className="flex items-center">
                      {chips.map((chip, ci) => (
                        <ChainChip key={chip.key} spec={chip} index={ci} title={`${row.despachoNum} · ${row.cliente}`} />
                      ))}
                    </div>
                  </td>
                  <td className="max-w-[220px] truncate px-4 text-[13px] text-txt-secondary">{row.cliente}</td>
                  <td className="tabular px-4 text-right font-mono-data text-[13px] text-txt-primary">
                    {row.valor !== null ? formatCOP(row.valor) : '—'}
                  </td>
                  <td className="px-4 text-[13px] text-txt-secondary">{row.fecha ? formatDate(row.fecha, 'day') : '—'}</td>
                  <td className="px-4">
                    {row.despachado ? (
                      <StatusBadge status="sincronizado" label={t('status.dispatched')} />
                    ) : (
                      <StatusBadge status="pendiente" label={t('logi.inWarehouse')} />
                    )}
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
