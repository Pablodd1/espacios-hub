import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, RefreshCw, Search } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import DocsSyncTable, { DismissChip, FilterChip } from '@/components/tesoreria/DocsSyncTable';
import type { DocStatusFilter } from '@/components/tesoreria/DocsSyncTable';
import DocumentDrawer from '@/components/tesoreria/DocumentDrawer';
import Toast from '@/components/tesoreria/Toast';
import AnticiposTable from '@/components/contabilidad/AnticiposTable';
import FiscalRecon from '@/components/contabilidad/FiscalRecon';
import SobrecostoPanel from '@/components/contabilidad/SobrecostoPanel';
import { totalBookedDebt } from '@/components/contabilidad/debt-model';
import { useCountUp } from '@/hooks/use-count-up';
import { statusDocLabels, useLanguage } from '@/i18n';
import {
  DATA_TODAY,
  getAnticiposPendientes,
  getDocumentosByTipo,
  getTercero,
  reconciliacion,
  syncJobs,
  totalAnticiposPendientes,
} from '@/lib/data';
import type { Documento } from '@/lib/types';
import { cn } from '@/lib/utils';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as [number, number, number, number];
const DAY_MS = 86_400_000;

type DateRange = 'hoy' | '7d' | '30d';

function cutoffFor(range: DateRange): string {
  const days = range === 'hoy' ? 1 : range === '7d' ? 7 : 30;
  return new Date(new Date(`${DATA_TODAY}T00:00:00-05:00`).getTime() - (days - 1) * DAY_MS).toISOString().slice(0, 10);
}

function HeaderChip({ label, value, tone = 'default', index }: { label: string; value: string; tone?: 'default' | 'warning'; index: number }) {
  return (
    <motion.div
      className={cn('rounded-xl border bg-elevated px-3.5 py-2.5', tone === 'warning' ? 'border-warn/40' : 'border-hairline')}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 + index * 0.05, ease: EASE_OUT_EXPO }}
    >
      <p className="text-[10px] font-semibold uppercase leading-3 tracking-[0.08em] text-txt-muted">{label}</p>
      <p className={cn('tabular mt-1 font-display text-[17px] font-semibold leading-6', tone === 'warning' ? 'text-warn' : 'text-txt-primary')}>
        {value}
      </p>
    </motion.div>
  );
}

