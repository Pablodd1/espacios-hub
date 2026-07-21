import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SyncPairProps {
  /** Flow direction. Default SIIGO → HGI. */
  direction?: 'SIIGO->HGI' | 'HGI->SIIGO';
  className?: string;
}

const DOT: Record<'SIIGO' | 'HGI', string> = {
  SIIGO: 'var(--siigo)',
  HGI: 'var(--hgi)',
};

/** `SIIGO → HGI` direction chip used in sync job rows. */
export default function SyncPair({ direction = 'SIIGO->HGI', className }: SyncPairProps) {
  const [from, to] = direction.split('->') as ['SIIGO' | 'HGI', 'SIIGO' | 'HGI'];
  return (
    <span
      className={cn(
        'inline-flex h-[22px] items-center gap-1.5 rounded-md px-2 font-mono-data text-[11px] font-medium',
        className,
      )}
      style={{ backgroundColor: 'var(--sync-dim)' }}
    >
      <span className="inline-flex items-center gap-1">
        <span className="size-1.5 rounded-full" style={{ backgroundColor: DOT[from] }} />
        <span className="text-txt-secondary">{from}</span>
      </span>
      <ArrowRight className="size-3" style={{ color: 'var(--sync)' }} strokeWidth={2} />
      <span className="inline-flex items-center gap-1">
        <span className="size-1.5 rounded-full" style={{ backgroundColor: DOT[to] }} />
        <span className="text-txt-secondary">{to}</span>
      </span>
    </span>
  );
}
