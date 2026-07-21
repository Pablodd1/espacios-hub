import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  CheckCheck,
  Clock3,
  FileText,
  Loader2,
  MessageCircle,
  RotateCcw,
  Send,
  X,
} from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import StatusBadge from '@/components/StatusBadge';
import { useLanguage } from '@/i18n';
import { cn } from '@/lib/utils';
import { REFERENCE_NOW } from '@/lib/data';
import { formatPhone, interp, slugify } from './model';
import type { CarteraModel, ClienteCartera } from './model';

type AudienceFilter = 'vencido' | 'todos' | 'zona';
type QueueStatus = 'cola' | 'enviando' | 'entregado' | 'fallido';

interface QueueRow {
  id: string;
  nombre: string;
  phone: string | null;
  status: QueueStatus;
}

const TEMPLATE_VARS = ['{{cliente}}', '{{saldo}}', '{{fecha_corte}}', '{{num_facturas}}'] as const;
const MAX_CHARS = 1000;

/* ==================== shared bits ==================== */

/** Small themed switch (design tokens, easeStandard). */
function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2.5 text-left"
    >
      <span
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-180 ease-standard',
          checked ? 'bg-brand' : 'bg-[rgba(255,255,255,0.12)]',
        )}
      >
        <motion.span
          className="absolute left-0.5 size-4 rounded-full bg-white shadow"
          animate={{ x: checked ? 16 : 0 }}
          transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
        />
      </span>
      <span className="text-[13px] text-txt-secondary">{label}</span>
    </button>
  );
}

/** easeSnap checkbox with pop. */
function Checkbox({ checked, onToggle, ariaLabel }: { checked: boolean; onToggle: () => void; ariaLabel: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={cn(
        'flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors duration-180',
        checked ? 'border-brand bg-brand' : 'border-border-strong bg-inset hover:border-txt-muted',
      )}
    >
      <motion.span
        initial={false}
        animate={{ scale: checked ? 1 : 0 }}
        transition={{ duration: 0.18, ease: [0.3, 1.4, 0.5, 1] }}
        className="flex"
      >
        <Check className="size-3 text-canvas" strokeWidth={3.5} />
      </motion.span>
    </button>
  );
}

/* ==================== D1. Audience panel ==================== */

