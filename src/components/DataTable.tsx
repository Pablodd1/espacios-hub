import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/i18n';
import { cn } from '@/lib/utils';
import EmptyState from './EmptyState';
import type { ReactNode } from 'react';

export interface ColumnDef<T> {
  /** Column id (also used as header fallback). */
  key: string;
  /** Header node; plain strings render uppercase 11px muted. */
  header: ReactNode;
  /** Cell renderer. */
  cell: (row: T, index: number) => ReactNode;
  /** Right-align (numeric columns get tabular-nums). */
  numeric?: boolean;
  /** JetBrains Mono cell (doc numbers, container ids, BLs). */
  mono?: boolean;
  /** Tailwind width class, e.g. 'w-32'. */
  width?: string;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  /** Rows per page (default 10). 0 disables pagination. */
  pageSize?: number;
  /** Optional toolbar rendered above the table (search, filters, export…). */
  toolbar?: ReactNode;
  /** Empty-state content overrides. */
  emptyTitle?: string;
  emptyCaption?: string;
  className?: string;
}

/**
 * Generic typed data table — design.md §9.4:
 * 36px uppercase header, 44px rows, hairline separators, hover wash,
 * 25ms row stagger (re-runs when `data` changes), pagination footer.
 */
export default function DataTable<T>({
  columns,
  data,
  rowKey,
  onRowClick,
  pageSize = 10,
  toolbar,
  emptyTitle,
  emptyCaption,
  className,
}: DataTableProps<T>) {
  const { t, formatNumber } = useLanguage();
  const [page, setPage] = useState(0);

  // Reset to first page whenever the dataset changes (adjust-state-during-render pattern)
  const [prevData, setPrevData] = useState(data);
  if (prevData !== data) {
    setPrevData(data);
    setPage(0);
  }

  const paged = useMemo(() => {
    if (pageSize <= 0) return data;
    return data.slice(page * pageSize, (page + 1) * pageSize);
  }, [data, page, pageSize]);

  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(data.length / pageSize)) : 1;
  const from = data.length === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(data.length, (page + 1) * pageSize);

  return (
    <div className={cn('overflow-hidden rounded-xl border border-hairline bg-elevated', className)}>
      {toolbar && <div className="border-b border-hairline p-3">{toolbar}</div>}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-elevated">
            <tr className="h-9 border-b border-hairline">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'text-overline px-4 font-semibold text-txt-muted',
                    col.numeric && 'text-right',
                    col.width,
                  )}
                  scope="col"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row, i) => (
              <motion.tr
                key={rowKey(row)}
                className={cn(
                  'h-11 border-b border-hairline transition-colors duration-120 ease-standard last:border-b-0 hover:bg-[var(--bg-hover)]',
                  onRowClick && 'cursor-pointer',
                )}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.025, 0.5), ease: [0.16, 1, 0.3, 1] }}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 text-[13px] text-txt-secondary',
                      col.numeric && 'tabular text-right',
                      col.mono && 'font-mono-data text-[13px] text-txt-primary',
                    )}
                  >
                    {col.cell(row, i)}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length === 0 && <EmptyState title={emptyTitle} caption={emptyCaption} />}

      {pageSize > 0 && data.length > 0 && (
        <div className="flex h-11 items-center justify-between border-t border-hairline px-4">
          <p className="text-xs text-txt-muted">
            {t('common.showing')} {formatNumber(from)}–{formatNumber(to)} {t('common.of')} {formatNumber(data.length)}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label={t('common.previous')}
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="flex size-7 items-center justify-center rounded-md text-txt-muted transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary disabled:cursor-default disabled:opacity-40"
            >
              <ChevronLeft className="size-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              aria-label={t('common.next')}
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="flex size-7 items-center justify-center rounded-md text-txt-muted transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary disabled:cursor-default disabled:opacity-40"
            >
              <ChevronRight className="size-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
