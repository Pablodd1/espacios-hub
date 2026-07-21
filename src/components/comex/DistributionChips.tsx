import { motion } from 'framer-motion';
import { BarChart3, Check, Database, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type DistTarget = 'hgi' | 'pbi' | 'ia';

const TARGET_META: Record<DistTarget, { label: string; color: string; bg: string; icon: LucideIcon }> = {
  hgi: { label: 'HGI', color: 'var(--hgi)', bg: 'var(--hgi-dim)', icon: Database },
  pbi: { label: 'Power BI', color: 'var(--warning)', bg: 'var(--warning-dim)', icon: BarChart3 },
  ia: { label: 'IA', color: 'var(--violet)', bg: 'rgba(139,92,246,0.12)', icon: Sparkles },
};

interface DistributionChipsProps {
  /** Which targets have been distributed to. */
  distributed?: DistTarget[];
  /** Compact (table) or full (drawer) size. */
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Three mini chips — HGI (blue), Power BI (warning), IA (violet) —
 * each with a check when the container was distributed (design comex §E).
 */
export default function DistributionChips({ distributed = ['hgi', 'pbi', 'ia'], size = 'sm', className }: DistributionChipsProps) {
  const targets: DistTarget[] = ['hgi', 'pbi', 'ia'];
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {targets.map((target, i) => {
        const meta = TARGET_META[target];
        const done = distributed.includes(target);
        const Icon = meta.icon;
        return (
          <motion.span
            key={target}
            className={cn('inline-flex items-center gap-1 rounded-md font-semibold', size === 'sm' ? 'h-[20px] px-1.5 text-[11px]' : 'h-[22px] px-2 text-xs')}
            style={
              done
                ? { backgroundColor: meta.bg, color: meta.color }
                : { backgroundColor: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' }
            }
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.22, delay: 0.1 + i * 0.07, ease: [0.3, 1.4, 0.5, 1] }}
          >
            <Icon className="size-3" strokeWidth={2} aria-hidden />
            <span>{meta.label}</span>
            {done && <Check className="size-3" strokeWidth={2.5} aria-hidden />}
          </motion.span>
        );
      })}
    </div>
  );
}
