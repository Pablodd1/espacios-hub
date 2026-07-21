import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Clock3, Eye, Loader2, RefreshCw, RotateCcw, Search } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import StatusBadge from '@/components/StatusBadge';
import SystemChip from '@/components/SystemChip';
import { useLanguage, statusJobLabels } from '@/i18n';
import { cn } from '@/lib/utils';
import CarteraDrawer, { CompareColumn, DrawerSection, KV, SyncTimeline } from './CarteraDrawer';
import { buildReciboRows, daysSince, docNumeroFromConcepto, findJobForDocumento } from './model';
import type { ReciboRow } from './model';
import { reconciliacion } from '@/lib/data';
import type { DocumentoEstado } from '@/lib/types';

type EstadoFilter = DocumentoEstado | 'todos';
type RangeFilter = 'hoy' | '7d' | 'todos';

/* ==================== Drawer content ==================== */

function ReciboDrawerContent({ row, estado }: { row: ReciboRow; estado: DocumentoEstado }) {
  const { t, formatCOP, formatDate } = useLanguage();
  const { doc, tercero, banco } = row;
  const job = findJobForDocumento(doc.numero);
  const syncedHgi = estado === 'sincronizado' || doc.sincronizado_hgi;

  // For mismatched receipts, HGI side comes from the open reconciliation row.
  const reconDiff = reconciliacion.find((r) => r.modulo === 'Cartera' && r.diferencia !== 0 && docNumeroFromConcepto(r.concepto) === doc.numero);
  const hgiValor = reconDiff ? (reconDiff.valor_hgi ?? doc.valor) : doc.valor;

  const valorField = t('cart.drawer.fieldValor');
  const fechaField = t('cart.drawer.fieldFecha');
  const terceroField = t('cart.drawer.fieldTercero');

  return (
    <>
      <DrawerSection title={t('cart.drawer.resumen')}>
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          <KV label={t('cart.drawer.cliente')} value={tercero?.nombre ?? '—'} />
          <KV label={t('cart.drawer.nit')} value={tercero?.nit ?? '—'} mono />
          <KV label={t('cart.drawer.banco')} value={banco?.nombre ?? '—'} />
          <KV label={t('common.date')} value={formatDate(doc.fecha, 'day')} />
          <KV label={valorField} value={formatCOP(doc.valor)} mono />
          <KV label={t('cart.drawer.notas')} value={doc.notas ?? '—'} />
        </div>
      </DrawerSection>

      <DrawerSection title={t('cart.drawer.compare')}>
        <div className="grid grid-cols-2 gap-3">
          <CompareColumn
            system="siigo"
            rows={[
              { key: 'numero', label: 'N°', value: doc.numero },
              { key: 'fecha', label: fechaField, value: formatDate(doc.fecha, 'day') },
              { key: 'valor', label: valorField, value: formatCOP(doc.valor) },
              { key: 'tercero', label: terceroField, value: tercero?.nombre ?? '—' },
            ]}
          />
          <CompareColumn
            system="hgi"
            highlightKey={reconDiff ? 'valor' : undefined}
            rows={[
              { key: 'numero', label: 'N°', value: syncedHgi || reconDiff ? doc.numero : '—' },
              { key: 'fecha', label: fechaField, value: syncedHgi || reconDiff ? formatDate(doc.fecha, 'day') : '—' },
              { key: 'valor', label: valorField, value: syncedHgi || reconDiff ? formatCOP(hgiValor) : '—' },
              { key: 'tercero', label: terceroField, value: syncedHgi || reconDiff ? (tercero?.nombre ?? '—') : '—' },
            ]}
          />
        </div>
        {reconDiff && (
          <p className="mt-3 flex items-center justify-between rounded-lg bg-[var(--danger-dim)] px-3 py-2 text-[13px]">
            <span className="text-txt-secondary">{t('cart.drawer.deltaVs')}</span>
            <span className="tabular font-mono-data font-semibold text-danger">{formatCOP(reconDiff.diferencia)}</span>
          </p>
        )}
      </DrawerSection>

      <DrawerSection title={t('cart.drawer.timeline')}>
        <SyncTimeline
          steps={[
            { label: t('cart.drawer.stepCreated'), detail: formatDate(doc.created_at, 'short'), state: 'done' },
            job
              ? {
                  label: `${t('cart.drawer.stepJob')} · ${t(statusJobLabels[job.estado])}`,
                  detail: `${job.id} · ${formatDate(job.started_at, 'short')}`,
                  state: job.estado === 'completado' ? 'done' : job.estado === 'error' ? 'error' : 'pending',
                }
              : { label: t('cart.drawer.stepJob'), detail: t('cart.drawer.noJob'), state: 'pending' },
            {
              label: t('cart.drawer.stepHgi'),
              detail: syncedHgi ? formatDate(doc.created_at, 'short') : '—',
              state: syncedHgi ? 'done' : estado === 'error' ? 'error' : 'pending',
            },
          ]}
        />
      </DrawerSection>
    </>
  );
}

/* ==================== Table ==================== */

