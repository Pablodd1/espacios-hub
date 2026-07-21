import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import EmptyState from '@/components/EmptyState';
import { formatRelative, useLanguage } from '@/i18n';
import { REFERENCE_NOW } from '@/lib/data';
import type { ExceptionItem } from './aggregate';
import { ConfirmPopover, RuleBadge } from './ui-bits';

interface ExceptionQueueProps {
  items: ExceptionItem[];
  onResolve: (item: ExceptionItem, action: 'apply' | 'exclude') => void;
}

/** [D] Cola de excepciones — engine-undecidable cases with apply/exclude resolution. */
export default function ExceptionQueue({ items, onResolve }: ExceptionQueueProps) {
  const { t, lang, formatCOPCompact } = useLanguage();
  const [confirm, setConfirm] = useState<{ item: ExceptionItem; action: 'apply' | 'exclude'; anchor: DOMRect } | null>(null);

  const openConfirm = (item: ExceptionItem, action: 'apply' | 'exclude', el: HTMLButtonElement) => {
    setConfirm({ item, action, anchor: el.getBoundingClientRect() });
  };

  return (
    <motion.section
      className="overflow-hidden rounded-xl border border-hairline bg-elevated"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex flex-wrap items-center gap-3 p-5 pb-3">
        <h2 className="font-display text-[17px] font-semibold leading-6 text-txt-primary">{t('comi.exceptions')}</h2>
        <motion.span
          className="inline-flex h-[22px] items-center rounded-md px-2 text-xs font-semibold"
          style={{ backgroundColor: 'var(--warning-dim)', color: 'var(--warning)' }}
          animate={items.length > 0 ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={items.length > 0 ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } : undefined}
        >
          {items.length}
        </motion.span>
        <p className="w-full text-xs text-txt-muted">{t('comi.exceptionsCaption')}</p>
      </div>

      {items.length === 0 ? (
        <EmptyState title={t('comi.excEmpty')} caption={t('comi.excEmptyCaption')} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="h-9 border-y border-hairline">
                <th className="text-overline px-5 font-semibold text-txt-muted">{t('comi.excOrder')}</th>
                <th className="text-overline px-4 font-semibold text-txt-muted">{t('comi.excClient')}</th>
                <th className="text-overline px-4 text-right font-semibold text-txt-muted">{t('common.amount')}</th>
                <th className="text-overline px-4 font-semibold text-txt-muted">{t('comi.excMotive')}</th>
                <th className="text-overline px-4 font-semibold text-txt-muted">{t('comi.excSuggested')}</th>
                <th className="text-overline px-4 font-semibold text-txt-muted">{t('comi.excDetected')}</th>
                <th className="text-overline px-4 text-right font-semibold text-txt-muted">{t('comi.excActions')}</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {items.map((item, i) => (
                  <motion.tr
                    key={item.id}
                    className="h-11 border-b border-hairline last:border-b-0 hover:bg-[var(--bg-hover)]"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 24, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } }}
                    transition={{ duration: 0.3, delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <td className="px-5 font-mono-data text-[13px] font-medium text-txt-primary">{item.pedido}</td>
                    <td className="max-w-[220px] truncate px-4 text-[13px] text-txt-secondary">{item.cliente}</td>
                    <td className="tabular px-4 text-right font-mono-data text-[13px] text-txt-primary">
                      {formatCOPCompact(item.valor)}
                    </td>
                    <td className="px-4">
                      <span
                        className="inline-flex h-[22px] items-center rounded-md px-2 text-xs font-semibold"
                        style={{ backgroundColor: 'var(--warning-dim)', color: 'var(--warning)' }}
                      >
                        {t(`comi.motivo.${item.motivo}`)}
                      </span>
                    </td>
                    <td className="px-4">
                      <RuleBadge regla={item.sugerida} />
                    </td>
                    <td className="px-4 text-xs text-txt-muted">{formatRelative(item.detectado, lang, REFERENCE_NOW)}</td>
                    <td className="px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={(e) => openConfirm(item, 'apply', e.currentTarget)}
                          className="h-7 rounded-md bg-brand px-2.5 text-xs font-semibold text-canvas transition-all duration-100 ease-standard hover:bg-brand-hover active:scale-[0.97]"
                        >
                          {t('comi.apply')}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => openConfirm(item, 'exclude', e.currentTarget)}
                          className="h-7 rounded-md border border-border-strong px-2.5 text-xs font-medium text-txt-secondary transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary"
                        >
                          {t('comi.exclude')}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      <ConfirmPopover
        open={confirm !== null}
        anchor={confirm?.anchor ?? null}
        text={confirm?.action === 'apply' ? t('comi.confirmApply') : t('comi.confirmExclude')}
        confirmLabel={confirm?.action === 'apply' ? t('comi.apply') : t('comi.exclude')}
        cancelLabel={t('action.cancel')}
        tone={confirm?.action === 'exclude' ? 'danger' : 'brand'}
        onConfirm={() => {
          if (confirm) onResolve(confirm.item, confirm.action);
          setConfirm(null);
        }}
        onCancel={() => setConfirm(null)}
      />
    </motion.section>
  );
}
