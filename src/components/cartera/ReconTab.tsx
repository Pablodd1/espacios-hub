import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, CheckCircle2, Loader2, Play } from 'lucide-react';
import DataTable from '@/components/DataTable';
import type { ColumnDef } from '@/components/DataTable';
import EmptyState from '@/components/EmptyState';
import StatusBadge from '@/components/StatusBadge';
import SystemChip from '@/components/SystemChip';
import { useLanguage } from '@/i18n';
import { cn } from '@/lib/utils';
import CarteraDrawer, { CompareColumn, DrawerSection, KV, SuggestedMatchCard } from './CarteraDrawer';
import { buildCarteraDiffs, buildReconBuckets, causaForDiff, docNumeroFromConcepto, suggestedMatchFor } from './model';
import type { CarteraModel } from './model';
import type { Reconciliacion, Tercero } from '@/lib/types';

type DateFilter = 'hoy' | 'ayer' | 'todos';

/* ==================== Bucket panel ==================== */

function BucketPanel({
  label,
  siigo,
  hgi,
  delta,
  scanning,
  index,
}: {
  label: string;
  siigo: number;
  hgi: number;
  delta: number;
  scanning: boolean;
  index: number;
}) {
  const { t, formatCOPCompact } = useLanguage();
  const matched = delta === 0;
  return (
    <motion.section
      className="relative col-span-12 overflow-hidden rounded-xl border border-hairline bg-elevated p-5 md:col-span-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      {scanning && <div className="skeleton-shimmer absolute inset-0 z-10" aria-hidden />}
      <h3 className="text-overline text-txt-muted">{label}</h3>

      <div className="mt-4 flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <SystemChip system="siigo" />
          <span className="tabular font-mono-data text-[15px] text-txt-primary">{formatCOPCompact(siigo)}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <SystemChip system="hgi" />
          <span className="tabular font-mono-data text-[15px] text-txt-primary">{formatCOPCompact(hgi)}</span>
        </div>
      </div>

      <div className="my-4 border-t border-hairline" />

      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[13px] font-semibold text-txt-secondary">
          Δ {t('cart.recon.diff')}
        </span>
        <span
          className={cn(
            'tabular flex items-center gap-1.5 font-mono-data text-[15px] font-semibold transition-colors duration-200',
            matched ? 'text-brand' : 'text-danger',
          )}
        >
          {matched && <CheckCircle2 className="size-4" strokeWidth={2} />}
          {formatCOPCompact(delta)}
        </span>
      </div>
      {matched && <p className="mt-1 text-right text-[11px] text-txt-muted">{t('cart.recon.matched')}</p>}
    </motion.section>
  );
}

/* ==================== Differences table ==================== */

function DifferencesTable({
  diffs,
  terceroOf,
  onResolve,
}: {
  diffs: Reconciliacion[];
  terceroOf: (diff: Reconciliacion) => Tercero | undefined;
  onResolve: (diff: Reconciliacion) => void;
}) {
  const { t, formatCOP } = useLanguage();

  const columns: ColumnDef<Reconciliacion>[] = [
    {
      key: 'documento',
      header: t('common.document'),
      mono: true,
      cell: (r) => docNumeroFromConcepto(r.concepto) ?? r.concepto,
    },
    {
      key: 'cliente',
      header: t('cart.receipts.colCliente'),
      cell: (r) => <span className="text-txt-primary">{terceroOf(r)?.nombre ?? '—'}</span>,
    },
    {
      key: 'valor_siigo',
      header: t('cart.recon.colValorSiigo'),
      numeric: true,
      mono: true,
      cell: (r) => formatCOP(r.valor_siigo ?? 0),
    },
    {
      key: 'valor_hgi',
      header: t('cart.recon.colValorHgi'),
      numeric: true,
      mono: true,
      cell: (r) => formatCOP(r.valor_hgi ?? 0),
    },
    {
      key: 'delta',
      header: 'Δ',
      numeric: true,
      mono: true,
      cell: (r) => <span className="font-semibold text-danger">{formatCOP(r.diferencia)}</span>,
    },
    {
      key: 'causa',
      header: t('cart.recon.colCausa'),
      cell: (r) => (
        <span
          className="inline-flex h-[22px] items-center rounded-md px-2 text-xs font-semibold"
          style={{ backgroundColor: 'var(--warning-dim)', color: 'var(--warning)' }}
        >
          {t(causaForDiff(r))}
        </span>
      ),
    },
    {
      key: 'accion',
      header: t('cart.recon.colAccion'),
      cell: (r) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onResolve(r);
          }}
          className="h-7 rounded-lg border border-border-strong px-3 text-xs font-semibold text-txt-secondary transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary"
        >
          {t('cart.recon.resolve')}
        </button>
      ),
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <h3 className="text-overline mb-2 px-1 text-txt-muted">{t('cart.recon.diffsTitle')}</h3>
      <DataTable columns={columns} data={diffs} rowKey={(r) => r.id} pageSize={0} />
    </motion.section>
  );
}

