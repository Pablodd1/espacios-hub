import { useEffect, useMemo, useRef, useState } from 'react';
import { animate, motion } from 'framer-motion';
import { RotateCcw, Save } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useLanguage } from '@/i18n';
import { cn } from '@/lib/utils';
import { getDebtLines } from './debt-model';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as [number, number, number, number];

/** Currency cell that tweens between values (~90ms) and flashes brand on change. */
function TweenedMoney({ value, format, flash, className }: { value: number; format: (n: number) => string; flash: boolean; className?: string }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const from = prev.current;
    prev.current = value;
    if (from === value) return;
    const controls = animate(from, value, { duration: 0.09, ease: 'easeOut', onUpdate: (v) => setDisplay(v) });
    return () => controls.stop();
  }, [value]);
  return (
    <span className={cn('tabular font-mono-data transition-colors duration-200', flash && 'text-brand', className)}>
      {format(display)}
    </span>
  );
}

interface SobrecostoPanelProps {
  pct: number;
  onPctChange: (pct: number) => void;
  savedPct: number;
  onSave: () => void;
}

/**
 * Sobrecosto & deuda real panel (contabilidad.md §[B]) — the signature
 * interactive card: slider/number parameter live-recomputing estimated real
 * debt per proveedor/línea, save + reset actions.
 */