export default function Contabilidad() {
  const { t, formatCOPCompact, formatNumber, formatPercent } = useLanguage();

  /* ---------- Sobrecosto parameter (lifted: header chip reads it live) ---------- */
  const [pct, setPct] = useState(12.5);
  const [savedPct, setSavedPct] = useState(12.5);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const bookedTotal = useMemo(() => totalBookedDebt(), []);
  const realDebt = bookedTotal * (1 + pct / 100);

  const saveParam = () => {
    setSavedPct(pct);
    setSaveToast(`${t('conta.savedToast')} ${formatPercent(pct)}`);
    window.setTimeout(() => setSaveToast(null), 4500);
  };

  /* ---------- Header KPI chips ---------- */
  const causacionesHoy = useMemo(
    () =>
      syncJobs
        .filter((j) => j.modulo === 'Contabilidad' && j.started_at.slice(0, 10) === DATA_TODAY)
        .reduce((acc, j) => acc + Math.max(0, j.docs_procesados - j.docs_error), 0),
    [],
  );
  const vigentes = useMemo(() => getAnticiposPendientes(), []);
  const anticiposTotal = useMemo(() => totalAnticiposPendientes(), []);
  const diffsHoy = useMemo(
    () =>
      reconciliacion.filter(
        (r) => r.modulo === 'Contabilidad' && !r.resuelto && r.diferencia !== 0 && r.fecha === DATA_TODAY,
      ).length,
    [],
  );

  const animCaus = useCountUp(causacionesHoy, 700);
  const animAdvCount = useCountUp(vigentes.length, 700);
  const animAdvTotal = useCountUp(anticiposTotal, 700);
  const animDiffs = useCountUp(diffsHoy, 700);

  /* ---------- Causaciones table state ---------- */
  const causaciones = useMemo(
    () => getDocumentosByTipo('causacion').sort((a, b) => b.numero.localeCompare(a.numero)),
    [],
  );
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState<DocStatusFilter>('todos');
  const [range, setRange] = useState<DateRange>('7d');

  const filtered = useMemo(() => {
    const cutoff = cutoffFor(range);
    const q = search.trim().toLowerCase();
    return causaciones.filter((doc) => {
      if (doc.fecha < cutoff) return false;
      if (estado !== 'todos' && doc.estado !== estado) return false;
      if (q) {
        const tercero = getTercero(doc.tercero_id)?.nombre.toLowerCase() ?? '';
        if (!doc.numero.toLowerCase().includes(q) && !tercero.includes(q)) return false;
      }
      return true;
    });
  }, [causaciones, range, estado, search]);

  const filterKey = `${range}|${estado}|${search.trim().toLowerCase()}`;
  const hasActiveFilters = estado !== 'todos' || range !== '7d' || search.trim() !== '';

  const dateOptions: { id: DateRange; label: string }[] = [
    { id: 'hoy', label: t('time.today') },
    { id: '7d', label: t('teso.date7d') },
    { id: '30d', label: t('teso.date30d') },
  ];

  /* ---------- Causaciones ghost sync CTA ---------- */
  const [syncingCaus, setSyncingCaus] = useState(false);
  const [causToast, setCausToast] = useState(false);

  const syncCausaciones = () => {
    if (syncingCaus) return;
    setSyncingCaus(true);
    window.setTimeout(() => {
      setSyncingCaus(false);
      setCausToast(true);
      window.setTimeout(() => setCausToast(false), 4500);
    }, 1400);
  };

  /* ---------- Shared document drawer ---------- */
  const [selected, setSelected] = useState<Documento | null>(null);

  return (
    <motion.div
      className="flex flex-col gap-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
    >
      {/* [A] Header + KPI chips */}
      <PageHeader
        title={t('nav.contabilidad')}
        caption={t('conta.caption')}
        actions={
          <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
            <HeaderChip index={0} label={t('conta.chipCausaciones')} value={formatNumber(Math.round(animCaus))} />
            <HeaderChip
              index={1}
              label={t('conta.chipAdvances')}
              value={`${formatNumber(Math.round(animAdvCount))} · ${formatCOPCompact(animAdvTotal)}`}
            />
            <HeaderChip index={2} label={t('conta.chipRealDebt')} value={formatCOPCompact(realDebt)} />
            <HeaderChip
              index={3}
              label={t('conta.chipDiffs')}
              value={formatNumber(Math.round(animDiffs))}
              tone={diffsHoy > 0 ? 'warning' : 'default'}
            />
          </div>
        }
      />

      {/* [B] Sobrecosto & deuda real panel */}
      <SobrecostoPanel pct={pct} onPctChange={setPct} savedPct={savedPct} onSave={saveParam} />

      {/* [C] Causaciones */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: EASE_OUT_EXPO }}
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-[17px] font-semibold leading-6 text-txt-primary">{t('conta.causacionesTitle')}</h2>
            <p className="mt-0.5 text-xs text-txt-muted">{t('conta.causacionesMaster')}</p>
          </div>
          <button
            type="button"
            onClick={syncCausaciones}
            disabled={syncingCaus}
            className="flex h-9 items-center gap-2 rounded-lg border border-border-strong px-4 text-sm font-medium text-txt-secondary transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary disabled:opacity-70"
          >
            {syncingCaus ? (
              <Loader2 className="size-4 animate-spin" strokeWidth={1.75} />
            ) : (
              <RefreshCw className="size-4" strokeWidth={1.75} />
            )}
            {t('conta.causacionesSync')}
          </button>
        </div>

        {/* Toolbar */}
        <div className="mb-3 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex h-9 w-full max-w-[280px] items-center gap-2 rounded-lg bg-inset px-3">
              <Search className="size-4 shrink-0 text-txt-muted" strokeWidth={1.75} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('conta.causacionesSearch')}
                className="h-full w-full bg-transparent text-[13px] text-txt-primary outline-none placeholder:text-txt-muted"
              />
            </div>

            <span className="hidden h-5 w-px bg-border-strong sm:block" aria-hidden />

            {(['todos', 'sincronizado', 'pendiente', 'error', 'diferencia'] as const).map((s) => (
              <FilterChip key={s} active={estado === s} onClick={() => setEstado(s)}>
                {s === 'todos' ? t('common.all') : t(statusDocLabels[s])}
              </FilterChip>
            ))}

            <div className="flex-1" />

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
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5">
              {search.trim() !== '' && <DismissChip label={`“${search.trim()}”`} onDismiss={() => setSearch('')} />}
              {estado !== 'todos' && <DismissChip label={t(statusDocLabels[estado])} onDismiss={() => setEstado('todos')} />}
              {range !== '7d' && (
                <DismissChip label={dateOptions.find((o) => o.id === range)?.label ?? range} onDismiss={() => setRange('7d')} />
              )}
            </div>
          )}
        </div>

        <DocsSyncTable
          docs={filtered}
          showTaxes
          onView={setSelected}
          filterKey={filterKey}
          emptyTitle={t('common.noResults')}
          emptyCaption={t('teso.emptyEgresosCaption')}
        />
      </motion.section>

      {/* [D] Anticipos a proveedores */}
      <AnticiposTable />

      {/* [E] Daily fiscal reconciliation */}
      <FiscalRecon onViewDetail={setSelected} />

      {/* Shared document drawer + toasts */}
      <DocumentDrawer doc={selected} onClose={() => setSelected(null)} />
      <Toast visible={saveToast !== null} title={saveToast ?? ''} />
      <Toast visible={causToast} variant="sync" title={t('teso.syncCausacionesToast')} />
    </motion.div>
  );
}
