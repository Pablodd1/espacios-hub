import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Anchor,
  CheckCircle2,
  ChevronRight,
  Download,
  Eye,
  FileSpreadsheet,
  PackageCheck,
  Plus,
  Search,
  Ship,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import ContainerDrawer from '@/components/comex/ContainerDrawer';
import DistributionChips from '@/components/comex/DistributionChips';
import LifecycleStepper from '@/components/comex/LifecycleStepper';
import { LIFECYCLE_ORDER, STAGE_LABEL_KEYS } from '@/components/comex/lifecycle';
import NewContainerModal from '@/components/comex/NewContainerModal';
import type { NewContainerForm } from '@/components/comex/NewContainerModal';
import DataTable from '@/components/DataTable';
import type { ColumnDef } from '@/components/DataTable';
import PageHeader from '@/components/PageHeader';
import { useCountUp } from '@/hooks/use-count-up';
import { useLanguage } from '@/i18n';
import type { Lang } from '@/i18n';
import { contenedores as seedContenedores, REFERENCE_NOW } from '@/lib/data';
import type { Contenedor, ContenedorEstado } from '@/lib/types';
import { cn } from '@/lib/utils';

const dayMonth = (iso: string, lang: Lang) =>
  new Intl.DateTimeFormat(lang === 'es' ? 'es-CO' : 'en-US', { day: 'numeric', month: 'short' }).format(
    new Date(`${iso}T12:00:00-05:00`),
  );

const sectionVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

/* ==================== [B] Trade-lane hero ==================== */

interface VesselChip {
  id: string;
  label: string;
  top: string;
  right: string;
}

function HeroPanel({ containers }: { containers: Contenedor[] }) {
  const { t, lang } = useLanguage();
  const inTransit = containers.filter((c) => c.estado === 'en_transito');
  const weekAgo = new Date(REFERENCE_NOW.getTime() - 7 * 86_400_000);
  const arrivedWeek = containers.filter(
    (c) => c.estado !== 'en_transito' && c.fecha_arribo !== null && new Date(c.fecha_arribo) >= weekAgo,
  ).length;
  const deliveredQtr = containers.filter((c) => c.estado === 'entregado').length;

  const vessels: VesselChip[] = useMemo(() => {
    const sorted = [...inTransit].sort((a, b) => (a.fecha_arribo ?? '').localeCompare(b.fecha_arribo ?? ''));
    const spots = [
      { top: '16%', right: '26%' },
      { top: '38%', right: '12%' },
      { top: '60%', right: '30%' },
    ];
    return sorted.slice(0, 3).map((c, i) => ({
      id: c.id,
      label: `${c.numero_contenedor} · ${t('comex.vesselEta').replace('{date}', c.fecha_arribo ? dayMonth(c.fecha_arribo, lang) : '—')}`,
      ...spots[i % spots.length],
    }));
  }, [inTransit, lang, t]);

  const stats = [
    { value: inTransit.length, label: t('comex.heroInTransit'), color: 'var(--sync)', live: true },
    { value: arrivedWeek, label: t('comex.heroArrivedWeek'), color: 'var(--brand)', live: false },
    { value: deliveredQtr, label: t('comex.heroDeliveredQtr'), color: 'var(--text-muted)', live: false },
  ];

  return (
    <section className="relative h-[300px] overflow-hidden rounded-xl border border-hairline bg-elevated">
      <motion.img
        src="/comex-map.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(90deg, rgba(6,9,14,0.85) 0%, transparent 60%)' }}
        aria-hidden
      />
      {/* Left overlay stats */}
      <div className="absolute inset-y-0 left-0 flex flex-col justify-center gap-5 px-7">
        <p className="text-overline text-txt-muted">{t('comex.heroOverline')}</p>
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            {s.live ? (
              <span className="relative inline-flex size-2">
                <span
                  className="absolute inline-flex size-2 rounded-full motion-safe:animate-[live-pulse_2s_ease-out_infinite]"
                  style={{ backgroundColor: s.color, boxShadow: `0 0 12px 2px ${s.color}` }}
                />
                <span className="relative inline-flex size-2 rounded-full" style={{ backgroundColor: s.color }} />
              </span>
            ) : (
              <span className="size-2 rounded-full" style={{ backgroundColor: s.color }} />
            )}
            <span className="tabular font-display text-[22px] font-semibold leading-7 tracking-[-0.015em] text-txt-primary">
              {s.value}
            </span>
            <span className="text-[13px] text-txt-secondary">{s.label}</span>
          </motion.div>
        ))}
      </div>
      {/* Floating vessel chips */}
      {vessels.map((v, i) => (
        <motion.div
          key={v.id}
          className="absolute"
          style={{ top: v.top, right: v.right }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 + i * 0.12 }}
        >
          <motion.div
            className="flex items-center gap-2 rounded-full border border-border-strong bg-[rgba(12,16,23,0.85)] px-3 py-1.5 backdrop-blur-sm"
            animate={{ y: [0, -4, 0, 4, 0] }}
            transition={{ duration: 6, repeat: Infinity, delay: i * 1.4, ease: 'easeInOut' }}
          >
            <span className="relative inline-flex size-1.5">
              <span
                className="absolute inline-flex size-1.5 rounded-full motion-safe:animate-[live-pulse_2s_ease-out_infinite]"
                style={{ backgroundColor: 'var(--sync)' }}
              />
              <span className="relative inline-flex size-1.5 rounded-full" style={{ backgroundColor: 'var(--sync)' }} />
            </span>
            <span className="whitespace-nowrap font-mono-data text-[11px] text-txt-secondary">{v.label}</span>
          </motion.div>
        </motion.div>
      ))}
    </section>
  );
}

