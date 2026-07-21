import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Download, Eye, Loader2, RefreshCw } from 'lucide-react';
import DataTable from '@/components/DataTable';
import type { ColumnDef } from '@/components/DataTable';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import SystemChip from '@/components/SystemChip';
import ChainTable from '@/components/logistica/ChainTable';
import CompraDrawer from '@/components/logistica/CompraDrawer';
import CumplidosTable from '@/components/logistica/CumplidosTable';
import GapPanel from '@/components/logistica/GapPanel';
import {
  buildCumplidos,
  buildGap1,
  buildGap2,
  buildPipeline,
  comprasSyncHoy,
  itemsOf,
} from '@/components/logistica/logistica-vm';
import type { Gap1Row, Gap2Row } from '@/components/logistica/logistica-vm';
import { useCountUp } from '@/hooks/use-count-up';
import { useLanguage } from '@/i18n';
import { documentos, getTercero } from '@/lib/data';
import type { Documento } from '@/lib/types';
import { cn } from '@/lib/utils';

const sectionVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

/* ==================== [A] KPI chips ==================== */

type ChipTone = 'brand' | 'warning' | 'danger';

const TONE_COLOR: Record<ChipTone, string> = {
  brand: 'var(--brand)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
};

function KpiChip({ label, value, tone, pulse = false }: { label: string; value: number; tone: ChipTone; pulse?: boolean }) {
  const animated = useCountUp(value, 700);
  const color = TONE_COLOR[tone];
  return (
    <motion.div
      className="flex items-center gap-2.5 rounded-xl border border-hairline bg-elevated px-4 py-2.5"
      animate={pulse && value > 0 ? { scale: [1, 1.02, 1] } : undefined}
      transition={pulse && value > 0 ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      <span className="relative inline-flex size-2">
        {pulse && value > 0 && (
          <span
            className="absolute inline-flex size-2 rounded-full motion-safe:animate-[live-pulse_2s_ease-out_infinite]"
            style={{ backgroundColor: color }}
          />
        )}
        <span className="relative inline-flex size-2 rounded-full" style={{ backgroundColor: color }} />
      </span>
      <div>
        <p className="tabular font-display text-[20px] font-semibold leading-6 text-txt-primary">{Math.round(animated)}</p>
        <p className="max-w-[150px] truncate text-[11px] text-txt-muted">{label}</p>
      </div>
    </motion.div>
  );
}

/* ==================== Section header ==================== */

function SectionHeader({ title, caption, action }: { title: string; caption?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-[17px] font-semibold leading-6 tracking-[-0.01em] text-txt-primary">{title}</h2>
        {caption && <p className="mt-1 text-[13px] text-txt-muted">{caption}</p>}
      </div>
      {action}
    </div>
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

/* ==================== Gap rows ==================== */

function DaysBadge({ days }: { days: number }) {
  const { t, formatNumber } = useLanguage();
  const danger = days > 15;
  return (
    <span className="relative inline-flex">
      <span
        className={cn(
          'tabular inline-flex h-[22px] items-center rounded-md px-2 text-xs font-semibold',
          danger && 'motion-safe:animate-pulse',
        )}
        style={{
          backgroundColor: danger ? 'var(--danger-dim)' : 'var(--warning-dim)',
          color: danger ? 'var(--danger)' : 'var(--warning)',
        }}
      >
        {t('logi.daysShort').replace('{d}', formatNumber(days))}
      </span>
    </span>
  );
}

function Gap1RowView({ row, index, onView }: { row: Gap1Row; index: number; onView: (row: Gap1Row) => void }) {
  const { t, formatCOPCompact } = useLanguage();
  return (
    <motion.div
      className="group flex h-12 items-center gap-3 rounded-lg px-3 transition-colors hover:bg-[var(--bg-hover)]"
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.035, 0.5), ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="w-20 shrink-0 font-mono-data text-[13px] font-semibold text-txt-primary">{row.numero}</span>
      <span className="min-w-0 flex-1 truncate text-[13px] text-txt-secondary">
        {row.proveedor || <span className="italic text-txt-muted">{t('logi.unmapped')}</span>}
      </span>
      <span className="tabular shrink-0 font-mono-data text-[13px] text-txt-primary">{formatCOPCompact(row.valor)}</span>
      {row.container ? (
        <button
          type="button"
          onClick={() => onView(row)}
          className="inline-flex h-[22px] shrink-0 items-center rounded-md border border-hairline bg-inset px-2 font-mono-data text-[11px] text-txt-secondary transition-colors hover:border-border-strong hover:text-txt-primary"
        >
          {row.container.numero_contenedor}
        </button>
      ) : (
        <span
          className="inline-flex h-[22px] shrink-0 items-center rounded-md border border-dashed px-2 text-[11px] font-medium"
          style={{ borderColor: 'rgba(240,68,82,0.5)', color: 'var(--danger)' }}
          title={t('logi.noContainer')}
        >
          —
        </span>
      )}
      <DaysBadge days={row.days} />
      <button
        type="button"
        onClick={() => onView(row)}
        className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-txt-muted opacity-0 transition-all duration-120 hover:bg-[var(--bg-hover)] hover:text-txt-primary group-hover:opacity-100"
      >
        {t('logi.viewContainer')}
      </button>
    </motion.div>
  );
}

function Gap2RowView({ row, index, onCreate }: { row: Gap2Row; index: number; onCreate: (row: Gap2Row) => void }) {
  const { t, formatCOPCompact } = useLanguage();
  const motivo = row.motivo === 'flete' ? t('logi.motivoFlete') : t('logi.motivoCumplido');
  return (
    <motion.div
      className="group flex h-12 items-center gap-3 rounded-lg px-3 transition-colors hover:bg-[var(--bg-hover)]"
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.035, 0.5), ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="w-20 shrink-0 font-mono-data text-[13px] font-semibold text-txt-primary">{row.ref}</span>
      <span className="min-w-0 flex-1 truncate text-[13px] text-txt-secondary">{row.cliente}</span>
      <span className="tabular shrink-0 font-mono-data text-[13px] text-txt-primary">{formatCOPCompact(row.valor)}</span>
      <DaysBadge days={row.days} />
      <span
        className="inline-flex h-[22px] shrink-0 items-center rounded-md px-2 text-[11px] font-semibold"
        style={
          row.motivo === 'flete'
            ? { backgroundColor: 'var(--danger-dim)', color: 'var(--danger)' }
            : { backgroundColor: 'var(--warning-dim)', color: 'var(--warning)' }
        }
      >
        {motivo}
      </span>
      <button
        type="button"
        onClick={() => onCreate(row)}
        className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-txt-muted opacity-0 transition-all duration-120 hover:bg-[var(--bg-hover)] hover:text-txt-primary group-hover:opacity-100"
      >
        {t('logi.createDispatch')}
      </button>
    </motion.div>
  );
}

/* ==================== Page ==================== */

export default function Logistica() {
  const { t, formatCOPCompact, formatDate, formatNumber } = useLanguage();
  const navigate = useNavigate();

  const gap1 = useMemo(() => buildGap1(), []);
  const gap2 = useMemo(() => buildGap2(), []);
  const cumplidos = useMemo(() => buildCumplidos(), []);
  const pipeline = useMemo(() => buildPipeline(), []);
  const compras = useMemo(
    () => documentos.filter((d) => d.tipo === 'compra').sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [],
  );

  const [scan1, setScan1] = useState(false);
  const [scan2, setScan2] = useState(false);
  const [cycle1, setCycle1] = useState(0);
  const [cycle2, setCycle2] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [drawerDoc, setDrawerDoc] = useState<Documento | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(null), 4500);
  };

  const recheck = (panel: 1 | 2) => {
    const setScan = panel === 1 ? setScan1 : setScan2;
    const setCycle = panel === 1 ? setCycle1 : setCycle2;
    setScan(true);
    window.setTimeout(() => {
      setScan(false);
      setCycle((c) => c + 1);
      showToast(t('logi.recheckDone'));
    }, 1200);
  };

  const syncPurchases = () => {
    if (syncing) return;
    setSyncing(true);
    window.setTimeout(() => {
      setSyncing(false);
      showToast(t('logi.purchasesSynced'));
    }, 1400);
  };

  const novedadCount = cumplidos.filter((c) => c.novedad !== 'none').length;
  const gap1Total = gap1.reduce((acc, r) => acc + r.valor, 0);
  const gap2Total = gap2.reduce((acc, r) => acc + r.valor, 0);

  const compraColumns: ColumnDef<Documento>[] = [
    {
      key: 'numero',
      header: t('logi.colCompra'),
      mono: true,
      cell: (row) => <span className="font-semibold">{row.numero}</span>,
    },
    { key: 'fecha', header: t('common.date'), cell: (row) => formatDate(row.fecha, 'day') },
    {
      key: 'proveedor',
      header: t('logi.colProveedor'),
      cell: (row) =>
        getTercero(row.tercero_id)?.nombre ?? <span className="italic text-txt-muted">{t('logi.unmapped')}</span>,
    },
    {
      key: 'items',
      header: t('logi.colItems'),
      numeric: true,
      mono: true,
      cell: (row) => formatNumber(itemsOf(row)),
    },
    {
      key: 'valor',
      header: t('common.amount'),
      numeric: true,
      mono: true,
      cell: (row) => formatCOPCompact(row.valor),
    },
    { key: 'siigo', header: t('sys.siigo'), cell: () => <SystemChip system="siigo" /> },
    {
      key: 'hgi',
      header: t('sys.hgi'),
      cell: (row) =>
        row.sincronizado_hgi ? (
          <SystemChip system="hgi" />
        ) : (
          <span
            className="inline-flex h-[22px] items-center rounded-md border border-dashed px-2 text-xs font-semibold text-txt-muted"
            style={{ borderColor: 'var(--border-strong)' }}
          >
            HGI
          </span>
        ),
    },
    { key: 'estado', header: t('common.status'), cell: (row) => <StatusBadge status={row.estado} /> },
    {
      key: 'acciones',
      header: t('comex.colActions'),
      cell: (row) => (
        <button
          type="button"
          aria-label={`${t('action.viewDetail')} ${row.numero}`}
          className="flex size-7 items-center justify-center rounded-md text-txt-muted opacity-0 transition-all duration-120 hover:bg-[var(--bg-hover)] hover:text-txt-primary [tr:hover_&]:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            setDrawerDoc(row);
          }}
        >
          <Eye className="size-4" strokeWidth={1.75} />
        </button>
      ),
    },
  ];

  return (
    <motion.div
      className="flex flex-col gap-8"
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
    >
      {/* [A] Header + KPI chips */}
      <motion.div variants={sectionVariants}>
        <PageHeader
          title={t('logi.title')}
          caption={t('logi.caption')}
          actions={
            <div className="flex flex-wrap items-stretch gap-2">
              <KpiChip label={t('logi.kpiCompras')} value={comprasSyncHoy()} tone="brand" />
              <KpiChip label={t('logi.kpiNovedad')} value={novedadCount} tone="warning" />
              <KpiChip label={t('logi.gap1')} value={gap1.length} tone="danger" pulse />
              <KpiChip label={t('logi.gap2')} value={gap2.length} tone="danger" pulse />
            </div>
          }
        />
      </motion.div>

      {/* [B] Gap dashboards */}
      <motion.div variants={sectionVariants} className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <GapPanel
          accent="warning"
          title={t('logi.gap1')}
          caption={t('logi.gap1Caption')}
          count={gap1.length}
          footer={t('logi.gap1Footer')
            .replace('{n}', formatNumber(gap1.length))
            .replace('{total}', formatCOPCompact(gap1Total))}
          onRecheck={() => recheck(1)}
          scanning={scan1}
          recheckLabel={t('logi.recheck')}
        >
          <div key={cycle1} className="flex flex-col">
            {gap1.map((row, i) => (
              <Gap1RowView
                key={row.id}
                row={row}
                index={i}
                onView={(r) =>
                  r.container
                    ? navigate(`/comercio-exterior?cont=${encodeURIComponent(r.container.numero_contenedor)}`)
                    : showToast(t('logi.noContainer'))
                }
              />
            ))}
          </div>
        </GapPanel>

        <GapPanel
          accent="danger"
          title={t('logi.gap2')}
          caption={t('logi.gap2Caption')}
          count={gap2.length}
          footer={t('logi.gap2Footer')
            .replace('{n}', formatNumber(gap2.length))
            .replace('{total}', formatCOPCompact(gap2Total))}
          onRecheck={() => recheck(2)}
          scanning={scan2}
          recheckLabel={t('logi.recheck')}
        >
          <div key={cycle2} className="flex flex-col">
            {gap2.map((row, i) => (
              <Gap2RowView key={row.id} row={row} index={i} onCreate={(r) => showToast(t('logi.dispatchCreated').replace('{ref}', r.ref))} />
            ))}
          </div>
        </GapPanel>
      </motion.div>

      {/* [C] Compras sync table */}
      <motion.section variants={sectionVariants}>
        <SectionHeader
          title={t('logi.compras')}
          caption={t('logi.comprasCaption')}
          action={
            <button
              type="button"
              onClick={syncPurchases}
              disabled={syncing}
              className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-txt-secondary transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary disabled:opacity-60"
            >
              {syncing ? <Loader2 className="size-4 animate-spin" strokeWidth={1.75} /> : <RefreshCw className="size-4" strokeWidth={1.75} />}
              {t('logi.syncPurchases')}
            </button>
          }
        />
        <DataTable
          columns={compraColumns}
          data={compras}
          rowKey={(row) => row.id}
          onRowClick={(row) => setDrawerDoc(row)}
          pageSize={10}
        />
      </motion.section>

      {/* [D] Cumplidos con novedades */}
      <motion.section variants={sectionVariants}>
        <SectionHeader title={t('logi.receipts')} caption={t('logi.receiptsCaption')} />
        <CumplidosTable rows={cumplidos} />
      </motion.section>

      {/* [E] Pipeline relation table */}
      <motion.section variants={sectionVariants}>
        <SectionHeader
          title={t('logi.pipeline')}
          caption={t('logi.pipelineCaption')}
          action={
            <button
              type="button"
              onClick={() => showToast(t('logi.exportQueued'))}
              className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-txt-secondary transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary"
            >
              <Download className="size-4" strokeWidth={1.75} />
              {t('action.export')}
            </button>
          }
        />
        <ChainTable rows={pipeline} />
      </motion.section>

      <CompraDrawer doc={drawerDoc} onClose={() => setDrawerDoc(null)} />
      <SuccessToast visible={toast !== null} text={toast ?? ''} />
    </motion.div>
  );
}
