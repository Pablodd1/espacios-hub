import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock3,
  Download,
  GitCompareArrows,
  Loader2,
  RefreshCw,
  X,
} from 'lucide-react';
import KpiCard from '@/components/KpiCard';
import { useCountUp } from '@/hooks/use-count-up';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import SyncPair from '@/components/SyncPair';
import { LiveDot } from '@/components/AppShell';
import { formatRelative, moduleLabels, useLanguage } from '@/i18n';
import type { Lang } from '@/i18n';
import {
  REFERENCE_NOW,
  getContenedoresActivos,
  getJobDurationSec,
  getKpiSummary,
  getLiveFeed,
  getModuleHealth,
  getReconciliacionPendiente,
  getReconciliationTrend,
} from '@/lib/data';
import type { Contenedor, SyncJob, TrendPoint } from '@/lib/types';
import { cn } from '@/lib/utils';

const CHART_PALETTE = ['#16C784', '#38BDF8', '#8B5CF6', '#F5A524', '#F04452', '#64748B'];
const LIFECYCLE: Contenedor['estado'][] = ['en_transito', 'arribado', 'levante', 'entregado'];

const dayMonth = (iso: string, lang: Lang) =>
  new Intl.DateTimeFormat(lang === 'es' ? 'es-CO' : 'en-US', { day: 'numeric', month: 'short' }).format(new Date(iso));

/* ==================== [A] Sync-all confirm modal + toast ==================== */

function ConfirmSyncModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
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
              <h2 className="font-display text-[17px] font-semibold text-txt-primary">{t('dash.confirmSyncTitle')}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label={t('action.close')}
                className="rounded-md p-1 text-txt-muted transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary"
              >
                <X className="size-4" strokeWidth={1.75} />
              </button>
            </div>
            <p className="mt-2 text-sm text-txt-secondary">{t('dash.confirmSyncBody')}</p>
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
                className="h-9 rounded-lg bg-brand px-4 text-sm font-semibold text-canvas transition-all duration-100 ease-standard hover:bg-brand-hover active:scale-[0.97]"
                style={{ boxShadow: '0 0 0 1px rgba(22,199,132,.35), 0 4px 24px -4px rgba(22,199,132,.35)' }}
              >
                {t('dash.runNow')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SuccessToast({ visible, text }: { visible: boolean; text: string }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-6 right-6 z-50 flex w-[360px] items-start gap-3 rounded-xl border border-border-strong bg-overlay p-4 shadow-2xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.22, ease: [0.3, 1.4, 0.5, 1] }}
        >
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand" strokeWidth={1.75} />
          <p className="text-sm font-medium text-txt-primary">{text}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ==================== [C1] Reconciliation trend ==================== */

function TrendTooltip({ active, payload, label, lang }: {
  active?: boolean;
  payload?: { value?: number; dataKey?: string }[];
  label?: string;
  lang: Lang;
}) {
  const { t } = useLanguage();
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-border-strong bg-overlay px-3 py-2 shadow-xl">
      <p className="mb-1 text-[11px] text-txt-muted">{label ? dayMonth(label, lang) : ''}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="font-mono-data text-xs text-txt-primary">
          <span
            className="mr-1.5 inline-block size-1.5 rounded-full"
            style={{ backgroundColor: p.dataKey === 'conciliados' ? '#16C784' : '#F04452' }}
          />
          {p.dataKey === 'conciliados' ? t('dash.reconciled') : t('dash.differences')} {p.value}
        </p>
      ))}
    </div>
  );
}

