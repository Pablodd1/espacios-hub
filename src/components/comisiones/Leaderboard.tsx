import { motion } from 'framer-motion';
import { Eye, Trophy } from 'lucide-react';
import { ruleLabels, useLanguage } from '@/i18n';
import EmptyState from '@/components/EmptyState';
import { cn } from '@/lib/utils';
import type { VendorRow } from './aggregate';
import { VENDOR_PALETTE } from './aggregate';
import { AnimatedMoney } from './ui-bits';

interface LeaderboardProps {
  rows: VendorRow[];
  monthLabel: string;
  recalcKey: number;
  onSelect: (row: VendorRow) => void;
}

/** [C1] Totales por vendedor — rank, animated money cells, rule tooltips, detail drawer trigger. */
export default function Leaderboard({ rows, monthLabel, recalcKey, onSelect }: LeaderboardProps) {
  const { t, formatCOPCompact } = useLanguage();

  const signed = (v: number) => `${v >= 0 ? '+' : '−'}${formatCOPCompact(Math.abs(v))}`;

  return (
    <motion.section
      className="col-span-12 overflow-hidden rounded-xl border border-hairline bg-elevated xl:col-span-7"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 p-5 pb-3">
        <div>
          <h2 className="font-display text-[17px] font-semibold leading-6 text-txt-primary">
            {t('comi.leaderboard')} — <span className="capitalize">{monthLabel}</span> 2026
          </h2>
          <p className="mt-0.5 text-xs text-txt-muted">{t('comi.leaderboardCaption')}</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState title={t('comi.emptyPeriod')} caption={t('comi.emptyPeriodCaption')} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="h-9 border-y border-hairline">
                <th className="text-overline w-10 px-4 font-semibold text-txt-muted">{t('comi.col.rank')}</th>
                <th className="text-overline px-4 font-semibold text-txt-muted">{t('comi.col.vendor')}</th>
                <th className="text-overline px-4 text-right font-semibold text-txt-muted">{t('comi.col.sales')}</th>
                <th className="text-overline px-4 text-right font-semibold text-txt-muted">{t('comi.col.base')}</th>
                <th className="text-overline px-4 text-right font-semibold text-txt-muted">{t('comi.col.adjust')}</th>
                <th className="text-overline px-4 text-right font-semibold text-txt-muted">{t('comi.col.held')}</th>
                <th className="text-overline px-4 text-right font-semibold text-txt-muted">{t('comi.col.total')}</th>
                <th className="text-overline w-14 px-4 text-center font-semibold text-txt-muted">{t('comi.col.detail')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const color = VENDOR_PALETTE[i % VENDOR_PALETTE.length];
                return (
                  <motion.tr
                    key={row.vendedor}
                    className={cn(
                      'h-11 cursor-pointer border-b border-hairline transition-colors duration-120 ease-standard last:border-b-0 hover:bg-[var(--bg-hover)]',
                      i === 0 && 'shadow-[inset_2px_0_0_var(--violet)]',
                    )}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => onSelect(row)}
                  >
                    <td className="px-4 text-[13px] text-txt-muted">
                      <span className="flex items-center gap-1.5">
                        {i + 1}
                        {i === 0 && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.35, ease: [0.3, 1.4, 0.5, 1] }}
                          >
                            <Trophy className="size-3.5" style={{ color: 'var(--violet)' }} strokeWidth={2} aria-hidden />
                          </motion.span>
                        )}
                      </span>
                    </td>
                    <td className="px-4">
                      <span className="flex items-center gap-2.5">
                        <span
                          className="flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                          style={{ backgroundColor: `${color}1F`, color }}
                        >
                          {row.initials}
                        </span>
                        <span className="truncate text-[13px] font-medium text-txt-primary">{row.vendedor}</span>
                      </span>
                    </td>
                    <td className="px-4 text-right font-mono-data text-[13px] text-txt-primary">
                      <AnimatedMoney value={row.ventas} format={formatCOPCompact} tick={recalcKey} />
                    </td>
                    <td className="px-4 text-right font-mono-data text-[13px] text-txt-secondary">
                      <AnimatedMoney value={row.comisionBase} format={formatCOPCompact} tick={recalcKey} />
                    </td>
                    <td
                      className="px-4 text-right font-mono-data text-[13px]"
                      title={`${t('comi.rulesApplied')}: ${row.reglas.map((r) => t(ruleLabels[r])).join(', ')}`}
                    >
                      <AnimatedMoney
                        value={row.ajustes}
                        format={signed}
                        tick={recalcKey}
                        style={{ color: row.ajustes > 0 ? 'var(--brand)' : row.ajustes < 0 ? 'var(--danger)' : 'var(--text-muted)' }}
                      />
                    </td>
                    <td className="px-4 text-right font-mono-data text-[13px]" style={{ color: 'var(--warning)' }}>
                      {row.retenido > 0 ? (
                        <AnimatedMoney value={row.retenido} format={(v) => `−${formatCOPCompact(Math.abs(v))}`} tick={recalcKey} />
                      ) : (
                        <span className="text-txt-muted">$0</span>
                      )}
                    </td>
                    <td className="px-4 text-right font-mono-data text-[13px] font-semibold" style={{ color: 'var(--brand)' }}>
                      <AnimatedMoney value={row.total} format={formatCOPCompact} tick={recalcKey} />
                    </td>
                    <td className="px-4 text-center">
                      <button
                        type="button"
                        aria-label={`${t('comi.col.detail')} — ${row.vendedor}`}
                        className="inline-flex size-7 items-center justify-center rounded-md text-txt-muted transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(row);
                        }}
                      >
                        <Eye className="size-4" strokeWidth={1.75} />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </motion.section>
  );
}
