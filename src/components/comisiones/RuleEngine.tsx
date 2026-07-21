import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useLanguage } from '@/i18n';
import type { DictKey } from '@/i18n';
import type { ComisionRegla } from '@/lib/types';
import { cn } from '@/lib/utils';
import { RULE_ORDER, ruleStat } from './aggregate';
import { ConfirmPopover, MiniSwitch } from './ui-bits';

const RULE_DESC_KEY: Record<ComisionRegla, DictKey> = {
  contenedor_especial: 'comi.desc.contenedor_especial',
  facturacion_anticipada: 'comi.desc.facturacion_anticipada',
  demora_flete: 'comi.desc.demora_flete',
  estandar: 'comi.desc.estandar',
};

const RULE_NAME_KEY: Record<ComisionRegla, DictKey> = {
  contenedor_especial: 'rule.contenedor_especial',
  facturacion_anticipada: 'rule.facturacion_anticipada',
  demora_flete: 'rule.demora_flete',
  estandar: 'rule.estandar',
};

interface RuleEngineProps {
  activeRules: Record<ComisionRegla, boolean>;
  onToggle: (regla: ComisionRegla, next: boolean) => void;
  /** True while the recalc scan sweep runs. */
  scanning: boolean;
  /** Increments per recalc — restarts sweep + badge pops. */
  recalcKey: number;
}

/** [B] Rules engine cards — 4 pipeline steps joined by chevrons, scan shimmer on recalc. */
export default function RuleEngine({ activeRules, onToggle, scanning, recalcKey }: RuleEngineProps) {
  const { t } = useLanguage();
  const [confirmOff, setConfirmOff] = useState<{ regla: ComisionRegla; anchor: DOMRect } | null>(null);
  const anchorRef = useRef<Partial<Record<ComisionRegla, DOMRect>>>({});

  return (
    <motion.section
      aria-label={t('comi.rules')}
      className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      {RULE_ORDER.map((regla, i) => {
        const stat = ruleStat(regla, activeRules);
        const active = activeRules[regla];
        return (
          <div key={regla} className="relative flex items-stretch">
            <motion.article
              className={cn(
                'relative flex-1 overflow-hidden rounded-xl border border-hairline bg-elevated p-5 transition-colors duration-180',
                !active && 'opacity-70',
              )}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: active ? 1 : 0.7, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Scanning shimmer — sweeps cards in order 01→04 during recalc */}
              {scanning && (
                <motion.div
                  key={`scan-${recalcKey}`}
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-10"
                  style={{
                    background:
                      'linear-gradient(100deg, transparent 30%, rgba(139,92,246,0.14) 46%, rgba(255,255,255,0.07) 50%, rgba(139,92,246,0.14) 54%, transparent 70%)',
                  }}
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 1.2, delay: i * 0.28, ease: 'linear' }}
                />
              )}

              <div className="flex items-start justify-between gap-3">
                <span
                  className="inline-flex h-6 items-center rounded-md px-1.5 font-mono-data text-[11px] font-semibold"
                  style={{ backgroundColor: 'rgba(139,92,246,0.12)', color: 'var(--violet)' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className="inline-flex"
                  onClickCapture={(e) => {
                    // Capture anchor rect for the confirm popover before the switch fires.
                    anchorRef.current[regla] = e.currentTarget.getBoundingClientRect();
                  }}
                >
                  <MiniSwitch
                    checked={active}
                    ariaLabel={t(RULE_NAME_KEY[regla])}
                    onChange={(next) => {
                      if (!next) {
                        // Toggling off needs confirmation — affects current totals.
                        setConfirmOff({ regla, anchor: anchorRef.current[regla] ?? new DOMRect() });
                      } else {
                        onToggle(regla, true);
                      }
                    }}
                  />
                </span>
              </div>

              <h3 className="mt-3 font-display text-base font-semibold leading-6 text-txt-primary">
                {t(RULE_NAME_KEY[regla])}
              </h3>
              <p className="mt-1.5 min-h-[38px] text-[13px] leading-[19px] text-txt-secondary">{t(RULE_DESC_KEY[regla])}</p>

              <div className="mt-3 border-t border-hairline pt-3">
                <motion.span
                  key={`stat-${recalcKey}-${stat.count}`}
                  className="inline-flex items-center rounded-md bg-inset px-2 py-1 font-mono-data text-[11px] font-medium text-txt-secondary"
                  initial={{ scale: 0.92 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: scanning ? 0.4 + i * 0.28 : 0, ease: [0.3, 1.4, 0.5, 1] }}
                >
                  {stat.held
                    ? `${stat.count} ${t('comi.statHeld')}`
                    : `${t('comi.statApplies')} ${stat.count} ${t('comi.statOrders')}`}
                </motion.span>
              </div>
            </motion.article>

            {/* Pipeline connector */}
            {i < RULE_ORDER.length - 1 && (
              <ChevronRight
                className="absolute -right-[13px] top-1/2 z-10 hidden size-4 -translate-y-1/2 text-txt-muted xl:block"
                strokeWidth={2}
                aria-hidden
              />
            )}
          </div>
        );
      })}

      <ConfirmPopover
        open={confirmOff !== null}
        anchor={confirmOff?.anchor ?? null}
        text={t('comi.confirmOff')}
        confirmLabel={t('action.confirm')}
        cancelLabel={t('action.cancel')}
        tone="danger"
        onConfirm={() => {
          if (confirmOff) onToggle(confirmOff.regla, false);
          setConfirmOff(null);
        }}
        onCancel={() => setConfirmOff(null)}
      />
    </motion.section>
  );
}
