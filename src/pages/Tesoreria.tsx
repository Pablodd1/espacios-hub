import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock3, Download, Loader2, RefreshCw, Search } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import BankCards from '@/components/tesoreria/BankCards';
import DocsSyncTable, { DismissChip, FilterChip } from '@/components/tesoreria/DocsSyncTable';
import type { DocStatusFilter } from '@/components/tesoreria/DocsSyncTable';
import DocumentDrawer from '@/components/tesoreria/DocumentDrawer';
import SyncProgressModal from '@/components/tesoreria/SyncProgressModal';
import Toast from '@/components/tesoreria/Toast';
import { statusDocLabels, useLanguage } from '@/i18n';
import { DATA_TODAY, bancos, getDocumentosByTipo, getTercero, syncJobs } from '@/lib/data';
import type { Documento } from '@/lib/types';

type DateRange = 'hoy' | '7d' | '30d';

const DAY_MS = 86_400_000;

function cutoffFor(range: DateRange): string {
  const days = range === 'hoy' ? 1 : range === '7d' ? 7 : 30;
  return new Date(new Date(`${DATA_TODAY}T00:00:00-05:00`).getTime() - (days - 1) * DAY_MS).toISOString().slice(0, 10);
}

export default function Tesoreria() {
  const { t, formatDate, formatNumber } = useLanguage();

  const egresos = useMemo(
    () => getDocumentosByTipo('egreso').sort((a, b) => b.numero.localeCompare(a.numero)),
    [],
  );

  /* ---------- Filters ---------- */
  const [search, setSearch] = useState('');
  const [bankIds, setBankIds] = useState<Set<string>>(new Set());
  const [estado, setEstado] = useState<DocStatusFilter>('todos');
  const [range, setRange] = useState<DateRange>('7d');

  const toggleBank = (id: string) => {
    setBankIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const cutoff = cutoffFor(range);
    const q = search.trim().toLowerCase();
    return egresos.filter((doc) => {
      if (doc.fecha < cutoff) return false;
      if (bankIds.size > 0 && !bankIds.has(doc.banco_id ?? '')) return false;
      if (estado !== 'todos' && doc.estado !== estado) return false;
      if (q) {
        const tercero = getTercero(doc.tercero_id)?.nombre.toLowerCase() ?? '';
        if (!doc.numero.toLowerCase().includes(q) && !tercero.includes(q)) return false;
      }
      return true;
    });
  }, [egresos, range, bankIds, estado, search]);

  const filterKey = `${range}|${estado}|${[...bankIds].sort().join(',')}|${search.trim().toLowerCase()}`;

  /* ---------- Bank card aggregates ---------- */
  const bankItems = useMemo(
    () =>
      bancos.map((banco) => ({
        banco,
        egresosHoy: egresos.filter((d) => d.banco_id === banco.id && d.fecha === DATA_TODAY).length,
        pendientes: egresos.filter((d) => d.banco_id === banco.id && d.estado !== 'sincronizado').length,
      })),
    [egresos],
  );

  /* ---------- Last run chip ---------- */
  const lastRun = useMemo(() => {
    const jobs = syncJobs.filter((j) => j.modulo === 'Tesoreria' && j.started_at.slice(0, 10) === DATA_TODAY);
    const finished = jobs.filter((j) => j.finished_at).sort((a, b) => (b.finished_at ?? '').localeCompare(a.finished_at ?? ''));
    const docs = jobs.reduce((acc, j) => acc + Math.max(0, j.docs_procesados - j.docs_error), 0);
    const errors = jobs.reduce((acc, j) => acc + j.docs_error, 0);
    return { at: finished[0]?.finished_at ?? null, docs, errors };
  }, []);

  /* ---------- Overlays ---------- */
  const [selected, setSelected] = useState<Documento | null>(null);
  const [syncOpen, setSyncOpen] = useState(false);
  const [syncDone, setSyncDone] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const openSync = () => {
    setSyncDone(false);
    setSyncOpen(true);
  };

  const syncSteps = useMemo(
    () =>
      bankItems.map(({ banco }) => ({
        id: banco.id,
        name: `Banco ${banco.nombre}`,
        docs: egresos.filter((d) => d.banco_id === banco.id).length,
      })),
    [bankItems, egresos],
  );

  const dateOptions: { id: DateRange; label: string }[] = [
    { id: 'hoy', label: t('time.today') },
    { id: '7d', label: t('teso.date7d') },
    { id: '30d', label: t('teso.date30d') },
  ];

  const hasActiveFilters = bankIds.size > 0 || estado !== 'todos' || range !== '7d' || search.trim() !== '';

  const toolbar = (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="flex h-9 w-full max-w-[280px] items-center gap-2 rounded-lg bg-inset px-3">
          <Search className="size-4 shrink-0 text-txt-muted" strokeWidth={1.75} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('teso.searchPlaceholder')}
            className="h-full w-full bg-transparent text-[13px] text-txt-primary outline-none placeholder:text-txt-muted"
          />
        </div>

        <span className="hidden h-5 w-px bg-border-strong sm:block" aria-hidden />

        {/* Bank multi-select */}
        {bancos.map((banco) => (
          <FilterChip key={banco.id} active={bankIds.has(banco.id)} onClick={() => toggleBank(banco.id)}>
            {banco.nombre}
          </FilterChip>
        ))}

        <span className="hidden h-5 w-px bg-border-strong sm:block" aria-hidden />

        {/* Status filter */}
        {(['todos', 'sincronizado', 'pendiente', 'error', 'diferencia'] as const).map((s) => (
          <FilterChip key={s} active={estado === s} onClick={() => setEstado(s)}>
            {s === 'todos' ? t('common.all') : t(statusDocLabels[s])}
          </FilterChip>
        ))}

        <div className="flex-1" />

        {/* Date range segmented */}
        <div className="flex h-9 items-center rounded-lg bg-inset p-1">
          {dateOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setRange(opt.id)}
              className={
                range === opt.id
                  ? 'h-7 rounded-md border border-border-strong bg-overlay px-2.5 text-xs font-semibold text-txt-primary transition-all duration-180'
                  : 'h-7 rounded-md border border-transparent px-2.5 text-xs font-semibold text-txt-muted transition-all duration-180 hover:text-txt-secondary'
              }
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Export */}
        <button
          type="button"
          className="flex h-9 items-center gap-2 rounded-lg border border-border-strong px-3 text-[13px] font-medium text-txt-secondary transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary"
        >
          <Download className="size-4" strokeWidth={1.75} />
          {t('action.export')}
        </button>
      </div>

      {/* Active filter chips */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div className="flex flex-wrap items-center gap-1.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {search.trim() !== '' && <DismissChip label={`“${search.trim()}”`} onDismiss={() => setSearch('')} />}
            {[...bankIds].map((id) => (
              <DismissChip key={id} label={bancos.find((b) => b.id === id)?.nombre ?? id} onDismiss={() => toggleBank(id)} />
            ))}
            {estado !== 'todos' && <DismissChip label={t(statusDocLabels[estado])} onDismiss={() => setEstado('todos')} />}
            {range !== '7d' && (
              <DismissChip label={dateOptions.find((o) => o.id === range)?.label ?? range} onDismiss={() => setRange('7d')} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <motion.div
      className="flex flex-col gap-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* [A] Header + sync action */}
      <PageHeader
        title={t('nav.tesoreria')}
        caption={t('teso.caption')}
        actions={
          <>
            <span className="hidden h-9 items-center gap-2 rounded-lg border border-hairline bg-elevated px-3 text-xs text-txt-muted lg:flex">
              <Clock3 className="size-3.5" strokeWidth={1.75} />
              {t('teso.lastRun')}: {t('teso.todayLower')} {lastRun.at ? formatDate(lastRun.at, 'time') : '—'} (
              {formatNumber(lastRun.docs)} {t('teso.docs')}, {formatNumber(lastRun.errors)} {t('teso.errors')})
            </span>
            <button
              type="button"
              onClick={openSync}
              disabled={syncOpen && !syncDone}
              className="flex h-9 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-canvas transition-all duration-100 ease-standard hover:bg-brand-hover active:scale-[0.97] disabled:opacity-90"
              style={{ boxShadow: '0 0 0 1px rgba(22,199,132,.35), 0 4px 24px -4px rgba(22,199,132,.35)' }}
            >
              {syncOpen && !syncDone ? (
                <Loader2 className="size-4 animate-spin" strokeWidth={1.75} />
              ) : (
                <RefreshCw className="size-4" strokeWidth={1.75} />
              )}
              {t('action.syncNow')}
            </button>
          </>
        }
      />

      {/* [B] Bank account cards */}
      <BankCards items={bankItems} selectedIds={bankIds} onToggle={toggleBank} />

      {/* [C] Toolbar + [D] Egresos table */}
      <div className="flex flex-col gap-3">
        {toolbar}
        <DocsSyncTable
          docs={filtered}
          showBank
          onView={setSelected}
          filterKey={filterKey}
          emptyTitle={t('teso.emptyEgresos')}
          emptyCaption={t('teso.emptyEgresosCaption')}
        />
      </div>

      {/* [E] Document drawer */}
      <DocumentDrawer doc={selected} onClose={() => setSelected(null)} />

      {/* [F] Sync progress modal */}
      <SyncProgressModal
        open={syncOpen}
        steps={syncSteps}
        onClose={() => setSyncOpen(false)}
        onFinish={() => {
          setSyncDone(true);
          setToastVisible(true);
          window.setTimeout(() => setToastVisible(false), 4500);
        }}
      />
      <Toast visible={toastVisible} variant="sync" title={t('teso.syncToast')} />
    </motion.div>
  );
}