/* ==================== [C] Lifecycle pipeline strip ==================== */

const STAGE_META: Record<ContenedorEstado, { icon: LucideIcon; accent: string; dim: string }> = {
  en_transito: { icon: Ship, accent: 'var(--sync)', dim: 'var(--sync-dim)' },
  arribado: { icon: Anchor, accent: 'var(--violet)', dim: 'rgba(139,92,246,0.12)' },
  levante: { icon: PackageCheck, accent: 'var(--warning)', dim: 'var(--warning-dim)' },
  entregado: { icon: CheckCircle2, accent: 'var(--brand)', dim: 'var(--brand-dim)' },
};

function StageCard({
  stage,
  count,
  active,
  onClick,
}: {
  stage: ContenedorEstado;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  const { t } = useLanguage();
  const animated = useCountUp(count, 700);
  const meta = STAGE_META[stage];
  const Icon = meta.icon;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="flex flex-1 items-center gap-3 rounded-xl border p-4 text-left transition-[border-color,background-color] duration-200 ease-standard"
      style={{
        borderColor: active ? 'var(--border-strong)' : 'var(--border-hairline)',
        backgroundColor: active ? meta.dim : 'var(--bg-elevated)',
      }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: meta.dim }}>
        <Icon className="size-4" style={{ color: meta.accent }} strokeWidth={1.75} />
      </span>
      <span className="min-w-0">
        <span className="tabular block font-display text-[22px] font-semibold leading-7 text-txt-primary">
          {Math.round(animated)}
        </span>
        <span className="block truncate text-xs text-txt-secondary">{t(STAGE_LABEL_KEYS[stage])}</span>
      </span>
    </motion.button>
  );
}

function PipelineStrip({
  containers,
  filter,
  onChange,
}: {
  containers: Contenedor[];
  filter: ContenedorEstado | null;
  onChange: (s: ContenedorEstado | null) => void;
}) {
  const { t } = useLanguage();
  const counts = useMemo(() => {
    const map = new Map<ContenedorEstado, number>();
    for (const s of LIFECYCLE_ORDER) map.set(s, containers.filter((c) => c.estado === s).length);
    return map;
  }, [containers]);

  return (
    <section className="flex items-stretch gap-2" aria-label={t('comex.colStage')}>
      <button
        type="button"
        onClick={() => onChange(null)}
        aria-pressed={filter === null}
        className={cn(
          'flex items-center rounded-xl border px-4 text-[13px] font-medium transition-colors duration-200',
          filter === null
            ? 'border-border-strong bg-overlay text-txt-primary'
            : 'border-hairline bg-elevated text-txt-muted hover:text-txt-secondary',
        )}
      >
        {t('common.all')}
      </button>
      {LIFECYCLE_ORDER.map((stage, i) => (
        <div key={stage} className="flex flex-1 items-center gap-2">
          {i > 0 && (
            <motion.span
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
              className="motion-reduce:hidden"
            >
              <ChevronRight className="size-4 shrink-0 text-txt-muted" strokeWidth={1.75} />
            </motion.span>
          )}
          <StageCard
            stage={stage}
            count={counts.get(stage) ?? 0}
            active={filter === stage}
            onClick={() => onChange(filter === stage ? null : stage)}
          />
        </div>
      ))}
    </section>
  );
}

