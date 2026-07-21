import { cn } from '@/lib/utils';

export type SystemId = 'siigo' | 'hgi';

const META: Record<SystemId, { label: string; dot: string; bg: string; text: string }> = {
  siigo: { label: 'SIIGO', dot: 'var(--siigo)', bg: 'var(--siigo-dim)', text: '#FFB25E' },
  hgi: { label: 'HGI', dot: 'var(--hgi)', bg: 'var(--hgi-dim)', text: '#8FB4FF' },
};

interface SystemChipProps {
  system: SystemId;
  className?: string;
}

/** 22px pill — 6px dot + label. SIIGO orange / HGI blue identity chip. */
export default function SystemChip({ system, className }: SystemChipProps) {
  const meta = META[system];
  return (
    <span
      className={cn('inline-flex h-[22px] items-center gap-1.5 rounded-md px-2', className)}
      style={{ backgroundColor: meta.bg }}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: meta.dot }} />
      <span className="text-xs font-semibold tracking-wide" style={{ color: meta.text }}>
        {meta.label}
      </span>
    </span>
  );
}
