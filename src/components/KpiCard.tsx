import { motion } from 'framer-motion';
import { useCountUp } from '@/hooks/use-count-up';
import { cn } from '@/lib/utils';

export type DeltaTone = 'positive' | 'negative' | 'neutral';

const DELTA_STYLES: Record<DeltaTone, { bg: string; color: string }> = {
  positive: { bg: 'var(--brand-dim)', color: 'var(--brand)' },
  negative: { bg: 'var(--danger-dim)', color: 'var(--danger)' },
  neutral: { bg: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' },
};

interface SparklineProps {
  /** 6–14 numeric points. */
  data: number[];
  color: string;
  className?: string;
}

/** Mini sparkline 56×40 with 1.5px stroke + 10% area fill, stroke draw-in. */
function Sparkline({ data, color, className }: SparklineProps) {
  const w = 56;
  const h = 40;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (w - 4) + 2;
    const y = h - 3 - ((v - min) / range) * (h - 8);
    return [x, y] as const;
  });
  const line = pts.map(([x, y]) => `${x},${y}`).join(' ');
  const area = `2,${h - 2} ${line} ${w - 2},${h - 2}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className={className} aria-hidden>
      <polygon points={area} fill={color} opacity={0.1} />
      <motion.polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
      />
    </svg>
  );
}

interface KpiCardProps {
  /** Overline label (uppercase 11px). */
  label: string;
  /** Numeric value (counted up). If string, rendered as-is. */
  value: number | string;
  /** Formatter applied per animation frame (e.g. formatCOPCompact). */
  format?: (v: number) => string;
  delta?: { text: string; tone: DeltaTone };
  /** Sparkline points (last 14 days). */
  spark?: { data: number[]; color: string };
  onClick?: () => void;
  className?: string;
}

/** KPI card per design.md §9.2 — count-up, delta chip, sparkline, hover lift. */
export default function KpiCard({ label, value, format, delta, spark, onClick, className }: KpiCardProps) {
  const numeric = typeof value === 'number' ? value : 0;
  const animated = useCountUp(numeric);
  const display = typeof value === 'number' ? (format ? format(animated) : String(Math.round(animated))) : value;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex w-full items-start justify-between gap-3 rounded-xl border border-hairline bg-elevated p-5 text-left',
        'transition-[border-color,transform] duration-180 ease-standard hover:-translate-y-0.5 hover:border-border-strong',
        onClick ? 'cursor-pointer' : 'cursor-default',
        className,
      )}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      <div className="min-w-0">
        <p className="text-overline text-txt-muted">{label}</p>
        <p className="tabular mt-2 font-display text-[28px] font-semibold leading-[34px] tracking-[-0.02em] text-txt-primary">
          {display}
        </p>
        {delta && (
          <span
            className="mt-2.5 inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-semibold"
            style={{ backgroundColor: DELTA_STYLES[delta.tone].bg, color: DELTA_STYLES[delta.tone].color }}
          >
            {delta.text}
          </span>
        )}
      </div>
      {spark && (
        <Sparkline
          data={spark.data}
          color={spark.color}
          className="mt-1 shrink-0 transition-opacity duration-180 group-hover:opacity-100"
        />
      )}
    </motion.button>
  );
}