/* ==================== Toast ==================== */

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

/* ==================== Page ==================== */

const PORTS = ['Buenaventura', 'Cartagena'];

export default function ComercioExterior() {
  const { t, lang } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [containers, setContainers] = useState<Contenedor[]>(seedContenedores);
  const [stageFilter, setStageFilter] = useState<ContenedorEstado | null>(null);
  const [portFilter, setPortFilter] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(null), 4500);
  };

  // Deep link: /comercio-exterior?cont=MSKU-882345-1 opens the container drawer
  useEffect(() => {
    const num = searchParams.get('cont');
    if (!num) return;
    const found = containers.find((c) => c.numero_contenedor === num);
    if (found) setSelectedId(found.id);
    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return containers.filter((c) => {
      if (stageFilter && c.estado !== stageFilter) return false;
      if (portFilter && c.puerto !== portFilter) return false;
      if (q) {
        const hay = `${c.numero_contenedor} ${c.bl ?? ''} ${c.producto ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [containers, stageFilter, portFilter, query]);

  const selected = containers.find((c) => c.id === selectedId) ?? null;

  const handleAdvance = (c: Contenedor) => {
    const idx = LIFECYCLE_ORDER.indexOf(c.estado);
    const next = LIFECYCLE_ORDER[idx + 1];
    if (!next) return;
    setContainers((prev) => prev.map((row) => (row.id === c.id ? { ...row, estado: next } : row)));
    showToast(t('comex.stageUpdated').replace('{stage}', t(STAGE_LABEL_KEYS[next])));
  };

  const handleRegistered = (form: NewContainerForm) => {
    const nuevo: Contenedor = {
      id: `con-new-${Date.now()}`,
      numero_contenedor: form.numero.trim(),
      bl: form.bl.trim() || null,
      puerto: form.puerto,
      origen: form.origen,
      codigo_producto: form.codigo.trim() || null,
      producto: form.producto.trim() || null,
      cantidad: form.cantidad,
      estado: 'en_transito',
      fecha_zarpe: form.fechaZarpe || null,
      fecha_arribo: form.eta || null,
      fecha_levante: null,
      recibido_fisico: false,
      comision_especial: null,
      created_at: REFERENCE_NOW.toISOString(),
    };
    // New row animates into the table top
    setContainers((prev) => [nuevo, ...prev]);
    setModalOpen(false);
    showToast(t('comex.registerSuccess').replace('{num}', nuevo.numero_contenedor));
  };

  const columns: ColumnDef<Contenedor>[] = [
    {
      key: 'numero',
      header: t('comex.colContainer'),
      mono: true,
      cell: (row) => <span className="font-semibold">{row.numero_contenedor}</span>,
    },
    { key: 'bl', header: t('comex.colBl'), mono: true, cell: (row) => row.bl ?? '—' },
    {
      key: 'ruta',
      header: t('comex.colRoute'),
      cell: (row) => (
        <span className="inline-flex items-center gap-1.5">
          <Ship className="size-3.5 text-txt-muted" strokeWidth={1.75} />
          {row.origen ?? '—'} → {row.puerto ?? '—'}
        </span>
      ),
    },
    { key: 'producto', header: t('comex.colProduct'), cell: (row) => row.producto ?? '—' },
    {
      key: 'cantidad',
      header: t('comex.colQty'),
      numeric: true,
      mono: true,
      cell: (row) => (row.cantidad !== null ? row.cantidad.toLocaleString(lang === 'es' ? 'es-CO' : 'en-US') : '—'),
    },
    {
      key: 'eta',
      header: t('comex.colEta'),
      cell: (row) => (row.fecha_arribo ? dayMonth(row.fecha_arribo, lang) : '—'),
    },
    {
      key: 'etapa',
      header: t('comex.colStage'),
      cell: (row) => <LifecycleStepper estado={row.estado} />,
    },
    {
      key: 'dist',
      header: t('comex.distributed'),
      cell: () => <DistributionChips />,
    },
    {
      key: 'acciones',
      header: t('comex.colActions'),
      cell: (row) => (
        <button
          type="button"
          aria-label={`${t('action.viewDetail')} ${row.numero_contenedor}`}
          className="flex size-7 items-center justify-center rounded-md text-txt-muted opacity-0 transition-all duration-120 hover:bg-[var(--bg-hover)] hover:text-txt-primary [tr:hover_&]:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedId(row.id);
          }}
        >
          <Eye className="size-4" strokeWidth={1.75} />
        </button>
      ),
    },
  ];

  const toolbar = (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-txt-muted" strokeWidth={1.75} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('comex.search')}
          className="h-9 w-[300px] rounded-lg border border-hairline bg-inset pl-9 pr-8 text-[13px] text-txt-primary placeholder:text-txt-muted focus:border-border-strong focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label={t('action.clear')}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-txt-muted hover:text-txt-primary"
          >
            <X className="size-3.5" strokeWidth={2} />
          </button>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        {PORTS.map((port) => (
          <button
            key={port}
            type="button"
            onClick={() => setPortFilter((p) => (p === port ? null : port))}
            aria-pressed={portFilter === port}
            className={cn(
              'h-8 rounded-lg border px-3 text-xs font-medium transition-colors duration-180',
              portFilter === port
                ? 'border-border-strong bg-overlay text-txt-primary'
                : 'border-hairline bg-inset text-txt-muted hover:text-txt-secondary',
            )}
          >
            {port}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => showToast(t('logi.exportQueued'))}
        className="ml-auto inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-txt-secondary transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary"
      >
        <Download className="size-4" strokeWidth={1.75} />
        {t('action.export')}
      </button>
    </div>
  );

  return (
    <motion.div
      className="flex flex-col gap-6"
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
    >
      {/* [A] Header */}
      <motion.div variants={sectionVariants}>
        <PageHeader
          title={t('comex.title')}
          caption={t('comex.caption')}
          actions={
            <>
              <button
                type="button"
                onClick={() => showToast(t('comex.importQueued'))}
                className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-txt-secondary transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary"
              >
                <FileSpreadsheet className="size-4" strokeWidth={1.75} />
                {t('comex.importExcel')}
              </button>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-canvas transition-all duration-100 ease-standard hover:bg-brand-hover active:scale-[0.97]"
                style={{ boxShadow: '0 0 0 1px rgba(22,199,132,.35), 0 4px 24px -4px rgba(22,199,132,.35)' }}
              >
                <Plus className="size-4" strokeWidth={2} />
                {t('comex.new')}
              </button>
            </>
          }
        />
      </motion.div>

      {/* [B] Trade-lane hero */}
      <motion.div variants={sectionVariants}>
        <HeroPanel containers={containers} />
      </motion.div>

      {/* [C] Lifecycle pipeline strip */}
      <motion.div variants={sectionVariants}>
        <PipelineStrip containers={containers} filter={stageFilter} onChange={setStageFilter} />
      </motion.div>

      {/* [D] Toolbar + [E] Containers table */}
      <motion.div variants={sectionVariants}>
        <DataTable
          columns={columns}
          data={filtered}
          rowKey={(row) => row.id}
          onRowClick={(row) => setSelectedId(row.id)}
          toolbar={toolbar}
          emptyTitle={t('comex.emptyStage')}
          emptyCaption={t('comex.emptyStageCaption')}
        />
      </motion.div>

      {/* [F] Container drawer */}
      <ContainerDrawer container={selected} onClose={() => setSelectedId(null)} onAdvanceStage={handleAdvance} />

      {/* [G] New container modal */}
      <NewContainerModal open={modalOpen} onClose={() => setModalOpen(false)} onRegistered={handleRegistered} />

      <SuccessToast visible={toast !== null} text={toast ?? ''} />
    </motion.div>
  );
}
