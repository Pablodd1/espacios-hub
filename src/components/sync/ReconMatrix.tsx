import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { moduleLabels, useLanguage } from '@/i18n';
import { reconciliacion } from '@/lib/data';
import type { ModuleKey } from '@/lib/types';

const MODULE_ORDER: ModuleKey[] = ['Tesoreria', 'Cartera', 'Comercio Exterior', 'Comisiones', 'Contabilidad', 'Logistica'];

const MODULE_ROUTE: Record<ModuleKey, string> = {
  Tesoreria: '/tesoreria',
  Cartera: '/cartera',
  'Comercio Exterior': '/comercio-exterior',
  Comisiones: '/comisiones',
  Contabilidad: '/contabilidad',
  Logistica: '/logistica',
};

interface MatrixRow {
  modulo: ModuleKey;
  siigo: number;
  hgi: number;
  delta: number;
  /** Comisiones is an internal calculation — no doc counts per design. */
  internal?: boolean;
}

/** Cross-module reconciliation matrix from the reconciliacion table. */
export default function ReconMatrix() {
  const { t, formatNumber } = useLanguage();
  const navigate = useNavigate();

  const { rows, totals } = useMemo(() => {
    const rows: MatrixRow[] = MODULE_ORDER.map((modulo) => {
      if (modulo === 'Comisiones') return { modulo, siigo: 0, hgi: 0, delta: 0, internal: true };
      const recs = reconciliacion.filter((r) => r.modulo === modulo);
      const matched = recs.filter((r) => r.diferencia === 0);
      const delta = recs.filter((r) => r.diferencia !== 0 && !r.resuelto).length;
      return { modulo, siigo: recs.length, hgi: matched.length, delta };
    });
    const countable = rows.filter((r) => !r.internal);
    const totals = {
      siigo: countable.reduce((a, r) => a + r.siigo, 0),
      hgi: countable.reduce((a, r) => a + r.hgi, 0),
      delta: countable.reduce((a, r) => a + r.delta, 0),
    };
    return { rows, totals };
  }, []);

  return (
    <motion.section
      className="col-span-12 flex flex-col rounded-xl border border-hairline bg-elevated p-5 xl:col-span-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <div className="mb-3">
        <h2 className="font-display text-[17px] font-semibold leading-6 text-txt-primary">{t('sync.matrix')}</h2>
        <p className="mt-0.5 text-xs text-txt-muted">{t('sync.matrixCaption')}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="h-9 border-y border-hairline">
              <th className="text-overline pr-3 font-semibold text-txt-muted">{t('common.module')}</th>
              <th className="text-overline px-3 text-right font-semibold text-txt-muted">{t('sync.docsSiigo')}</th>
              <th className="text-overline px-3 text-right font-semibold text-txt-muted">{t('sync.docsHgi')}</th>
              <th className="text-overline px-3 text-right font-semibold text-txt-muted">Δ</th>
              <th className="text-overline pl-3 font-semibold text-txt-muted">{t('common.status')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <motion.tr
                key={row.modulo}
                className="h-11 border-b border-hairline last:border-b-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
              >
                <td className="pr-3 text-[13px] font-medium text-txt-primary">
                  {t(moduleLabels[row.modulo])}
                </td>
                {row.internal ? (
                  <td colSpan={3} className="px-3 text-center">
                    <span className="inline-flex h-[22px] items-center rounded-md bg-inset px-2 text-[11px] font-medium text-txt-muted">
                      {t('sync.internal')}
                    </span>
                  </td>
                ) : (
                  <>
                    <td className="tabular px-3 text-right font-mono-data text-[13px] text-txt-primary">
                      {formatNumber(row.siigo)}
                    </td>
                    <td className="tabular px-3 text-right font-mono-data text-[13px] text-txt-primary">
                      {formatNumber(row.hgi)}
                    </td>
                    <td className="tabular px-3 text-right font-mono-data text-[13px]">
                      {row.delta > 0 ? (
                        <motion.span
                          className="inline-block rounded px-1 font-semibold"
                          style={{ color: 'var(--danger)' }}
                          animate={{
                            backgroundColor: ['rgba(240,68,82,0.12)', 'rgba(240,68,82,0)'],
                          }}
                          transition={{ duration: 0.4, delay: 0.3 + i * 0.06 }}
                        >
                          +{formatNumber(row.delta)}
                        </motion.span>
                      ) : (
                        <span className="text-txt-muted">0</span>
                      )}
                    </td>
                  </>
                )}
                <td className="pl-3">
                  {row.internal ? null : row.delta === 0 ? (
                    <CheckCircle2 className="size-4" style={{ color: 'var(--brand)' }} strokeWidth={1.75} aria-label={t('status.synced')} />
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigate(MODULE_ROUTE[row.modulo])}
                      className="text-xs font-semibold transition-colors hover:text-txt-primary"
                      style={{ color: 'var(--danger)' }}
                    >
                      {t('sync.review')} →
                    </button>
                  )}
                </td>
              </motion.tr>
            ))}
            {/* Footer totals */}
            <tr className="h-11 border-t border-border-strong">
              <td className="pr-3 text-[13px] font-semibold text-txt-primary">{t('common.total')}</td>
              <td className="tabular px-3 text-right font-mono-data text-[13px] font-semibold text-txt-primary">
                {formatNumber(totals.siigo)}
              </td>
              <td className="tabular px-3 text-right font-mono-data text-[13px] font-semibold text-txt-primary">
                {formatNumber(totals.hgi)}
              </td>
              <td className="tabular px-3 text-right font-mono-data text-[13px] font-semibold" style={{ color: totals.delta > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                {totals.delta > 0 ? `+${formatNumber(totals.delta)}` : '0'}
              </td>
              <td className="pl-3" />
            </tr>
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}