/* ==================== Resolve drawer ==================== */

function ResolveDrawerContent({
  diff,
  tercero,
  onResolved,
  onReject,
}: {
  diff: Reconciliacion;
  tercero: Tercero | undefined;
  onResolved: () => void;
  onReject: () => void;
}) {
  const { t, formatCOP, formatDate } = useLanguage();
  const match = suggestedMatchFor(diff);
  const numero = docNumeroFromConcepto(diff.concepto) ?? diff.concepto;

  return (
    <>
      <DrawerSection title={t('cart.drawer.resumen')}>
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          <KV label={t('common.document')} value={numero} mono />
          <KV label={t('cart.receipts.colCliente')} value={tercero?.nombre ?? '—'} />
          <KV label={t('common.date')} value={formatDate(diff.fecha, 'day')} />
          <KV label={t('cart.recon.colCausa')} value={t(causaForDiff(diff))} />
        </div>
      </DrawerSection>

      <DrawerSection title={t('cart.drawer.compare')}>
        <div className="grid grid-cols-2 gap-3">
          <CompareColumn
            system="siigo"
            rows={[{ key: 'valor', label: t('cart.drawer.fieldValor'), value: formatCOP(diff.valor_siigo ?? 0) }]}
          />
          <CompareColumn
            system="hgi"
            highlightKey="valor"
            rows={[{ key: 'valor', label: t('cart.drawer.fieldValor'), value: formatCOP(diff.valor_hgi ?? 0) }]}
          />
        </div>
        <p className="mt-3 flex items-center justify-between rounded-lg bg-[var(--danger-dim)] px-3 py-2 text-[13px]">
          <span className="text-txt-secondary">Δ {t('cart.recon.diff')}</span>
          <span className="tabular font-mono-data font-semibold text-danger">{formatCOP(diff.diferencia)}</span>
        </p>
      </DrawerSection>

      {match && (
        <DrawerSection title={t('cart.recon.suggestedTitle')}>
          <SuggestedMatchCard match={match} onConfirm={onResolved} onReject={onReject} />
        </DrawerSection>
      )}
    </>
  );
}

/* ==================== Tab ==================== */

