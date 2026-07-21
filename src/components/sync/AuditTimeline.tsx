import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, RefreshCw } from 'lucide-react';
import { formatRelative, moduleLabels, useLanguage } from '@/i18n';
import type { DictKey } from '@/i18n';
import { REFERENCE_NOW, getAuditLog } from '@/lib/data';
import { cn } from '@/lib/utils';

type AuditFilter = 'todos' | 'humanos' | 'motor';

interface ActorMeta {
  name: string;
  /** Avatar image (Adriana) or initials for the dot. */
  avatar?: string;
  initials?: string;
  engine?: boolean;
}

function actorMeta(actor: string, t: (k: DictKey) => string): ActorMeta {
  if (actor === 'system') return { name: t('sync.actorEngine'), engine: true };
  if (actor === 'adriana.restrepo@espacios.co') return { name: 'Adriana Restrepo', avatar: '/avatar-admin.png' };
  if (actor === 'admin@espacios.co') return { name: t('sync.actorCeo'), initials: 'JG' };
  if (actor === 'contador@espacios.co') return { name: t('sync.actorAccountant'), initials: 'CT' };
  return { name: actor, initials: actor.slice(0, 2).toUpperCase() };
}

const VERB_KEY: Record<string, DictKey> = {
  sync: 'sync.auditSync',
  update: 'sync.auditUpdate',
  create: 'sync.auditCreate',
  export: 'sync.auditExport',
};

function changeTone(value: unknown): string {
  const v = String(value);
  if (v === 'error') return 'var(--danger)';
  if (v === 'diferencia') return 'var(--warning)';
  if (v === 'ok') return 'var(--brand)';
  return 'var(--text-primary)';
}

/** [D1] Registro de auditoría — immutable vertical timeline, human/engine filters. */
export default function AuditTimeline() {
  const { t, lang } = useLanguage();
  const [filter, setFilter] = useState<AuditFilter>('todos');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const entries = useMemo(() => {
    const all = getAuditLog(20);
    if (filter === 'humanos') return all.filter((e) => e.actor !== 'system');
    if (filter === 'motor') return all.filter((e) => e.actor === 'system');
    return all;
  }, [filter]);

  const FILTERS: { id: AuditFilter; label: string }[] = [
    { id: 'todos', label: t('common.all') },
    { id: 'humanos', label: t('sync.filterHumans') },
    { id: 'motor', label: t('sync.filterEngine') },
  ];

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <motion.section
      className="col-span-12 flex flex-col rounded-xl border border-hairline bg-elevated p-5 xl:col-span-7"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.25 }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-[17px] font-semibold leading-6 text-txt-primary">{t('sync.audit')}</h2>
          <p className="mt-0.5 text-xs text-txt-muted">{t('sync.auditCaption')}</p>
        </div>
        <div className="flex h-7 items-center rounded-lg bg-inset p-0.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'h-6 rounded-md px-2.5 text-[11px] font-semibold transition-all duration-180',
                filter === f.id
                  ? 'border border-border-strong bg-overlay text-txt-primary'
                  : 'text-txt-muted hover:text-txt-secondary',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-4 flex flex-col">
        <AnimatePresence initial={false} mode="popLayout">
          {entries.map((entry, i) => {
            const meta = actorMeta(entry.actor, t);
            const verb = entry.accion ? t(VERB_KEY[entry.accion] ?? 'sync.auditSync') : '';
            const modulo = typeof entry.detalle?.modulo === 'string' ? entry.detalle.modulo : null;
            const detalleKeys = entry.detalle ? Object.entries(entry.detalle).filter(([k]) => k !== 'modulo') : [];
            const isOpen = expanded.has(entry.id);
            return (
              <motion.li
                key={entry.id}
                layout="position"
                className="relative flex gap-3 pb-5 last:pb-0"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.035, 0.5), ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Rail */}
                {i < entries.length - 1 && (
                  <span className="absolute left-[15px] top-8 h-[calc(100%-16px)] w-px bg-border-strong" aria-hidden />
                )}

                {/* Actor avatar / engine dot */}
                {meta.avatar ? (
                  <img
                    src={meta.avatar}
                    alt=""
                    className="relative z-10 size-8 shrink-0 rounded-full border border-border-strong object-cover"
                  />
                ) : meta.engine ? (
                  <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-border-strong bg-inset">
                    <RefreshCw className="size-3.5" style={{ color: 'var(--sync)' }} strokeWidth={1.75} aria-hidden />
                  </span>
                ) : (
                  <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-border-strong bg-inset text-[10px] font-bold text-txt-secondary">
                    {meta.initials}
                  </span>
                )}

                <div className="min-w-0 flex-1 pt-1">
                  <p className="text-[13px] leading-5 text-txt-primary">
                    <span className="font-semibold">{meta.name}</span> {verb}{' '}
                    <span className="font-mono-data text-txt-secondary">{entry.entidad_id ?? entry.entidad ?? ''}</span>
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {modulo && (
                      <span className="inline-flex h-5 items-center rounded bg-inset px-1.5 text-[10px] font-semibold text-txt-muted">
                        {t(moduleLabels[modulo as keyof typeof moduleLabels] ?? 'modules.tesoreria')}
                      </span>
                    )}
                    <span className="font-mono-data text-[11px] text-txt-muted">
                      {formatRelative(entry.created_at, lang, REFERENCE_NOW)}
                    </span>
                    {detalleKeys.length > 0 && (
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => toggleExpand(entry.id)}
                        className="flex items-center gap-1 text-[11px] font-medium transition-colors hover:text-txt-primary"
                        style={{ color: 'var(--sync)' }}
                      >
                        {t('sync.viewChange')}
                        <ChevronDown className={cn('size-3 transition-transform duration-180', isOpen && 'rotate-180')} strokeWidth={2} />
                      </button>
                    )}
                  </div>

                  <AnimatePresence initial={false}>
                    {isOpen && detalleKeys.length > 0 && (
                      <motion.div
                        key="change"
                        className="overflow-hidden"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <div className="mt-2 flex flex-col gap-0.5 rounded-lg bg-inset p-2.5">
                          {detalleKeys.map(([k, v]) => (
                            <p key={k} className="font-mono-data text-[11px] leading-4">
                              <span className="text-txt-muted">{k}: </span>
                              <span style={{ color: changeTone(v) }}>{String(v)}</span>
                            </p>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </motion.section>
  );
}
