import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpenCheck, GitCompareArrows, HandCoins, Landmark, MessageCircle, Pencil, Truck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLanguage } from '@/i18n';
import type { DictKey } from '@/i18n';
import { REFERENCE_NOW } from '@/lib/data';
import { MiniSwitch } from '@/components/comisiones/ui-bits';
import { cn } from '@/lib/utils';

type SchedKey = 'sync.every5' | 'sync.every15' | 'sync.every30' | 'sync.every60' | 'sync.daily' | 'sync.weeklyMon' | 'sync.onDemand';

interface SchedRow {
  id: string;
  icon: LucideIcon;
  nameKey: DictKey;
  schedKey: SchedKey;
  active: boolean;
  /** Warning note (WhatsApp opt-in). */
  warn?: boolean;
}

const INITIAL_ROWS: SchedRow[] = [
  { id: 'tesoreria', icon: Landmark, nameKey: 'modules.tesoreria', schedKey: 'sync.every15', active: true },
  { id: 'cartera', icon: HandCoins, nameKey: 'sync.schedCartera', schedKey: 'sync.every15', active: true },
  { id: 'compras', icon: Truck, nameKey: 'sync.schedCompras', schedKey: 'sync.every30', active: true },
  { id: 'causaciones', icon: BookOpenCheck, nameKey: 'sync.schedCausaciones', schedKey: 'sync.every15', active: true },
  { id: 'recon', icon: GitCompareArrows, nameKey: 'sync.schedRecon', schedKey: 'sync.daily', active: true },
  { id: 'whatsapp', icon: MessageCircle, nameKey: 'sync.schedWhatsapp', schedKey: 'sync.weeklyMon', active: false, warn: true },
];

const EDIT_OPTIONS: SchedKey[] = ['sync.every5', 'sync.every15', 'sync.every30', 'sync.every60', 'sync.daily'];

const INTERVAL_MIN: Partial<Record<SchedKey, number>> = {
  'sync.every5': 5,
  'sync.every15': 15,
  'sync.every30': 30,
  'sync.every60': 60,
};

/** Next run readout from the demo anchor: next interval boundary or fixed times. */
function nextRun(schedKey: SchedKey, fmtTime: (d: Date) => string): string {
  const mins = INTERVAL_MIN[schedKey];
  if (mins) {
    const next = new Date(REFERENCE_NOW);
    next.setSeconds(0, 0);
    next.setMinutes(Math.ceil((next.getMinutes() + 1) / mins) * mins);
    return fmtTime(next);
  }
  if (schedKey === 'sync.daily') return '06:00';
  if (schedKey === 'sync.weeklyMon') return '08:00';
  return '—';
}

interface ScheduleConfigProps {
  onUpdated: (name: string) => void;
}

/** [E] Programación de sincronizaciones — per-module frequency, switches, edit popover. */
export default function ScheduleConfig({ onUpdated }: ScheduleConfigProps) {
  const { t, lang } = useLanguage();
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [editing, setEditing] = useState<{ id: string; anchor: DOMRect } | null>(null);

  const fmtTime = (d: Date) =>
    new Intl.DateTimeFormat(lang === 'es' ? 'es-CO' : 'en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).format(d);

  const editingRow = rows.find((r) => r.id === editing?.id);

  return (
    <motion.section
      className="overflow-hidden rounded-xl border border-hairline bg-elevated"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.35 }}
    >
      <div className="p-5 pb-3">
        <h2 className="font-display text-[17px] font-semibold leading-6 text-txt-primary">{t('sync.schedule')}</h2>
        <p className="mt-0.5 text-xs text-txt-muted">{t('sync.scheduleCaption')}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="h-9 border-y border-hairline">
              <th className="text-overline px-5 font-semibold text-txt-muted">{t('common.module')}</th>
              <th className="text-overline px-4 font-semibold text-txt-muted">{t('sync.colSchedule')}</th>
              <th className="text-overline px-4 font-semibold text-txt-muted">{t('sync.colNext')}</th>
              <th className="text-overline px-4 font-semibold text-txt-muted">{t('status.active')}</th>
              <th className="text-overline px-4 text-right font-semibold text-txt-muted">{t('sync.edit')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const Icon = row.icon;
              return (
                <motion.tr
                  key={row.id}
                  className="h-11 border-b border-hairline last:border-b-0 hover:bg-[var(--bg-hover)]"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.025, ease: [0.16, 1, 0.3, 1] }}
                >
                  <td className="px-5">
                    <span className="flex items-center gap-2.5 text-[13px] font-medium text-txt-primary">
                      <Icon className="size-4 shrink-0 text-txt-muted" strokeWidth={1.75} aria-hidden />
                      {t(row.nameKey)}
                      {row.warn && (
                        <span className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: 'var(--warning)' }}>
                          <span className="size-1.5 rounded-full" style={{ backgroundColor: 'var(--warning)' }} />
                          {t('sync.optIn')}
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-4">
                    <span className="inline-flex h-[22px] items-center rounded-md bg-inset px-2 font-mono-data text-[11px] font-medium text-txt-secondary">
                      {t(row.schedKey)}
                    </span>
                  </td>
                  <td className="tabular px-4 font-mono-data text-xs text-txt-muted">
                    {t('sync.next')}: {nextRun(row.schedKey, fmtTime)}
                  </td>
                  <td className="px-4">
                    <MiniSwitch
                      checked={row.active}
                      ariaLabel={`${t(row.nameKey)} — ${t('status.active')}`}
                      onChange={(next) => setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, active: next } : r)))}
                    />
                  </td>
                  <td className="px-4 text-right">
                    <button
                      type="button"
                      aria-label={`${t('sync.scheduleEdit')} — ${t(row.nameKey)}`}
                      onClick={(e) => setEditing({ id: row.id, anchor: e.currentTarget.getBoundingClientRect() })}
                      className="inline-flex size-7 items-center justify-center rounded-md text-txt-muted transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary"
                    >
                      <Pencil className="size-3.5" strokeWidth={1.75} />
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Edit popover — interval select (scale 0.96→1, 140ms) */}
      <AnimatePresence>
        {editing && editingRow && (
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setEditing(null)} aria-hidden />
            <motion.div
              role="dialog"
              aria-label={t('sync.scheduleEdit')}
              className="fixed z-[61] w-56 rounded-lg border border-border-strong bg-overlay p-2 shadow-2xl"
              style={{
                top: editing.anchor.bottom + 8,
                left: Math.max(16, Math.min(editing.anchor.right - 224, window.innerWidth - 240)),
              }}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-overline px-2 pb-1.5 pt-1 text-txt-muted">{t('sync.interval')}</p>
              {EDIT_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setRows((prev) => prev.map((r) => (r.id === editing.id ? { ...r, schedKey: opt } : r)));
                    onUpdated(t(editingRow.nameKey));
                    setEditing(null);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left font-mono-data text-xs transition-colors',
                    editingRow.schedKey === opt
                      ? 'bg-brand-dim text-brand'
                      : 'text-txt-secondary hover:bg-[var(--bg-hover)] hover:text-txt-primary',
                  )}
                >
                  {t(opt)}
                  {editingRow.schedKey === opt && <span className="size-1.5 rounded-full bg-brand" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
