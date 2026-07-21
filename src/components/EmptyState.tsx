import { useLanguage } from '@/i18n';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title?: string;
  caption?: string;
  /** Optional CTA (ghost button etc.). */
  action?: ReactNode;
  className?: string;
}

/** Centered empty state with the shared line illustration. */
export default function EmptyState({ title, caption, action, className }: EmptyStateProps) {
  const { t } = useLanguage();
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-12 text-center', className)}>
      <img src="/empty-state.svg" alt="" className="h-[120px] w-[160px] opacity-90" loading="lazy" />
      <p className="text-[15px] font-medium text-txt-primary">{title ?? t('common.emptyTitle')}</p>
      <p className="max-w-[340px] text-[13px] text-txt-muted">{caption ?? t('common.emptyCaption')}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