const ESTADO_FILTERS: { key: EstadoFilter; labelKey: 'common.all' | 'status.synced' | 'status.pending' | 'status.diff' | 'status.error' }[] = [
  { key: 'todos', labelKey: 'common.all' },
  { key: 'sincronizado', labelKey: 'status.synced' },
  { key: 'pendiente', labelKey: 'status.pending' },
  { key: 'diferencia', labelKey: 'status.diff' },
  { key: 'error', labelKey: 'status.error' },
];

function RecibosTable({
  rows,
  estadoOf,
  onOpen,
  onRetry,
  retryingId,
}: {
  rows: ReciboRow[];
  estadoOf: (row: ReciboRow) => DocumentoEstado;
  onOpen: (row: ReciboRow) => void;
  onRetry: (row: ReciboRow) => void;
  retryingId: string | null;
}) {
  const { t, formatCOP, formatDate } = useLanguage();
  const filterKey = rows.map((r) => r.doc.id).join('|');

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-hairline bg-elevated">
        <EmptyState title={t('cart.receipts.emptyTitle')} caption={t('cart.receipts.emptyCaption')} />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-hairline bg-elevated">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-elevated">
            <tr className="h-9 border-b border-hairline">
              <th className="text-overline px-4 font-semibold text-txt-muted">{t('cart.receipts.colRecibo')}</th>
              <th className="text-overline px-4 font-semibold text-txt-muted">{t('common.date')}</th>
              <th className="text-overline px-4 font-semibold text-txt-muted">{t('cart.receipts.colCliente')}</th>
              <th className="text-overline px-4 font-semibold text-txt-muted">{t('cart.receipts.colBanco')}</th>
              <th className="text-overline px-4 text-right font-semibold text-txt-muted">{t('common.amount')}</th>
              <th className="text-overline px-4 font-semibold text-txt-muted">{t('cart.receipts.colSiigo')}</th>
              <th className="text-overline px-4 font-semibold text-txt-muted">{t('cart.receipts.colHgi')}</th>
              <th className="text-overline px-4 font-semibold text-txt-muted">{t('common.status')}</th>
              <th className="text-overline w-20 px-4 text-right font-semibold text-txt-muted">{t('cart.receipts.colAcciones')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const estado = estadoOf(row);
              const hot = estado === 'error' || estado === 'diferencia';
              const syncedHgi = estado === 'sincronizado' || row.doc.sincronizado_hgi;
              return (
                <motion.tr
                  key={`${filterKey}-${row.doc.id}`}
                  className={cn(
                    'group h-11 cursor-pointer border-b border-hairline transition-colors duration-120 ease-standard last:border-b-0 hover:bg-[var(--bg-hover)]',
                    hot && 'bg-[rgba(240,68,82,0.04)]',
                  )}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.025, 0.5), ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => onOpen(row)}
                >
                  <td className={cn('px-4 font-mono-data text-[13px] text-txt-primary', hot && 'border-l-2 border-l-danger')}>
                    {row.doc.numero}
                  </td>
                  <td className="px-4 text-[13px] text-txt-secondary">{formatDate(row.doc.fecha, 'day')}</td>
                  <td className="max-w-[220px] truncate px-4 text-[13px] text-txt-primary">{row.tercero?.nombre ?? '—'}</td>
                  <td className="px-4 text-[13px] text-txt-secondary">{row.banco?.nombre ?? '—'}</td>
                  <td className="tabular px-4 text-right font-mono-data text-[13px] text-txt-primary">{formatCOP(row.doc.valor)}</td>
                  <td className="px-4">
                    <span className="inline-flex items-center gap-1.5">
                      <SystemChip system="siigo" />
                      <Check className="size-3.5 text-brand" strokeWidth={2.5} />
                    </span>
                  </td>
                  <td className="px-4">
                    <span className="inline-flex items-center gap-1.5">
                      <SystemChip system="hgi" />
                      {syncedHgi ? (
                        <Check className="size-3.5 text-brand" strokeWidth={2.5} />
                      ) : (
                        <Clock3 className="size-3.5 text-warn" strokeWidth={2.25} />
                      )}
                    </span>
                  </td>
                  <td className="px-4">
                    <StatusBadge status={estado} hideIcon />
                  </td>
                  <td className="px-4 text-right">
                    <span className="inline-flex items-center gap-1 opacity-0 transition-opacity duration-120 group-hover:opacity-100">
                      <button
                        type="button"
                        aria-label={t('action.viewDetail')}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpen(row);
                        }}
                        className="rounded-md p-1.5 text-txt-muted transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary"
                      >
                        <Eye className="size-4" strokeWidth={1.75} />
                      </button>
                      {estado !== 'sincronizado' && (
                        <button
                          type="button"
                          aria-label={t('action.retry')}
                          onClick={(e) => {
                            e.stopPropagation();
                            onRetry(row);
                          }}
                          className="rounded-md p-1.5 text-txt-muted transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary"
                        >
                          {retryingId === row.doc.id ? (
                            <Loader2 className="size-4 animate-spin" strokeWidth={1.75} style={{ color: 'var(--sync)' }} />
                          ) : (
                            <RotateCcw className="size-4" strokeWidth={1.75} />
                          )}
                        </button>
                      )}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ==================== Tab ==================== */