function ReconciliationChart() {
  const { t, lang } = useLanguage();
  const [period, setPeriod] = useState<7 | 30 | 90>(30);
  const data: TrendPoint[] = useMemo(() => getReconciliationTrend(period), [period]);

  return (
    <motion.section
      className="col-span-12 rounded-xl border border-hairline bg-elevated p-5 lg:col-span-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.15 }}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-[17px] font-semibold leading-6 text-txt-primary">{t('dash.trendTitle')}</h2>
          <p className="mt-0.5 text-xs text-txt-muted">{t('dash.trendCaption')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[11px] text-txt-muted">
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-brand" /> {t('dash.reconciled')}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-danger" /> {t('dash.differences')}
            </span>
          </div>
          <div className="flex h-7 items-center rounded-lg bg-inset p-0.5">
            {([7, 30, 90] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={cn(
                  'h-6 rounded-md px-2 text-[11px] font-semibold transition-all duration-180',
                  period === p ? 'border border-border-strong bg-overlay text-txt-primary' : 'text-txt-muted hover:text-txt-secondary',
                )}
              >
                {p}D
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
            <defs>
              <linearGradient id="gradBrand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#16C784" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#16C784" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="fecha"
              tickFormatter={(iso: string) => dayMonth(iso, lang)}
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'Inter' }}
              tickLine={false}
              axisLine={false}
              minTickGap={28}
            />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'Inter' }} tickLine={false} axisLine={false} />
            <Tooltip content={<TrendTooltip lang={lang} />} cursor={{ stroke: 'var(--sync)', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area
              type="monotone"
              dataKey="conciliados"
              stroke="#16C784"
              strokeWidth={2}
              fill="url(#gradBrand)"
              isAnimationActive
              animationDuration={700}
              animationEasing="ease-out"
              dot={false}
              activeDot={{ r: 3, fill: '#16C784', stroke: '#06090E' }}
            />
            <Area
              type="monotone"
              dataKey="diferencias"
              stroke="#F04452"
              strokeWidth={2}
              strokeDasharray="6 4"
              fill="none"
              isAnimationActive
              animationDuration={700}
              animationEasing="ease-out"
              dot={false}
              activeDot={{ r: 3, fill: '#F04452', stroke: '#06090E' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.section>
  );
}

/* ==================== [C2] Module health donut ==================== */

function ModuleHealthDonut() {
  const { t, formatPercent } = useLanguage();
  const navigate = useNavigate();
  const health = useMemo(() => getModuleHealth(), []);
  const total = health.reduce((acc, h) => acc + h.ok, 0);
  const animatedTotal = Math.round(useCountUp(total));

  const moduleName = (m: string) => t(moduleLabels[m as keyof typeof moduleLabels] ?? 'modules.tesoreria');

  return (
    <motion.section
      className="col-span-12 rounded-xl border border-hairline bg-elevated p-5 lg:col-span-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <h2 className="font-display text-[17px] font-semibold leading-6 text-txt-primary">{t('dash.healthTitle')}</h2>
      <div className="relative mx-auto mt-2 h-[190px] w-full max-w-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={health}
              dataKey="ok"
              nameKey="modulo"
              innerRadius="62%"
              outerRadius="92%"
              paddingAngle={2}
              strokeWidth={0}
              isAnimationActive
              animationDuration={800}
              animationBegin={200}
            >
              {health.map((h, i) => (
                <Cell key={h.modulo} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="tabular font-display text-xl font-semibold text-txt-primary">{animatedTotal}</p>
          <p className="text-[11px] text-txt-muted">
            {t('dash.jobs')} · {t('dash.healthToday')}
          </p>
        </div>
      </div>
      <ul className="mt-3 flex flex-col">
        {health.map((h, i) => (
          <li key={h.modulo}>
            <button
              type="button"
              onClick={() => navigate('/sync-center')}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-[var(--bg-hover)]"
            >
              <span className="size-2 rounded-full" style={{ backgroundColor: CHART_PALETTE[i % CHART_PALETTE.length] }} />
              <span className="flex-1 text-[13px] text-txt-secondary">{moduleName(h.modulo)}</span>
              <span className="tabular font-mono-data text-xs text-txt-primary">{formatPercent(h.tasaExito)}</span>
            </button>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}

/* ==================== [D1] Live sync feed ==================== */

const FEED_ICON: Record<SyncJob['estado'], { icon: typeof CheckCircle2; color: string; spin?: boolean }> = {
  completado: { icon: CheckCircle2, color: 'var(--brand)' },
  pendiente: { icon: Clock3, color: 'var(--warning)' },
  error: { icon: AlertTriangle, color: 'var(--danger)' },
  en_proceso: { icon: Loader2, color: 'var(--sync)', spin: true },
};

function LiveFeed() {
  const { t, lang, formatNumber } = useLanguage();
  const navigate = useNavigate();
  const feed = useMemo(() => getLiveFeed(6), []);

  return (
    <motion.section
      className="col-span-12 flex flex-col rounded-xl border border-hairline bg-elevated p-5 lg:col-span-7"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.25 }}
    >
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-display text-[17px] font-semibold leading-6 text-txt-primary">{t('dash.feedTitle')}</h2>
        <span className="flex items-center gap-2">
          <LiveDot />
          <span className="text-overline" style={{ color: 'var(--sync)' }}>
            {t('dash.live')}
          </span>
        </span>
      </div>
      <ul className="flex-1 divide-y divide-hairline">
        <AnimatePresence initial={false}>
          {feed.map((job, i) => {
            const meta = FEED_ICON[job.estado];
            const Icon = meta.icon;
            const dur = getJobDurationSec(job);
            return (
              <motion.li
                key={job.id}
                className="flex h-11 items-center gap-3"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.05 + i * 0.03, ease: [0.16, 1, 0.3, 1] }}
              >
                <Icon
                  className={cn('size-4 shrink-0', meta.spin && 'animate-spin')}
                  style={{ color: meta.color }}
                  strokeWidth={1.75}
                />
                <span className="min-w-0 flex-1 truncate text-[13px] text-txt-primary">{job.mensaje ?? job.modulo}</span>
                <SyncPair direction={job.direccion} className="hidden xl:inline-flex" />
                {dur !== null && (
                  <span className="tabular w-12 text-right font-mono-data text-xs text-txt-muted">
                    {formatNumber(dur, 1)} s
                  </span>
                )}
                <span className="w-[74px] text-right text-xs text-txt-muted">
                  {formatRelative(job.started_at, lang, REFERENCE_NOW)}
                </span>
                <StatusBadge status={job.estado} hideIcon className="w-[104px] justify-center" />
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
      <button
        type="button"
        onClick={() => navigate('/sync-center')}
        className="mt-3 border-t border-hairline pt-3 text-left text-[13px] font-medium transition-colors hover:text-txt-primary"
        style={{ color: 'var(--sync)' }}
      >
        {t('dash.viewAllSync')} →
      </button>
    </motion.section>
  );
}

/* ==================== [D2] Containers in transit ==================== */

function MiniStepper({ estado }: { estado: Contenedor['estado'] }) {
  const current = LIFECYCLE.indexOf(estado);
  return (
    <span className="flex items-center gap-1">
      {LIFECYCLE.map((step, i) => (
        <span key={step} className="flex items-center gap-1">
          {i > 0 && <span className="h-px w-2 bg-border-strong" />}
          {i < current ? (
            <span className="flex size-2 items-center justify-center rounded-full bg-brand" />
          ) : i === current ? (
            estado === 'en_transito' ? (
              <LiveDot />
            ) : (
              <span
                className="flex size-2 items-center justify-center rounded-full bg-brand"
                style={{ boxShadow: '0 0 8px 1px rgba(22,199,132,0.55)' }}
              />
            )
          ) : (
            <span className="size-2 rounded-full border border-border-strong" />
          )}
        </span>
      ))}
    </span>
  );
}

function ContainersPanel() {
  const { t, lang, formatNumber } = useLanguage();
  const navigate = useNavigate();
  const containers = useMemo(() => getContenedoresActivos().slice(0, 5), []);

  return (
    <motion.section
      className="col-span-12 rounded-xl border border-hairline bg-elevated p-5 lg:col-span-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-[17px] font-semibold leading-6 text-txt-primary">{t('dash.containersTitle')}</h2>
        <button
          type="button"
          onClick={() => navigate('/comercio-exterior')}
          className="text-[13px] font-medium transition-colors hover:text-txt-primary"
          style={{ color: 'var(--sync)' }}
        >
          {t('action.viewModule')} →
        </button>
      </div>
      <ul className="flex flex-col gap-2">
        {containers.map((c, i) => (
          <motion.li
            key={c.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              type="button"
              onClick={() => navigate('/comercio-exterior')}
              className="flex w-full items-center gap-3 rounded-lg border border-hairline bg-surface p-3 text-left transition-colors duration-180 hover:border-border-strong"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono-data text-[13px] font-medium text-txt-primary">{c.numero_contenedor}</span>
                  {c.estado === 'arribado' && <Check className="size-3.5 text-brand" strokeWidth={2.5} />}
                </div>
                <p className="mt-0.5 truncate text-xs text-txt-secondary">
                  {c.producto ?? c.codigo_producto}
                  {typeof c.cantidad === 'number' && !c.producto?.includes('unds') && (
                    <span className="tabular text-txt-muted">
                      {' '}
                      · {formatNumber(c.cantidad)} {t('dash.units')}
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-[11px] text-txt-muted">
                  {c.origen} → {c.puerto}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                {c.fecha_arribo && (
                  <span className="rounded-md bg-sync-dim px-1.5 py-0.5 text-[11px] font-semibold" style={{ color: 'var(--sync)' }}>
                    {t('dash.eta')} {dayMonth(c.fecha_arribo, lang)}
                  </span>
                )}
                <MiniStepper estado={c.estado} />
              </div>
            </button>
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
}

/* ==================== [E] Differences alert strip ==================== */

function DifferencesStrip() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const open = useMemo(() => getReconciliacionPendiente(), []);

  if (open.length === 0) {
    return (
      <motion.section
        className="col-span-12 flex items-center gap-3 rounded-[10px] border-l-[3px] border-brand bg-brand-dim px-[18px] py-3.5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.35 }}
      >
        <CheckCircle2 className="size-4 text-brand" strokeWidth={1.75} />
        <p className="text-sm font-medium text-txt-primary">{t('dash.noAlerts')}</p>
      </motion.section>
    );
  }

  return (
    <motion.section
      className="col-span-12 flex flex-wrap items-center gap-3 rounded-[10px] border-l-[3px] border-warn bg-warn-dim px-[18px] py-3.5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.35 }}
    >
      <motion.span
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        className="flex"
      >
        <GitCompareArrows className="size-4 text-warn" strokeWidth={1.75} />
      </motion.span>
      <p className="text-sm font-medium text-txt-primary">
        <span className="tabular mr-1 font-semibold">{open.length}</span>
        {t('dash.alertsNeedReview')}
      </p>
      <span className="hidden text-txt-muted sm:inline">·</span>
      <div className="flex flex-wrap items-center gap-1.5">
        {open.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => navigate('/sync-center')}
            className="rounded-md border border-warn/30 bg-canvas/40 px-2 py-0.5 font-mono-data text-[11px] text-txt-secondary transition-colors hover:border-warn hover:text-txt-primary"
          >
            {r.concepto.split(' ').pop()} <span className="text-txt-muted">({t(moduleLabels[r.modulo as keyof typeof moduleLabels] ?? 'modules.tesoreria')})</span>
          </button>
        ))}
      </div>
      <div className="flex-1" />
      <button
        type="button"
        onClick={() => navigate('/sync-center')}
        className="h-8 rounded-lg border border-border-strong px-3 text-[13px] font-medium text-txt-secondary transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary"
      >
        {t('dash.reviewInSync')}
      </button>
    </motion.section>
  );
}

/* ==================== Page ==================== */

const SPARKS = {
  brand: [88, 92, 90, 97, 104, 99, 108, 112, 106, 118, 121, 126, 134, 142],
  warn: [14, 13, 15, 12, 11, 13, 10, 12, 9, 10, 8, 9, 8, 7],
  danger: [1, 2, 1, 3, 2, 2, 3, 2, 4, 3, 2, 3, 2, 3],
  sync: [2, 3, 2, 4, 3, 5, 4, 6, 5, 4, 6, 5, 6, 5],
};

export default function Home() {
  const { t, lang, formatDate } = useLanguage();
  const navigate = useNavigate();
  const kpis = useMemo(() => getKpiSummary(), []);
  const [modalOpen, setModalOpen] = useState(false);
  const [syncStep, setSyncStep] = useState<number | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  const caption = `${formatDate(REFERENCE_NOW, 'long')} · ${t('dash.lastGlobalSync')} ${formatRelative(
    new Date(REFERENCE_NOW.getTime() - 4 * 60_000),
    lang,
    REFERENCE_NOW,
  )}`;

  const startSync = () => {
    setModalOpen(false);
    setSyncStep(0);
    const total = 7;
    let step = 0;
    const timer = window.setInterval(() => {
      step += 1;
      if (step >= total) {
        window.clearInterval(timer);
        setSyncStep(null);
        setToastVisible(true);
        window.setTimeout(() => setToastVisible(false), 4500);
      } else {
        setSyncStep(step);
      }
    }, 420);
  };

  const kpiCards = [
    {
      label: t('kpi.docsSyncedToday'),
      value: kpis.docsSincronizadosHoy,
      delta: { text: `+12 % ${t('kpi.vsYesterday')}`, tone: 'positive' as const },
      spark: { data: SPARKS.brand, color: 'var(--brand)' },
      to: '/sync-center',
    },
    {
      label: t('kpi.pendingSyncs'),
      value: kpis.pendientes,
      delta: { text: `−3 ${t('kpi.vsYesterday')}`, tone: 'neutral' as const },
      spark: { data: SPARKS.warn, color: 'var(--warning)' },
      to: '/sync-center',
    },
    {
      label: t('kpi.mismatches'),
      value: kpis.diferencias,
      delta: { text: `+1 ${t('kpi.vsYesterday')}`, tone: 'negative' as const },
      spark: { data: SPARKS.danger, color: 'var(--danger)' },
      to: '/sync-center',
    },
    {
      label: t('kpi.containersInTransit'),
      value: kpis.contenedoresEnTransito,
      delta: { text: `2 ${t('kpi.arriveThisWeek')}`, tone: 'neutral' as const },
      spark: { data: SPARKS.sync, color: 'var(--sync)' },
      to: '/comercio-exterior',
    },
  ];

  return (
    <motion.div
      className="flex flex-col gap-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* [A] Page header */}
      <PageHeader
        title={t('dash.title')}
        caption={caption}
        actions={
          <>
            <button
              type="button"
              className="flex h-9 items-center gap-2 rounded-lg border border-border-strong px-4 text-sm font-medium text-txt-secondary transition-colors duration-180 hover:bg-[var(--bg-hover)] hover:text-txt-primary"
            >
              <Download className="size-4" strokeWidth={1.75} />
              {t('dash.exportSummary')}
            </button>
            <button
              type="button"
              onClick={() => syncStep === null && setModalOpen(true)}
              disabled={syncStep !== null}
              className="flex h-9 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-canvas transition-all duration-100 ease-standard hover:bg-brand-hover active:scale-[0.97] disabled:opacity-90"
              style={{ boxShadow: '0 0 0 1px rgba(22,199,132,.35), 0 4px 24px -4px rgba(22,199,132,.35)' }}
            >
              {syncStep === null ? (
                <RefreshCw className="size-4" strokeWidth={1.75} />
              ) : (
                <Loader2 className="size-4 animate-spin" strokeWidth={1.75} />
              )}
              {syncStep === null ? t('dash.syncAll') : `${t('dash.syncing')} ${syncStep}/7`}
            </button>
          </>
        }
      />

      {/* [B] KPI row */}
      <div className="grid grid-cols-12 gap-5">
        {kpiCards.map((k, i) => (
          <motion.div
            key={k.label}
            className="col-span-12 sm:col-span-6 lg:col-span-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, delay: 0.05 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
          >
            <KpiCard
              label={k.label}
              value={k.value}
              delta={k.delta}
              spark={k.spark}
              onClick={() => navigate(k.to)}
              className="h-full"
            />
          </motion.div>
        ))}
      </div>

      {/* [C] Charts row */}
      <div className="grid grid-cols-12 gap-5">
        <ReconciliationChart />
        <ModuleHealthDonut />
      </div>

      {/* [D] Feed + containers row */}
      <div className="grid grid-cols-12 gap-5">
        <LiveFeed />
        <ContainersPanel />
      </div>

      {/* [E] Differences alert strip */}
      <div className="grid grid-cols-12">
        <DifferencesStrip />
      </div>

      <ConfirmSyncModal open={modalOpen} onClose={() => setModalOpen(false)} onConfirm={startSync} />
      <SuccessToast visible={toastVisible} text={`${t('dash.syncDone')} · 142 ${t('dash.docsCount')}`} />
    </motion.div>
  );
}