export default function SobrecostoPanel({ pct, onPctChange, savedPct, onSave }: SobrecostoPanelProps) {
  const { t, formatCOPCompact, formatPercent, formatDate } = useLanguage();
  const lines = useMemo(() => getDebtLines(), []);

  const [flash, setFlash] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);
  const lastPulsePct = useRef(pct);
  const flashTimer = useRef(0);

  useEffect(() => () => window.clearTimeout(flashTimer.current), []);

  /** Event-driven pct change: flashes the recomputed cells + pulses totals on >2pt jumps. */
  const changePct = (next: number) => {
    if (next === pct) return;
    setFlash(true);
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlash(false), 320);
    if (Math.abs(next - lastPulsePct.current) > 2) {
      lastPulsePct.current = next;
      setPulseKey((k) => k + 1);
    }
    onPctChange(next);
  };

  const dirty = pct !== savedPct;
  const totalDeuda = lines.reduce((acc, l) => acc + l.deuda, 0);
  const totalSobre = (totalDeuda * pct) / 100;

  const handleInput = (raw: string) => {
    const parsed = Number.parseFloat(raw.replace(',', '.'));
    if (Number.isNaN(parsed)) return;
    changePct(Math.min(25, Math.max(0, Math.round(parsed * 2) / 2)));
  };

  return (
    <motion.section
      className="rounded-xl border border-hairline bg-elevated p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: EASE_OUT_EXPO }}
    >
      <h2 className="font-display text-[17px] font-semibold leading-6 text-txt-primary">{t('conta.panelTitle')}</h2>
      <p className="mt-1 max-w-[720px] text-xs text-txt-muted">{t('conta.panelCaption')}</p>

      <div className="mt-5 grid grid-cols-12 gap-6">
        {/* Left control block */}
        <div className="col-span-12 flex flex-col justify-between border-b border-hairline pb-5 lg:col-span-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
          <div>
            <p className="text-overline text-txt-muted">{t('conta.surcharge')}</p>
            <p className="tabular mt-2 font-mono-data text-[34px] font-semibold leading-10 tracking-[-0.02em] text-txt-primary">
              {formatPercent(pct)}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <Slider
                value={[pct]}
                onValueChange={([v]) => changePct(v)}
                min={0}
                max={25}
                step={0.5}
                aria-label={t('conta.surcharge')}
                className={cn(
                  'flex-1',
                  "[&_[data-slot='slider-track']]:h-2 [&_[data-slot='slider-track']]:bg-inset",
                  "[&_[data-slot='slider-range']]:bg-brand",
                  "[&_[data-slot='slider-thumb']]:size-[18px] [&_[data-slot='slider-thumb']]:border-brand [&_[data-slot='slider-thumb']]:bg-brand",
                  "[&_[data-slot='slider-thumb']]:shadow-[0_0_12px_2px_rgba(22,199,132,0.45)]",
                )}
              />
              <input
                type="number"
                min={0}
                max={25}
                step={0.5}
                value={pct}
                onChange={(e) => handleInput(e.target.value)}
                aria-label={t('conta.surcharge')}
                className="tabular h-9 w-[76px] rounded-lg border border-border-strong bg-inset px-2 text-center font-mono-data text-[13px] text-txt-primary outline-none focus:border-brand/60"
              />
            </div>
            <p className="mt-3 text-[11px] text-txt-muted">
              {t('conta.lastAdjust')}: {formatDate('2026-07-15T12:00:00', 'day')} · {t('conta.adjustBy')} Adriana Restrepo
            </p>
          </div>

          <div className="mt-5 flex items-center gap-2">
            <button
              type="button"
              onClick={onSave}
              disabled={!dirty}
              className="flex h-9 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-canvas transition-all duration-100 ease-standard hover:bg-brand-hover active:scale-[0.97] disabled:cursor-default disabled:opacity-40"
            >
              <Save className="size-4" strokeWidth={1.75} />
              {t('conta.saveParam')}
            </button>
            <button
              type="button"
              onClick={() => changePct(savedPct)}
              disabled={!dirty}
              className="flex h-9 items-center gap-2 rounded-lg border border-border-strong px-4 text-sm font-medium text-txt-secondary transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary disabled:cursor-default disabled:opacity-40"
            >
              <RotateCcw className="size-3.5" strokeWidth={1.75} />
              {t('conta.reset')}
            </button>
          </div>
        </div>

        {/* Right result block — live comparison table */}
        <div className="col-span-12 lg:col-span-8">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="h-9 border-b border-hairline">
                <th scope="col" className="text-overline pr-4 font-semibold text-txt-muted">
                  {t('conta.supplierLine')}
                </th>
                <th scope="col" className="text-overline px-4 text-right font-semibold text-txt-muted">
                  {t('conta.bookedDebt')}
                </th>
                <th scope="col" className="text-overline px-4 text-right font-semibold text-txt-muted">
                  {t('conta.surchargeCol')} ({formatPercent(pct)})
                </th>
                <th scope="col" className="text-overline pl-4 text-right font-semibold text-txt-muted">
                  {t('conta.realDebt')}
                </th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => {
                const sobre = (line.deuda * pct) / 100;
                return (
                  <tr key={line.docNumero} className="h-12 border-b border-hairline">
                    <td className="pr-4">
                      <span className="block text-[13px] text-txt-primary">{line.proveedor}</span>
                      {line.contenedor && (
                        <span className="mt-0.5 block font-mono-data text-[11px] text-txt-muted">{line.contenedor}</span>
                      )}
                    </td>
                    <td className="px-4 text-right text-[13px] text-txt-secondary">
                      <TweenedMoney value={line.deuda} format={formatCOPCompact} flash={false} />
                    </td>
                    <td className="px-4 text-right text-[13px] text-txt-secondary">
                      +<TweenedMoney value={sobre} format={formatCOPCompact} flash={flash} />
                    </td>
                    <td className="pl-4 text-right text-[13px] font-medium text-txt-primary">
                      <TweenedMoney value={line.deuda + sobre} format={formatCOPCompact} flash={flash} />
                    </td>
                  </tr>
                );
              })}
              <motion.tr
                key={pulseKey}
                className="h-12"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
                style={{ transformOrigin: 'center' }}
              >
                <td className="pr-4 text-[13px] font-semibold text-txt-primary">{t('common.total')}</td>
                <td className="px-4 text-right text-[13px] font-semibold text-txt-primary">
                  <TweenedMoney value={totalDeuda} format={formatCOPCompact} flash={false} />
                </td>
                <td className="px-4 text-right text-[13px] font-semibold text-txt-primary">
                  +<TweenedMoney value={totalSobre} format={formatCOPCompact} flash={flash} />
                </td>
                <td className="pl-4 text-right text-[15px] font-semibold text-brand">
                  <TweenedMoney value={totalDeuda + totalSobre} format={formatCOPCompact} flash={flash} />
                </td>
              </motion.tr>
            </tbody>
          </table>
        </div>
      </div>
    </motion.section>
  );
}