export default function RecibosTab({ notify }: { notify: (text: string) => void }) {
  const { t } = useLanguage();
  const allRows = useMemo(() => buildReciboRows(), []);
  const [query, setQuery] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<EstadoFilter>('todos');
  const [range, setRange] = useState<RangeFilter>('hoy');
  const [overrides, setOverrides] = useState<Record<string, DocumentoEstado>>({});
  const [syncing, setSyncing] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [openRow, setOpenRow] = useState<ReciboRow | null>(null);

  const estadoOf = (row: ReciboRow): DocumentoEstado => overrides[row.doc.id] ?? row.doc.estado;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allRows.filter((row) => {
      if (estadoFilter !== 'todos' && (overrides[row.doc.id] ?? row.doc.estado) !== estadoFilter) return false;
      if (range === 'hoy' && daysSince(row.doc.fecha) !== 0) return false;
      if (range === '7d' && daysSince(row.doc.fecha) > 7) return false;
      if (q && !row.doc.numero.toLowerCase().includes(q) && !(row.tercero?.nombre.toLowerCase().includes(q) ?? false)) return false;
      return true;
    });
  }, [allRows, query, estadoFilter, range, overrides]);

  const pendingCount = allRows.filter((r) => estadoOf(r) === 'pendiente').length;

  const runSync = () => {
    if (syncing) return;
    setSyncing(true);
    window.setTimeout(() => {
      setOverrides((prev) => {
        const next = { ...prev };
        for (const r of allRows) {
          if ((prev[r.doc.id] ?? r.doc.estado) === 'pendiente') next[r.doc.id] = 'sincronizado';
        }
        return next;
      });
      setSyncing(false);
      notify(`${t('cart.receipts.syncDone')} · ${pendingCount} ${t('cart.receipts.docsCount')}`);
    }, 1400);
  };

  const retryRow = (row: ReciboRow) => {
    if (retryingId) return;
    setRetryingId(row.doc.id);
    window.setTimeout(() => {
      setOverrides((prev) => ({ ...prev, [row.doc.id]: 'sincronizado' }));
      setRetryingId(null);
      notify(`${row.doc.numero} · ${t('cart.receipts.syncDone')}`);
    }, 900);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-9 w-[280px] items-center gap-2 rounded-lg bg-inset px-3">
          <Search className="size-4 shrink-0 text-txt-muted" strokeWidth={1.75} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('cart.receipts.searchPh')}
            className="w-full bg-transparent text-[13px] text-txt-primary outline-none placeholder:text-txt-muted"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {ESTADO_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setEstadoFilter(f.key)}
              aria-pressed={estadoFilter === f.key}
              className={cn(
                'h-8 rounded-lg border px-2.5 text-xs font-semibold transition-all duration-180 ease-standard',
                estadoFilter === f.key
                  ? 'border-border-strong bg-overlay text-txt-primary'
                  : 'border-transparent text-txt-muted hover:bg-[var(--bg-hover)] hover:text-txt-secondary',
              )}
            >
              {t(f.labelKey)}
            </button>
          ))}
        </div>

        <div className="flex h-8 items-center rounded-lg bg-inset p-0.5">
          {(
            [
              { key: 'hoy', label: t('cart.receipts.rangeHoy') },
              { key: '7d', label: t('cart.receipts.range7d') },
              { key: 'todos', label: t('cart.receipts.rangeTodos') },
            ] as const
          ).map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRange(r.key)}
              className={cn(
                'h-7 rounded-md px-2.5 text-[11px] font-semibold transition-all duration-180',
                range === r.key
                  ? 'border border-border-strong bg-overlay text-txt-primary'
                  : 'border border-transparent text-txt-muted hover:text-txt-secondary',
              )}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <button
          type="button"
          onClick={runSync}
          disabled={syncing}
          className="flex h-9 items-center gap-2 rounded-lg border border-border-strong px-4 text-sm font-medium text-txt-secondary transition-all duration-100 ease-standard hover:bg-[var(--bg-hover)] hover:text-txt-primary active:scale-[0.97] disabled:opacity-80"
        >
          {syncing ? <Loader2 className="size-4 animate-spin" strokeWidth={1.75} /> : <RefreshCw className="size-4" strokeWidth={1.75} />}
          {syncing ? t('cart.receipts.syncing') : t('cart.receipts.syncCta')}
        </button>
      </div>

      <RecibosTable rows={rows} estadoOf={estadoOf} onOpen={setOpenRow} onRetry={retryRow} retryingId={retryingId} />

      <CarteraDrawer
        open={openRow !== null}
        onClose={() => setOpenRow(null)}
        title={openRow?.doc.numero ?? ''}
        subtitle={openRow?.tercero?.nombre}
        headerAside={openRow ? <StatusBadge status={estadoOf(openRow)} /> : undefined}
      >
        {openRow && <ReciboDrawerContent row={openRow} estado={estadoOf(openRow)} />}
      </CarteraDrawer>
    </div>
  );
}
