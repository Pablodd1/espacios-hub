import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Anchor, Check, CheckCircle2, ChevronDown, FileText, HandCoins, History, PackageCheck, Ship, X } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { useLanguage } from '@/i18n';
import { REFERENCE_NOW } from '@/lib/data';
import type { Contenedor } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  anticipoLabel,
  carrierOf,
  customsAgentName,
  distTimestamps,
  linkedAnticipos,
  linkedCompras,
  pseudoPosition,
  transitProgress,
} from './container-vm';
import { LIFECYCLE_ORDER, STAGE_LABEL_KEYS } from './lifecycle';

/* ================= Timeline node ================= */

type NodeState = 'done' | 'current' | 'upcoming';

interface TimelineNode {
  title: string;
  caption: string;
  state: NodeState;
  icon: typeof Ship;
  liveCaption?: string;
  daysLeftChip?: string;
}

function Timeline({ nodes }: { nodes: TimelineNode[] }) {
  return (
    <div className="relative pl-1">
      {/* connecting line — draws scaleY 0→1 */}
      <motion.span
        className="absolute bottom-5 left-[9px] top-5 w-px origin-top"
        style={{ backgroundColor: 'var(--border-strong)' }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden
      />
      <ul className="flex flex-col gap-5">
        {nodes.map((node, i) => {
          const Icon = node.icon;
          return (
            <motion.li
              key={node.title}
              className="relative flex gap-3.5"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.09, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="relative z-10 mt-0.5 flex size-[18px] shrink-0 items-center justify-center">
                {node.state === 'current' ? (
                  <span className="relative inline-flex size-2.5">
                    <span
                      className="absolute inline-flex size-2.5 rounded-full motion-safe:animate-[live-pulse_2s_ease-out_infinite]"
                      style={{ backgroundColor: 'var(--sync)', boxShadow: '0 0 12px 2px rgba(56,189,248,.55)' }}
                    />
                    <span className="relative inline-flex size-2.5 rounded-full" style={{ backgroundColor: 'var(--sync)' }} />
                  </span>
                ) : node.state === 'done' ? (
                  <span className="flex size-[18px] items-center justify-center rounded-full" style={{ backgroundColor: 'var(--brand-dim)' }}>
                    <Check className="size-2.5" style={{ color: 'var(--brand)' }} strokeWidth={3} />
                  </span>
                ) : (
                  <span className="size-2.5 rounded-full border-2" style={{ borderColor: 'var(--border-strong)' }} />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Icon
                    className="size-3.5"
                    style={{ color: node.state === 'upcoming' ? 'var(--text-muted)' : node.state === 'current' ? 'var(--sync)' : 'var(--brand)' }}
                    strokeWidth={1.75}
                  />
                  <p
                    className="text-sm font-medium"
                    style={{ color: node.state === 'upcoming' ? 'var(--text-muted)' : 'var(--text-primary)' }}
                  >
                    {node.title}
                  </p>
                  {node.daysLeftChip && (
                    <span
                      className="inline-flex h-5 items-center rounded-md px-1.5 text-[11px] font-semibold"
                      style={{ backgroundColor: 'var(--sync-dim)', color: 'var(--sync)' }}
                    >
                      {node.daysLeftChip}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-txt-muted">{node.caption}</p>
                {node.state === 'current' && node.liveCaption && (
                  <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-md bg-inset px-2 py-1 font-mono-data text-[11px] text-txt-secondary">
                    <span className="size-1.5 rounded-full" style={{ backgroundColor: 'var(--sync)' }} />
                    {node.liveCaption}
                  </p>
                )}
              </div>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

/* ================= Key-value grid ================= */

function KV({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-overline text-txt-muted">{label}</p>
      <p className={cn('mt-1 truncate text-sm text-txt-primary', mono && 'font-mono-data text-[13px]')}>{value}</p>
    </div>
  );
}

/* ================= Drawer ================= */

interface ContainerDrawerProps {
  container: Contenedor | null;
  onClose: () => void;
  /** Advance lifecycle to the next stage (writes audit_log in production). */
  onAdvanceStage: (c: Contenedor) => void;
}

export default function ContainerDrawer({ container, onClose, onAdvanceStage }: ContainerDrawerProps) {
  const { t, formatDate, formatCOP, formatNumber } = useLanguage();
  const [stageMenu, setStageMenu] = useState(false);

  // Esc closes
  useEffect(() => {
    if (!container) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [container, onClose]);

  // Close the stage menu whenever another container is opened (adjust-state-during-render)
  const cId = container?.id;
  const [prevId, setPrevId] = useState(cId);
  if (prevId !== cId) {
    setPrevId(cId);
    setStageMenu(false);
  }

  const c = container;
  const nextStage = c ? LIFECYCLE_ORDER[LIFECYCLE_ORDER.indexOf(c.estado) + 1] : undefined;

  let nodes: TimelineNode[] = [];
  let registry: { label: string; value: string; mono?: boolean }[] = [];
  let dist: { key: 'hgi' | 'pbi' | 'ia'; label: string; desc: string; ts: string; color: string }[] = [];
  let docs: { compras: ReturnType<typeof linkedCompras>; anticipos: ReturnType<typeof linkedAnticipos> } = { compras: [], anticipos: [] };

  if (c) {
    const { day, total, daysLeft } = transitProgress(c, REFERENCE_NOW);
    const zarpeDate = c.fecha_zarpe ? formatDate(c.fecha_zarpe, 'day') : '—';
    const etaDate = c.fecha_arribo ? formatDate(c.fecha_arribo, 'day') : '—';
    const idx = LIFECYCLE_ORDER.indexOf(c.estado);
    const st = (i: number): NodeState => (i < idx ? 'done' : i === idx ? (c.estado === 'entregado' ? 'done' : 'current') : 'upcoming');

    nodes = [
      {
        title: t('comex.timelineZarpe'),
        caption: `${c.origen ?? '—'}, ${zarpeDate}`,
        state: st(0),
        icon: Ship,
      },
      {
        title: t('comex.stage.transit'),
        caption:
          c.estado === 'en_transito'
            ? t('comex.transitDay').replace('{d}', String(day)).replace('{total}', String(total))
            : `${c.origen ?? '—'} → ${c.puerto ?? '—'}`,
        state: st(1),
        icon: Ship,
        liveCaption: c.estado === 'en_transito' ? t('comex.lastPosition').replace('{pos}', pseudoPosition(c.id)) : undefined,
        daysLeftChip: c.estado === 'en_transito' ? t('comex.daysLeft').replace('{d}', String(daysLeft)) : undefined,
      },
      {
        title: t('comex.timelineArribo'),
        caption:
          c.estado === 'en_transito'
            ? `${c.puerto ?? '—'}, ${t('comex.drawerEta').replace('{date}', etaDate)}`
            : `${c.puerto ?? '—'}, ${t('comex.arrivedOn').replace('{date}', etaDate)}`,
        state: st(2),
        icon: Anchor,
      },
      {
        title: t('comex.timelineLevanteEntrega'),
        caption: c.fecha_levante ? formatDate(c.fecha_levante, 'day') : `${t('comex.stage.levante')} → ${t('comex.stage.delivered')}`,
        state: st(3),
        icon: c.estado === 'entregado' ? CheckCircle2 : PackageCheck,
      },
    ];

    registry = [
      { label: t('comex.formOrigen'), value: c.origen ?? '—' },
      { label: t('comex.formDestino'), value: c.puerto ?? '—' },
      { label: t('comex.formProducto'), value: c.producto ?? '—' },
      { label: t('comex.formCodigo'), value: c.codigo_producto ?? '—', mono: true },
      {
        label: t('comex.formCantidad'),
        value: c.cantidad !== null ? t('comex.qtyUnits').replace('{n}', formatNumber(c.cantidad)) : '—',
        mono: true,
      },
      { label: t('comex.carrier'), value: carrierOf(c.numero_contenedor) },
      { label: t('comex.customsAgent'), value: customsAgentName() },
      { label: t('comex.formBl'), value: c.bl ?? '—', mono: true },
    ];

    const ts = distTimestamps(c);
    dist = [
      { key: 'hgi', label: 'HGI', desc: t('comex.distHgi'), ts: ts.hgi, color: 'var(--hgi)' },
      { key: 'pbi', label: 'Power BI', desc: t('comex.distPbi'), ts: ts.pbi, color: 'var(--warning)' },
      { key: 'ia', label: t('comex.aiAssistant'), desc: t('comex.distIa'), ts: ts.ia, color: 'var(--violet)' },
    ];

    docs = { compras: linkedCompras(c), anticipos: linkedAnticipos(c) };
  }

  return (
    <AnimatePresence>
      {c && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-[rgba(4,6,10,0.5)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal
            aria-label={c.numero_contenedor}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[560px] flex-col border-l border-border-strong bg-overlay"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-hairline px-6 py-5">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-mono-data text-[17px] font-semibold text-txt-primary">{c.numero_contenedor}</h2>
                  <StatusBadge status={c.estado} label={t(STAGE_LABEL_KEYS[c.estado])} />
                </div>
                <p className="mt-1.5 text-xs text-txt-muted">
                  BL <span className="font-mono-data">{c.bl ?? '—'}</span>
                  {' · '}
                  {t('comex.timelineZarpe')} {c.fecha_zarpe ? formatDate(c.fecha_zarpe, 'day') : '—'}
                  {' · '}
                  {t('comex.drawerEta').replace('{date}', c.fecha_arribo ? formatDate(c.fecha_arribo, 'day') : '—')}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={t('action.close')}
                className="rounded-md p-1.5 text-txt-muted transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary"
              >
                <X className="size-4" strokeWidth={1.75} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {/* Lifecycle timeline */}
              <section className="border-b border-hairline px-6 py-5">
                <Timeline nodes={nodes} />
              </section>

              {/* Registro único */}
              <section className="border-b border-hairline px-6 py-5">
                <h3 className="text-overline mb-4 text-txt-muted">{t('comex.registry')}</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {registry.map((item) => (
                    <KV key={item.label} label={item.label} value={item.value} mono={item.mono} />
                  ))}
                </div>
              </section>

              {/* Distribución automática */}
              <section className="border-b border-hairline px-6 py-5">
                <h3 className="text-overline mb-4 text-txt-muted">{t('comex.distAuto')}</h3>
                <div className="flex flex-col gap-2">
                  {dist.map((d, i) => (
                    <motion.div
                      key={d.key}
                      className="flex h-11 items-center gap-3 rounded-lg border border-hairline bg-elevated px-3"
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.24, delay: 0.2 + i * 0.07, ease: [0.3, 1.4, 0.5, 1] }}
                    >
                      <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="w-20 shrink-0 text-[13px] font-semibold text-txt-primary">{d.label}</span>
                      <span className="min-w-0 flex-1 truncate text-xs text-txt-secondary">
                        {d.desc} · <span className="font-mono-data text-[11px]">{formatDate(d.ts, 'short')}</span>
                      </span>
                      <Check className="size-3.5 shrink-0 text-brand" strokeWidth={2.5} />
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Documentos vinculados */}
              <section className="px-6 py-5">
                <h3 className="text-overline mb-4 text-txt-muted">{t('comex.linkedDocs')}</h3>
                {docs.compras.length === 0 && docs.anticipos.length === 0 ? (
                  <p className="text-[13px] text-txt-muted">{t('comex.noLinkedDocs')}</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {docs.compras.map((d) => (
                      <span
                        key={d.id}
                        className="inline-flex h-8 items-center gap-2 rounded-lg border border-hairline bg-elevated px-2.5 text-xs text-txt-secondary"
                      >
                        <FileText className="size-3.5 text-txt-muted" strokeWidth={1.75} />
                        {t('comex.supplierInvoice')}
                        <span className="font-mono-data font-medium text-txt-primary">{d.numero}</span>
                      </span>
                    ))}
                    {docs.anticipos.map((a) => (
                      <span
                        key={a.id}
                        className="inline-flex h-8 items-center gap-2 rounded-lg border border-hairline bg-elevated px-2.5 text-xs text-txt-secondary"
                      >
                        <HandCoins className="size-3.5 text-txt-muted" strokeWidth={1.75} />
                        {t('docType.anticipo')}
                        <span className="font-mono-data font-medium text-txt-primary">
                          {anticipoLabel(a.id)}{a.valor !== null ? ` (${formatCOP(a.valor)})` : ''}
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 border-t border-hairline px-6 py-4">
              <button
                type="button"
                className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-txt-secondary transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary"
              >
                <History className="size-4 text-txt-muted" strokeWidth={1.75} />
                {t('comex.viewAudit')}
              </button>
              <div className="relative">
                <button
                  type="button"
                  disabled={!nextStage}
                  onClick={() => setStageMenu((v) => !v)}
                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-canvas transition-all duration-100 ease-standard hover:bg-brand-hover active:scale-[0.97] disabled:cursor-default disabled:opacity-50"
                  style={nextStage ? { boxShadow: '0 0 0 1px rgba(22,199,132,.35), 0 4px 24px -4px rgba(22,199,132,.35)' } : undefined}
                  aria-haspopup="menu"
                  aria-expanded={stageMenu}
                >
                  {t('comex.updateStage')}
                  <ChevronDown className="size-3.5" strokeWidth={2} />
                </button>
                <AnimatePresence>
                  {stageMenu && nextStage && (
                    <motion.div
                      role="menu"
                      className="absolute bottom-11 right-0 w-56 rounded-lg border border-border-strong bg-overlay p-1 shadow-xl"
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          onAdvanceStage(c);
                          setStageMenu(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-[13px] text-txt-secondary transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary"
                      >
                        {t('comex.advanceTo').replace('{stage}', t(STAGE_LABEL_KEYS[nextStage]))}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
