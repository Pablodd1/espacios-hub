import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useLanguage } from '@/i18n';
import { buildAging, interp } from './model';
import type { CarteraModel, ClienteCartera } from './model';

/* ==================== B1. Aging chart ==================== */

function AgingTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload?: { label?: string; value?: number; color?: string } }[];
}) {
  const { formatCOP } = useLanguage();
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0]?.payload;
  if (!p) return null;
  return (
    <div className="rounded-lg border border-border-strong bg-overlay px-3 py-2 shadow-xl">
      <p className="mb-0.5 text-[11px] text-txt-muted">{p.label}</p>
      <p className="font-mono-data text-xs text-txt-primary">
        <span className="mr-1.5 inline-block size-1.5 rounded-full" style={{ backgroundColor: p.color }} />
        {formatCOP(p.value ?? 0)}
      </p>
    </div>
  );
}

function AgingChart({ model }: { model: CarteraModel }) {
  const { t } = useLanguage();
  const buckets = useMemo(() => buildAging(model.clientes), [model.clientes]);
  const data = useMemo(() => buckets.map((b) => ({ name: b.key, label: t(b.labelKey), value: b.value, color: b.color })), [buckets, t]);

  return (
    <motion.section
      className="col-span-12 rounded-xl border border-hairline bg-elevated p-5 lg:col-span-7"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.05 }}
    >
      <div className="mb-4">
        <h2 className="font-display text-[17px] font-semibold leading-6 text-txt-primary">{t('cart.aging.title')}</h2>
        <p className="mt-0.5 text-xs text-txt-muted">{t('cart.aging.caption')}</p>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 4 }} barCategoryGap="70%">
            <XAxis
              dataKey="label"
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'Inter' }}
              tickLine={false}
              axisLine={false}
              interval={0}
            />
            {/* Y hidden for cleanliness — values surface via tooltip */}
            <YAxis hide domain={[0, 'dataMax']} />
            <Tooltip content={<AgingTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={500} animationEasing="ease-out">
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.section>
  );
}

/* ==================== B2. Top deudores ==================== */

function DebtorRow({
  cliente,
  total,
  index,
  onOpen,
}: {
  cliente: ClienteCartera;
  total: number;
  index: number;
  onOpen: () => void;
}) {
  const { t, formatCOPCompact } = useLanguage();
  const pct = total > 0 ? (cliente.saldo / total) * 100 : 0;
  const vencido = cliente.maxDiasVencido > 0;
  return (
    <motion.li
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
    >
      <button
        type="button"
        onClick={onOpen}
        className="group flex w-full items-center gap-3 rounded-lg border border-transparent px-2 py-2.5 text-left transition-colors duration-180 ease-standard hover:border-hairline hover:bg-[var(--bg-hover)]"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[13px] font-medium text-txt-primary">{cliente.tercero.nombre}</p>
            <p className="tabular shrink-0 font-mono-data text-[13px] text-txt-primary">{formatCOPCompact(cliente.saldo)}</p>
          </div>
          <div className="mt-1.5 flex items-center gap-2.5">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
              <motion.div
                className="h-full rounded-full bg-brand"
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(2, pct)}%` }}
                transition={{ duration: 0.6, delay: 0.1 + index * 0.06, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            {vencido ? (
              <span
                className="shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-semibold"
                style={{ backgroundColor: 'var(--warning-dim)', color: 'var(--warning)' }}
              >
                {interp(t('cart.debtors.diasVencido'), { n: cliente.maxDiasVencido })}
              </span>
            ) : (
              <span
                className="shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-semibold"
                style={{ backgroundColor: 'var(--brand-dim)', color: 'var(--brand)' }}
              >
                {t('cart.debtors.alDia')}
              </span>
            )}
          </div>
          <p className="mt-1 font-mono-data text-[11px] text-txt-muted">NIT {cliente.tercero.nit ?? '—'}</p>
        </div>
      </button>
    </motion.li>
  );
}

function TopDebtors({ model, onOpenStatement }: { model: CarteraModel; onOpenStatement: (terceroId: string) => void }) {
  const { t } = useLanguage();
  const top = useMemo(() => model.clientes.filter((c) => c.saldo > 0).slice(0, 5), [model.clientes]);

  return (
    <motion.section
      className="col-span-12 rounded-xl border border-hairline bg-elevated p-5 lg:col-span-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <h2 className="mb-2 font-display text-[17px] font-semibold leading-6 text-txt-primary">{t('cart.debtors.title')}</h2>
      <ul className="flex flex-col">
        {top.map((c, i) => (
          <DebtorRow key={c.tercero.id} cliente={c} total={model.totalCartera} index={i} onOpen={() => onOpenStatement(c.tercero.id)} />
        ))}
      </ul>
    </motion.section>
  );
}

/* ==================== Tab ==================== */

export default function ResumenTab({
  model,
  onOpenStatement,
}: {
  model: CarteraModel;
  onOpenStatement: (terceroId: string) => void;
}) {
  return (
    <div className="grid grid-cols-12 gap-5">
      <AgingChart model={model} />
      <TopDebtors model={model} onOpenStatement={onOpenStatement} />
    </div>
  );
}
