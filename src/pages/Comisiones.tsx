import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Download, Loader2 } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { ruleLabels, useLanguage } from '@/i18n';
import type { DictKey } from '@/i18n';
import type { ComisionRegla } from '@/lib/types';
import { cn } from '@/lib/utils';
import ExceptionQueue from '@/components/comisiones/ExceptionQueue';
import Leaderboard from '@/components/comisiones/Leaderboard';
import MonthlyChart from '@/components/comisiones/MonthlyChart';
import RuleEngine from '@/components/comisiones/RuleEngine';
import VendorDrawer from '@/components/comisiones/VendorDrawer';
import { aggregateVendors, buildExceptions } from '@/components/comisiones/aggregate';
import type { ExceptionItem, PeriodMonth, VendorRow } from '@/components/comisiones/aggregate';
import { ToastStack } from '@/components/comisiones/ui-bits';
import { useToasts } from '@/components/comisiones/use-toasts';

const PERIODS: { month: PeriodMonth; shortKey: DictKey; fullKey: DictKey }[] = [
  { month: 6, shortKey: 'comi.period.jun', fullKey: 'comi.month.junio' },
  { month: 7, shortKey: 'comi.period.jul', fullKey: 'comi.month.julio' },
  { month: 8, shortKey: 'comi.period.ago', fullKey: 'comi.month.agosto' },
];

const SCAN_DURATION_MS = 1.2 * 1000 + 3 * 280 + 400; // sweep + per-card delay + settle

export default function Comisiones() {
  const { t } = useLanguage();
  const { toasts, push } = useToasts();

  const [period, setPeriod] = useState<PeriodMonth>(7);
  const [activeRules, setActiveRules] = useState<Record<ComisionRegla, boolean>>({
    contenedor_especial: true,
    facturacion_anticipada: true,
    demora_flete: true,
    estandar: true,
  });
  const [scanning, setScanning] = useState(false);
  const [recalcKey, setRecalcKey] = useState(0);
  const [resolved, setResolved] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<VendorRow | null>(null);
  const scanTimer = useRef<number>(0);

  const vendors = useMemo(() => aggregateVendors(period, activeRules), [period, activeRules]);
  // Chart is period-independent: trend always anchored to the real July table.
  const vendorsForChart = useMemo(() => aggregateVendors(7, activeRules), [activeRules]);
  const exceptions = useMemo(() => buildExceptions().filter((e) => !resolved.has(e.id)), [resolved]);
  const monthLabel = t(PERIODS.find((p) => p.month === period)?.fullKey ?? 'comi.month.julio');

  const runRecalc = () => {
    if (scanning) return;
    setScanning(true);
    window.clearTimeout(scanTimer.current);
    scanTimer.current = window.setTimeout(() => {
      setScanning(false);
      setRecalcKey((k) => k + 1);
      push(`${t('comi.toastRecalc')} · ${vendors.length} ${t('comi.vendors')} · ${exceptions.length} ${t('comi.exceptionsN')}`);
    }, SCAN_DURATION_MS);
  };

  const toggleRule = (regla: ComisionRegla, next: boolean) => {
    setActiveRules((prev) => ({ ...prev, [regla]: next }));
  };

  const resolveException = (item: ExceptionItem, action: 'apply' | 'exclude') => {
    setResolved((prev) => new Set(prev).add(item.id));
    push(
      action === 'apply'
        ? `${item.pedido} ${t('comi.resolvedWith')} ${t(ruleLabels[item.sugerida])}`
        : `${item.pedido} ${t('comi.excludedToast')}`,
      action === 'apply' ? 'brand' : 'warning',
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ============ [A] Header ============ */}
      <PageHeader
        title={t('nav.comisiones')}
        caption={t('comi.caption')}
        actions={
          <>
            <div className="flex h-9 items-center rounded-lg bg-inset p-1">
              {PERIODS.map((p) => (
                <button
                  key={p.month}
                  type="button"
                  aria-pressed={period === p.month}
                  onClick={() => setPeriod(p.month)}
                  className={cn(
                    'h-7 rounded-md px-3 text-xs font-semibold transition-all duration-180 ease-standard',
                    period === p.month
                      ? 'border border-border-strong bg-overlay text-txt-primary'
                      : 'border border-transparent text-txt-muted hover:text-txt-secondary',
                  )}
                >
                  {t(p.shortKey)}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => push(t('comi.exportToast'))}
              className="flex h-9 items-center gap-2 rounded-lg border border-border-strong px-3.5 text-[13px] font-medium text-txt-secondary transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary"
            >
              <Download className="size-4" strokeWidth={1.75} />
              {t('comi.exportPayroll')}
            </button>
            <motion.button
              type="button"
              onClick={runRecalc}
              disabled={scanning}
              className="flex h-9 items-center gap-2 rounded-lg bg-brand px-4 text-[13px] font-semibold text-canvas transition-colors duration-100 ease-standard hover:bg-brand-hover disabled:opacity-80"
              style={{ boxShadow: '0 0 0 1px rgba(22,199,132,.35), 0 4px 24px -4px rgba(22,199,132,.35)' }}
              whileTap={{ scale: 0.97 }}
            >
              {scanning ? (
                <Loader2 className="size-4 animate-spin" strokeWidth={2} />
              ) : (
                <Calculator className="size-4" strokeWidth={1.75} />
              )}
              {scanning ? t('comi.recalculating') : t('comi.recalc')}
            </motion.button>
          </>
        }
      />

      {/* ============ [B] Rules engine cards ============ */}
      <div>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="font-display text-[17px] font-semibold leading-6 text-txt-primary">{t('comi.rules')}</h2>
          <p className="hidden text-xs text-txt-muted md:block">{t('comi.rulesCaption')}</p>
        </div>
        <RuleEngine activeRules={activeRules} onToggle={toggleRule} scanning={scanning} recalcKey={recalcKey} />
      </div>

      {/* ============ [C] Leaderboard + monthly chart ============ */}
      <div className="grid grid-cols-12 gap-5">
        <Leaderboard rows={vendors} monthLabel={monthLabel} recalcKey={recalcKey} onSelect={setSelected} />
        <MonthlyChart vendors={vendorsForChart} />
      </div>

      {/* ============ [D] Exception queue ============ */}
      <ExceptionQueue items={exceptions} onResolve={resolveException} />

      <VendorDrawer row={selected} onClose={() => setSelected(null)} />
      <ToastStack toasts={toasts} />
    </div>
  );
}
