import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { ruleLabels, useLanguage } from '@/i18n';
import type { ComisionRegla } from '@/lib/types';
import { cn } from '@/lib/utils';
import type { ToastItem } from './use-toasts';

/* ==================== Mini switch (brand when on) ==================== */

interface SwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  ariaLabel: string;
  /** Sync color variant (Sync Center auto-refresh). */
  tone?: 'brand' | 'sync';
  disabled?: boolean;
}

export function MiniSwitch({ checked, onChange, ariaLabel, tone = 'brand', disabled = false }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={cn(
        'relative h-5 w-9 shrink-0 rounded-full border transition-colors duration-180 ease-standard',
        checked ? 'border-transparent' : 'border-border-strong bg-inset',
        disabled && 'cursor-not-allowed opacity-50',
      )}
      style={
        checked
          ? { backgroundColor: tone === 'brand' ? 'var(--brand)' : 'var(--sync)' }
          : undefined
      }
    >
      <span
        className={cn(
          'absolute top-1/2 size-3.5 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform duration-180 ease-standard',
          checked ? 'translate-x-[18px]' : 'translate-x-[3px]',
        )}
      />
    </button>
  );
}

/* ==================== Rule badge (per-rule color chip) ==================== */

const RULE_TONE: Record<ComisionRegla, { bg: string; color: string }> = {
  contenedor_especial: { bg: 'rgba(139,92,246,0.12)', color: 'var(--violet)' },
  facturacion_anticipada: { bg: 'var(--sync-dim)', color: 'var(--sync)' },
  demora_flete: { bg: 'var(--warning-dim)', color: 'var(--warning)' },
  estandar: { bg: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' },
};

export function RuleBadge({ regla, className }: { regla: ComisionRegla; className?: string }) {
  const { t } = useLanguage();
  const tone = RULE_TONE[regla];
  return (
    <span
      className={cn('inline-flex h-[22px] items-center rounded-md px-2 font-mono-data text-[11px] font-medium', className)}
      style={{ backgroundColor: tone.bg, color: tone.color }}
    >
      {t(ruleLabels[regla])}
    </span>
  );
}

/* ==================== Animated money (tweens on value / recalc) ==================== */

interface AnimatedMoneyProps {
  value: number;
  format: (v: number) => string;
  /** Re-run the tween when this changes (recalc). */
  tick?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function AnimatedMoney({ value, format, tick = 0, className, style }: AnimatedMoneyProps) {
  const [reduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [display, setDisplay] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (reduced) return;
    const start = performance.now();
    const duration = 900;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p); // easeOutExpo
      setDisplay(value * eased);
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [value, tick, reduced]);

  return (
    <span className={cn('tabular', className)} style={style}>
      {format(reduced ? value : display)}
    </span>
  );
}

/* ==================== Toast stack (bottom-right, 360px, easeSnap) ==================== */

const TOAST_TONE: Record<NonNullable<ToastItem['tone']>, string> = {
  brand: 'var(--brand)',
  sync: 'var(--sync)',
  warning: 'var(--warning)',
};

export function ToastStack({ toasts }: { toasts: ToastItem[] }) {
  // items rendered newest-last; auto-dismiss is owned by useToasts
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[70] flex w-[360px] flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 rounded-xl border border-border-strong bg-overlay p-4 shadow-2xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.22, ease: [0.3, 1.4, 0.5, 1] }}
          >
            <CheckCircle2
              className="mt-0.5 size-5 shrink-0"
              style={{ color: TOAST_TONE[toast.tone ?? 'brand'] }}
              strokeWidth={1.75}
            />
            <p className="text-sm font-medium text-txt-primary">{toast.text}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ==================== Inline confirm popover ==================== */

interface ConfirmPopoverProps {
  open: boolean;
  /** Anchor rect of the triggering button. */
  anchor: DOMRect | null;
  text: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  tone?: 'brand' | 'danger';
}

/** Small anchored confirm popover (scale 0.96→1, 140ms). */
export function ConfirmPopover({
  open,
  anchor,
  text,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  tone = 'brand',
}: ConfirmPopoverProps) {
  const top = anchor ? anchor.bottom + 8 : 0;
  const left = anchor ? Math.max(16, Math.min(anchor.right - 288, window.innerWidth - 304)) : 0;
  return (
    <AnimatePresence>
      {open && anchor && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={onCancel} aria-hidden />
          <motion.div
            role="alertdialog"
            className="fixed z-[61] w-72 rounded-lg border border-border-strong bg-overlay p-3.5 shadow-2xl"
            style={{ top, left }}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[13px] leading-5 text-txt-secondary">{text}</p>
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="h-7 rounded-md px-2.5 text-xs font-medium text-txt-secondary transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={cn(
                  'h-7 rounded-md px-2.5 text-xs font-semibold transition-all duration-100 ease-standard active:scale-[0.97]',
                  tone === 'danger' ? 'bg-danger text-white hover:brightness-110' : 'bg-brand text-canvas hover:bg-brand-hover',
                )}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
