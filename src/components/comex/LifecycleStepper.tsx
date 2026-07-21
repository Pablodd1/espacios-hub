import { Check } from 'lucide-react';
import { useLanguage } from '@/i18n';
import type { ContenedorEstado } from '@/lib/types';
import { cn } from '@/lib/utils';
import { LIFECYCLE_ORDER, STAGE_LABEL_KEYS } from './lifecycle';

interface LifecycleStepperProps {
  estado: ContenedorEstado;
  /** Show stage labels under dots (drawer) or dots-only mini (table). */
  withLabels?: boolean;
  className?: string;
}

/**
 * 4-stage lifecycle mini stepper (design.md §9.3):
 * completed dots brand + Check, current dot pulsing sync, upcoming muted.
 */
export default function LifecycleStepper({ estado, withLabels = false, className }: LifecycleStepperProps) {
  const { t } = useLanguage();
  const currentIdx = LIFECYCLE_ORDER.indexOf(estado);

  return (
    <div className={cn('flex items-center', className)} aria-label={t(STAGE_LABEL_KEYS[estado])}>
      {LIFECYCLE_ORDER.map((stage, i) => {
        const done = i < currentIdx;
        const current = i === currentIdx;
        const isDone = done || (current && stage === 'entregado');
        return (
          <div key={stage} className={cn('flex items-center', withLabels && i > 0 && 'flex-1')}>
            {i > 0 && (
              <span
                className={cn('h-px', withLabels ? 'min-w-3 flex-1' : 'w-2.5')}
                style={{ backgroundColor: i <= currentIdx ? 'var(--brand)' : 'var(--border-strong)' }}
              />
            )}
            <span className={cn('flex flex-col items-center', withLabels && 'gap-1')}>
              {current && stage !== 'entregado' ? (
                <span className="relative inline-flex size-2">
                  <span
                    className="absolute inline-flex size-2 rounded-full motion-safe:animate-[live-pulse_2s_ease-out_infinite]"
                    style={{ backgroundColor: 'var(--sync)', boxShadow: '0 0 12px 2px rgba(56,189,248,.55)' }}
                  />
                  <span className="relative inline-flex size-2 rounded-full" style={{ backgroundColor: 'var(--sync)' }} />
                </span>
              ) : isDone ? (
                <span className="flex size-2 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--brand)' }}>
                  {withLabels && <Check className="size-1.5 text-canvas" strokeWidth={3.5} />}
                </span>
              ) : (
                <span className="size-2 rounded-full" style={{ backgroundColor: 'var(--border-strong)' }} />
              )}
              {withLabels && (
                <span
                  className="whitespace-nowrap text-[11px] font-medium"
                  style={{
                    color: isDone ? 'var(--brand)' : current ? 'var(--sync)' : 'var(--text-muted)',
                  }}
                >
                  {t(STAGE_LABEL_KEYS[stage])}
                </span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