export default function ReconTab({ model, notify }: { model: CarteraModel; notify: (text: string) => void }) {
  const { t, formatDate } = useLanguage();
  const [dateFilter, setDateFilter] = useState<DateFilter>('todos');
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());
  const [scanning, setScanning] = useState(false);
  const [openDiff, setOpenDiff] = useState<Reconciliacion | null>(null);

  const allDiffs = useMemo(() => buildCarteraDiffs(resolvedIds), [resolvedIds]);
  const diffs = useMemo(() => {
    if (dateFilter === 'todos') return allDiffs;
    const day = dateFilter === 'hoy' ? '2026-07-21' : '2026-07-20';
    return allDiffs.filter((r) => r.fecha === day);
  }, [allDiffs, dateFilter]);

  const buckets = useMemo(() => buildReconBuckets(model.clientes, model.recibos, diffs), [model.clientes, model.recibos, diffs]);

  const terceroOf = (diff: Reconciliacion): Tercero | undefined => {
    const numero = docNumeroFromConcepto(diff.concepto);
    const recibo = model.recibos.find((d) => d.numero === numero);
    return model.clientes.find((c) => c.tercero.id === recibo?.tercero_id)?.tercero;
  };

  const runRecon = () => {
    if (scanning) return;
    setScanning(true);
    window.setTimeout(() => setScanning(false), 1200);
  };

  const resolveDiff = (diff: Reconciliacion) => {
    setResolvedIds((prev) => new Set(prev).add(diff.id));
    setOpenDiff(null);
    notify(t('cart.recon.linkedToast'));
  };

  const dateOptions: { key: DateFilter; label: string }[] = [
    { key: 'hoy', label: t('time.today') },
    { key: 'ayer', label: t('time.yesterday') },
    { key: 'todos', label: t('common.all') },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Header inside tab */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-8 items-center gap-1 rounded-lg bg-inset p-0.5">
          <CalendarDays className="mx-1.5 size-3.5 text-txt-muted" strokeWidth={1.75} />
          {dateOptions.map((d) => (
            <button
              key={d.key}
              type="button"
              onClick={() => setDateFilter(d.key)}
              className={cn(
                'h-7 rounded-md px-2.5 text-[11px] font-semibold transition-all duration-180',
                dateFilter === d.key
                  ? 'border border-border-strong bg-overlay text-txt-primary'
                  : 'border border-transparent text-txt-muted hover:text-txt-secondary',
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
        <p className="text-[12px] text-txt-muted">{formatDate(diffFechaCorte(dateFilter), 'day')}</p>
        <div className="flex-1" />
        <button
          type="button"
          onClick={runRecon}
          disabled={scanning}
          className="flex h-9 items-center gap-2 rounded-lg border border-border-strong px-4 text-sm font-medium text-txt-secondary transition-all duration-100 ease-standard hover:bg-[var(--bg-hover)] hover:text-txt-primary active:scale-[0.97] disabled:opacity-80"
        >
          {scanning ? <Loader2 className="size-4 animate-spin" strokeWidth={1.75} /> : <Play className="size-4" strokeWidth={1.75} />}
          {scanning ? t('cart.recon.running') : t('cart.recon.run')}
        </button>
      </div>

      {/* Three bucket panels */}
      <div className="grid grid-cols-12 gap-5">
        {buckets.map((b, i) => (
          <BucketPanel key={b.key} label={t(b.labelKey)} siigo={b.siigo} hgi={b.hgi} delta={b.delta} scanning={scanning} index={i} />
        ))}
      </div>

      {/* Differences or conciliado state */}
      {diffs.length > 0 ? (
        <DifferencesTable diffs={diffs} terceroOf={terceroOf} onResolve={setOpenDiff} />
      ) : (
        <motion.div
          className="rounded-xl border border-hairline bg-elevated"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <EmptyState title={t('cart.recon.emptyTitle')} caption={t('cart.recon.emptyCaption')} />
        </motion.div>
      )}

      <CarteraDrawer
        open={openDiff !== null}
        onClose={() => setOpenDiff(null)}
        title={openDiff ? (docNumeroFromConcepto(openDiff.concepto) ?? openDiff.concepto) : ''}
        subtitle={openDiff ? terceroOf(openDiff)?.nombre : undefined}
        headerAside={<StatusBadge status="diferencia" />}
      >
        {openDiff && (
          <ResolveDrawerContent
            diff={openDiff}
            tercero={terceroOf(openDiff)}
            onResolved={() => resolveDiff(openDiff)}
            onReject={() => setOpenDiff(null)}
          />
        )}
      </CarteraDrawer>
    </div>
  );
}

/** Cut date shown next to the selector (demo anchor: 2026-07-21). */
function diffFechaCorte(filter: DateFilter): string {
  if (filter === 'ayer') return '2026-07-20';
  return '2026-07-21';
}