function AudiencePanel({
  model,
  checked,
  setChecked,
  filter,
  setFilter,
}: {
  model: CarteraModel;
  checked: ReadonlySet<string>;
  setChecked: (next: Set<string>) => void;
  filter: AudienceFilter;
  setFilter: (f: AudienceFilter) => void;
}) {
  const { t, formatCOPCompact } = useLanguage();

  const visible = useMemo(() => {
    switch (filter) {
      case 'vencido':
        return model.clientes.filter((c) => c.vencido > 0);
      case 'zona':
        return model.clientes.filter((c) => c.tercero.zona === 'Medellín');
      case 'todos':
      default:
        return model.clientes.filter((c) => c.saldo > 0 || c.anticipo > 0);
    }
  }, [model.clientes, filter]);

  const visibleChecked = visible.filter((c) => checked.has(c.tercero.id));
  const allVisibleChecked = visible.length > 0 && visibleChecked.length === visible.length;
  const saldoSel = visibleChecked.reduce((acc, c) => acc + c.saldo, 0);

  const toggleAll = () => {
    const next = new Set(checked);
    if (allVisibleChecked) for (const c of visible) next.delete(c.tercero.id);
    else for (const c of visible) next.add(c.tercero.id);
    setChecked(next);
  };

  const toggle = (id: string) => {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setChecked(next);
  };

  const filters: { key: AudienceFilter; label: string }[] = [
    { key: 'vencido', label: t('cart.wa.fVencido') },
    { key: 'todos', label: t('cart.wa.fTodos') },
    { key: 'zona', label: t('cart.wa.fZona') },
  ];

  return (
    <section className="col-span-12 flex flex-col rounded-xl border border-hairline bg-elevated lg:col-span-3">
      <div className="border-b border-hairline p-4">
        <h2 className="font-display text-[17px] font-semibold leading-6 text-txt-primary">{t('cart.wa.audience')}</h2>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
              className={cn(
                'h-7 rounded-lg border px-2 text-[11px] font-semibold transition-all duration-180 ease-standard',
                filter === f.key
                  ? 'border-border-strong bg-overlay text-txt-primary'
                  : 'border-transparent bg-inset text-txt-muted hover:text-txt-secondary',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2.5 border-b border-hairline px-4 py-2.5">
        <Checkbox checked={allVisibleChecked} onToggle={toggleAll} ariaLabel={interp(t('cart.wa.selectAll'), { n: visible.length })} />
        <span className="text-[12px] font-semibold text-txt-secondary">{interp(t('cart.wa.selectAll'), { n: visible.length })}</span>
      </div>

      <ul className="flex-1 overflow-y-auto p-2" style={{ maxHeight: 380 }}>
        {visible.length === 0 && <EmptyState title={t('cart.wa.emptyAudience')} caption={t('cart.receipts.emptyCaption')} />}
        {visible.map((c) => {
          const isChecked = checked.has(c.tercero.id);
          return (
            <li key={c.tercero.id}>
              <button
                type="button"
                onClick={() => toggle(c.tercero.id)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors duration-180',
                  isChecked ? 'bg-[var(--brand-dim)]' : 'hover:bg-[var(--bg-hover)]',
                )}
              >
                <Checkbox checked={isChecked} onToggle={() => toggle(c.tercero.id)} ariaLabel={c.tercero.nombre} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-txt-primary">{c.tercero.nombre}</span>
                  <span className="mt-0.5 block font-mono-data text-[10px] text-txt-muted">{formatPhone(c.tercero.whatsapp)}</span>
                </span>
                <span className="tabular shrink-0 font-mono-data text-[12px] text-txt-primary">{formatCOPCompact(c.saldo)}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-hairline px-4 py-3">
        <p className="text-[12px] text-txt-muted">
          {interp(t('cart.wa.footer'), { n: visibleChecked.length, saldo: formatCOPCompact(saldoSel) })}
        </p>
      </div>
    </section>
  );
}

/* ==================== D2. Template editor ==================== */

function TemplateEditor({
  template,
  setTemplate,
  attachPdf,
  setAttachPdf,
  onlyVencidos,
  setOnlyVencidos,
  targetCount,
  sending,
  sentCount,
  onSendClick,
}: {
  template: string;
  setTemplate: (v: string) => void;
  attachPdf: boolean;
  setAttachPdf: (v: boolean) => void;
  onlyVencidos: boolean;
  setOnlyVencidos: (v: boolean) => void;
  targetCount: number;
  sending: boolean;
  sentCount: number;
  onSendClick: () => void;
}) {
  const { t } = useLanguage();
  const areaRef = useRef<HTMLTextAreaElement>(null);

  const insertVar = (v: string) => {
    const el = areaRef.current;
    if (!el) {
      setTemplate(template + v);
      return;
    }
    const start = el.selectionStart ?? template.length;
    const end = el.selectionEnd ?? template.length;
    const next = template.slice(0, start) + v + template.slice(end);
    setTemplate(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + v.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const overLimit = template.length > MAX_CHARS;

  return (
    <section className="col-span-12 flex flex-col rounded-xl border border-hairline bg-elevated p-5 lg:col-span-5">
      <h2 className="font-display text-[17px] font-semibold leading-6 text-txt-primary">{t('cart.wa.message')}</h2>

      <textarea
        ref={areaRef}
        value={template}
        onChange={(e) => setTemplate(e.target.value)}
        spellCheck={false}
        className="mt-4 h-[140px] w-full resize-none rounded-lg border border-hairline bg-inset p-3 font-mono-data text-[13px] leading-relaxed text-txt-primary outline-none transition-colors focus:border-border-strong"
      />

      {/* Variable chips — click to insert at cursor */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {TEMPLATE_VARS.map((v) => (
          <motion.button
            key={v}
            type="button"
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.12, ease: [0.3, 1.4, 0.5, 1] }}
            onClick={() => insertVar(v)}
            className="rounded-md bg-brand-dim px-2 py-1 font-mono-data text-[11px] font-medium transition-colors hover:brightness-125"
            style={{ color: 'var(--brand)' }}
          >
            {v}
          </motion.button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-hairline pt-4">
        <Switch checked={attachPdf} onChange={setAttachPdf} label={t('cart.wa.attachPdf')} />
        <Switch checked={onlyVencidos} onChange={setOnlyVencidos} label={t('cart.wa.onlyVencidos')} />
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-hairline pt-4">
        <p className={cn('tabular font-mono-data text-[12px]', overLimit ? 'text-danger' : 'text-txt-muted')}>
          {template.length}/{MAX_CHARS}
        </p>
        <button
          type="button"
          onClick={onSendClick}
          disabled={sending || targetCount === 0}
          className="flex h-9 items-center gap-2 rounded-lg bg-whatsapp px-4 text-sm font-semibold text-white transition-all duration-100 ease-standard hover:brightness-110 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
          style={
            sending || targetCount === 0
              ? undefined
              : { boxShadow: '0 0 0 1px rgba(37,211,102,.35), 0 4px 24px -4px rgba(37,211,102,.35)' }
          }
        >
          {sending ? <Loader2 className="size-4 animate-spin" strokeWidth={1.75} /> : <Send className="size-4" strokeWidth={1.75} />}
          {sending
            ? interp(t('cart.wa.sending'), { k: sentCount, n: targetCount })
            : interp(t('cart.wa.send'), { n: targetCount })}
        </button>
      </div>
    </section>
  );
}

/* ==================== D3. Phone preview + send queue ==================== */

function TypingBubble() {
  return (
    <motion.div
      key="typing"
      className="flex w-fit items-center gap-1 rounded-xl rounded-tl-sm px-3 py-2.5"
      style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-txt-secondary"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </motion.div>
  );
}

function PhonePreview({
  cliente,
  rendered,
  typing,
  attachPdf,
  queueStatus,
}: {
  cliente: ClienteCartera | undefined;
  rendered: string;
  typing: boolean;
  attachPdf: boolean;
  queueStatus: QueueStatus | null;
}) {
  const { t, formatDate } = useLanguage();
  return (
    <motion.div
      className="mx-auto w-full max-w-[300px]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <p className="text-overline mb-2 text-center text-txt-muted">{t('cart.wa.previewFrom')}</p>
      <div className="relative" style={{ aspectRatio: '300 / 620' }}>
        {/* Chat DOM inside the transparent screen area */}
        <div className="absolute inset-x-[7%] bottom-[4%] top-[9%] flex flex-col overflow-hidden rounded-[28px] bg-inset">
          {/* WhatsApp-style header */}
          <div className="flex items-center gap-2 border-b border-hairline bg-surface px-3 py-2.5">
            <span className="flex size-7 items-center justify-center rounded-full bg-[var(--brand-dim)] text-[10px] font-bold" style={{ color: 'var(--brand)' }}>
              {(cliente?.tercero.nombre ?? '—').slice(0, 1)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold text-txt-primary">{cliente?.tercero.nombre ?? '—'}</p>
              <p className="font-mono-data text-[9px] text-txt-muted">{formatPhone(cliente?.tercero.whatsapp ?? null)}</p>
            </div>
          </div>

          {/* Thread */}
          <div className="flex flex-1 flex-col justify-end gap-2 overflow-y-auto p-2.5">
            <AnimatePresence mode="wait">
              {typing ? (
                <TypingBubble key="typing" />
              ) : (
                <motion.div
                  key={rendered}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col items-end gap-1.5"
                >
                  <div
                    className="w-full max-w-[92%] whitespace-pre-line rounded-xl rounded-br-sm p-2.5 text-[11px] leading-relaxed text-txt-primary"
                    style={{ backgroundColor: 'rgba(37,211,102,0.16)' }}
                  >
                    {rendered}
                    <span className="mt-1 flex items-center justify-end gap-1 text-[9px] text-txt-muted">
                      {formatDate(REFERENCE_NOW, 'time')}
                      {queueStatus === 'entregado' ? (
                        <motion.span
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.2, ease: [0.3, 1.4, 0.5, 1] }}
                          className="flex"
                        >
                          <CheckCheck className="size-3" strokeWidth={2} style={{ color: 'var(--whatsapp)' }} />
                        </motion.span>
                      ) : queueStatus === 'enviando' ? (
                        <Check className="size-3 text-txt-muted" strokeWidth={2} />
                      ) : null}
                    </span>
                  </div>
                  {attachPdf && cliente && (
                    <div className="flex w-full max-w-[92%] items-center gap-2 rounded-xl rounded-br-sm border border-hairline bg-surface p-2">
                      <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--danger-dim)]">
                        <FileText className="size-4 text-danger" strokeWidth={1.75} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-mono-data text-[10px] text-txt-primary">
                          estado-cuenta-{slugify(cliente.tercero.nombre)}.pdf
                        </span>
                        <span className="text-[9px] text-txt-muted">PDF</span>
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        {/* Frame on top */}
        <img src="/whatsapp-phone.svg" alt="" className="pointer-events-none absolute inset-0 h-full w-full" />
      </div>
    </motion.div>
  );
}

function QueueBadge({ status }: { status: QueueStatus }) {
  const { t } = useLanguage();
  switch (status) {
    case 'cola':
      return (
        <span
          className="inline-flex h-[22px] items-center gap-1.5 rounded-md px-2 text-xs font-semibold"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}
        >
          <Clock3 className="size-3" strokeWidth={2.25} />
          {t('cart.wa.qEnCola')}
        </span>
      );
    case 'enviando':
      return <StatusBadge status="en_proceso" label={t('cart.wa.qEnviando')} />;
    case 'entregado':
      return (
        <motion.span
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2, ease: [0.3, 1.4, 0.5, 1] }}
          className="inline-flex h-[22px] items-center gap-1.5 rounded-md px-2 text-xs font-semibold"
          style={{ backgroundColor: 'rgba(37,211,102,0.12)', color: 'var(--whatsapp)' }}
        >
          <CheckCheck className="size-3" strokeWidth={2.5} />
          {t('cart.wa.qEntregado')}
        </motion.span>
      );
    case 'fallido':
      return <StatusBadge status="error" label={t('cart.wa.qFallido')} />;
  }
}

function SendQueue({ queue, onRetry }: { queue: QueueRow[]; onRetry: (id: string) => void }) {
  const { t } = useLanguage();
  return (
    <div className="rounded-xl border border-hairline bg-elevated p-4">
      <h3 className="text-overline mb-2 text-txt-muted">{t('cart.wa.qTitle')}</h3>
      <ul className="flex max-h-[220px] flex-col overflow-y-auto">
        <AnimatePresence initial={false}>
          {queue.map((row, i) => (
            <motion.li
              key={row.id}
              className="flex h-10 items-center gap-2.5 border-b border-hairline last:border-b-0"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            >
              <MessageCircle className="size-3.5 shrink-0 text-txt-muted" strokeWidth={1.75} />
              <span className="min-w-0 flex-1 truncate text-[13px] text-txt-primary">{row.nombre}</span>
              <span className="hidden font-mono-data text-[11px] text-txt-muted sm:inline">{formatPhone(row.phone)}</span>
              <QueueBadge status={row.status} />
              {row.status === 'fallido' && (
                <button
                  type="button"
                  onClick={() => onRetry(row.id)}
                  aria-label={t('action.retry')}
                  className="rounded-md p-1 text-txt-muted transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary"
                >
                  <RotateCcw className="size-3.5" strokeWidth={1.75} />
                </button>
              )}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

/* ==================== Confirm modal + Tab ==================== */

function ConfirmSendModal({
  open,
  count,
  onClose,
  onConfirm,
}: {
  open: boolean;
  count: number;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { t } = useLanguage();
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-[rgba(4,6,10,0.6)] backdrop-blur-[8px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal
            className="fixed left-1/2 top-1/2 z-50 w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border-strong bg-overlay p-6 shadow-2xl"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-start justify-between">
              <h2 className="font-display text-[17px] font-semibold text-txt-primary">{t('cart.wa.confirmTitle')}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label={t('action.close')}
                className="rounded-md p-1 text-txt-muted transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary"
              >
                <X className="size-4" strokeWidth={1.75} />
              </button>
            </div>
            <p className="mt-2 text-sm text-txt-secondary">{interp(t('cart.wa.confirmBody'), { n: count })}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-9 rounded-lg px-4 text-sm font-medium text-txt-secondary transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary"
              >
                {t('action.cancel')}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="flex h-9 items-center gap-2 rounded-lg bg-whatsapp px-4 text-sm font-semibold text-white transition-all duration-100 ease-standard hover:brightness-110 active:scale-[0.97]"
                style={{ boxShadow: '0 0 0 1px rgba(37,211,102,.35), 0 4px 24px -4px rgba(37,211,102,.35)' }}
              >
                <Send className="size-4" strokeWidth={1.75} />
                {t('cart.wa.confirmCta')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function WhatsAppTab({
  model,
  preselectId,
  notify,
}: {
  model: CarteraModel;
  preselectId: string | null;
  notify: (text: string) => void;
}) {
  const { t, formatCOP, formatDate } = useLanguage();
  const [filter, setFilter] = useState<AudienceFilter>('todos');
  const [checked, setChecked] = useState<Set<string>>(() => new Set());
  const [template, setTemplateRaw] = useState(() => t('cart.wa.templateDefault'));
  const [attachPdf, setAttachPdf] = useState(true);
  const [onlyVencidos, setOnlyVencidos] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [queue, setQueue] = useState<QueueRow[]>([]);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);

  const sendTimer = useRef<number>(0);
  const typingTimer = useRef<number>(0);
  const retryTimer = useRef<number>(0);

  useEffect(
    () => () => {
      window.clearInterval(sendTimer.current);
      window.clearTimeout(typingTimer.current);
      window.clearTimeout(retryTimer.current);
    },
    [],
  );

  // Pre-select a client when arriving from Estados de cuenta (adjust-state-during-render pattern).
  const [prevPreselect, setPrevPreselect] = useState<string | null>(null);
  if (preselectId !== prevPreselect) {
    setPrevPreselect(preselectId);
    if (preselectId) {
      setFilter('todos');
      setChecked(new Set([preselectId]));
    }
  }

  const setTemplate = (v: string) => {
    setTemplateRaw(v);
    setTyping(true);
    window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => setTyping(false), 800);
  };

  /** Send targets: checked clients, optionally restricted to overdue balances. */
  const targets = useMemo(
    () => model.clientes.filter((c) => checked.has(c.tercero.id) && (!onlyVencidos || c.vencido > 0)),
    [model.clientes, checked, onlyVencidos],
  );

  const previewClient =
    targets[0] ?? model.clientes.find((c) => checked.has(c.tercero.id)) ?? model.clientes.find((c) => c.saldo > 0) ?? model.clientes[0];

  const rendered = useMemo(
    () =>
      template
        .replaceAll('{{cliente}}', previewClient?.tercero.nombre ?? '—')
        .replaceAll('{{saldo}}', formatCOP(previewClient?.saldo ?? 0))
        .replaceAll('{{fecha_corte}}', formatDate(REFERENCE_NOW, 'day'))
        .replaceAll('{{num_facturas}}', String(previewClient?.facturas.length ?? 0)),
    [template, previewClient, formatCOP, formatDate],
  );

  const sentCount = queue.filter((r) => r.status === 'entregado' || r.status === 'fallido').length;
  const previewQueueStatus = queue.find((r) => r.id === previewClient?.tercero.id)?.status ?? null;

  const startSend = () => {
    setModalOpen(false);
    setSending(true);
    setQueue(
      targets.map((c) => ({
        id: c.tercero.id,
        nombre: c.tercero.nombre,
        phone: c.tercero.whatsapp,
        status: 'cola' as QueueStatus,
      })),
    );
    let k = 0;
    sendTimer.current = window.setInterval(() => {
      k += 1;
      setQueue((prev) =>
        prev.map((row, idx) => {
          if (idx === k - 1) return { ...row, status: 'enviando' };
          if (idx === k - 2) return { ...row, status: row.phone ? 'entregado' : 'fallido' };
          return row;
        }),
      );
      if (k > targets.length) {
        window.clearInterval(sendTimer.current);
        setSending(false);
        notify(`${t('cart.wa.sentDone')} · ${targets.length}/${targets.length}`);
      }
    }, 650);
  };

  const retryRow = (id: string) => {
    setQueue((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'enviando' } : r)));
    retryTimer.current = window.setTimeout(() => {
      setQueue((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'entregado' } : r)));
    }, 700);
  };

  return (
    <div className="grid grid-cols-12 gap-5">
      <AudiencePanel model={model} checked={checked} setChecked={setChecked} filter={filter} setFilter={setFilter} />

      <TemplateEditor
        template={template}
        setTemplate={setTemplate}
        attachPdf={attachPdf}
        setAttachPdf={setAttachPdf}
        onlyVencidos={onlyVencidos}
        setOnlyVencidos={setOnlyVencidos}
        targetCount={targets.length}
        sending={sending}
        sentCount={sentCount}
        onSendClick={() => setModalOpen(true)}
      />

      <div className="col-span-12 flex flex-col gap-4 lg:col-span-4">
        <PhonePreview cliente={previewClient} rendered={rendered} typing={typing} attachPdf={attachPdf} queueStatus={previewQueueStatus} />

        <AnimatePresence initial={false}>
          {queue.length > 0 && (
            <motion.div
              key="queue"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <SendQueue queue={queue} onRetry={retryRow} />
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-[11px] leading-relaxed text-txt-muted">{t('cart.wa.compliance')}</p>
      </div>

      <ConfirmSendModal open={modalOpen} count={targets.length} onClose={() => setModalOpen(false)} onConfirm={startSend} />
    </div>
  );
}
