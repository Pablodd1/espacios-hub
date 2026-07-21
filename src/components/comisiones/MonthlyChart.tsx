import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useLanguage } from '@/i18n';
import type { Lang } from '@/i18n';
import { cn } from '@/lib/utils';
import type { MonthlyPoint, VendorRow } from './aggregate';
import { VENDOR_PALETTE, monthlySeries } from './aggregate';

function monthLabel(month: number, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-CO' : 'en-US', { month: 'short' }).format(new Date(2026, month - 1, 1));
}

interface ChartTooltipProps {
  active?: boolean;
  label?: number;
  payload?: { value?: number; dataKey?: string; fill?: string }[];
  names: string[];
}

function ChartTooltip({ active, label, payload, names }: ChartTooltipProps) {
  const { lang, formatCOPCompact } = useLanguage();
  if (!active || !payload || payload.length === 0) return null;
  const total = payload.reduce((acc, p) => acc + (p.value ?? 0), 0);
  return (
    <div className="rounded-lg border border-border-strong bg-overlay px-3 py-2 shadow-xl">
      <p className="mb-1 text-[11px] capitalize text-txt-muted">{typeof label === 'number' ? monthLabel(label, lang) : label} 2026</p>
      {names.map((name, i) => {
        const p = payload.find((x) => x.dataKey === name);
        if (!p) return null;
        return (
          <p key={name} className="font-mono-data text-xs text-txt-primary">
            <span className="mr-1.5 inline-block size-1.5 rounded-full" style={{ backgroundColor: VENDOR_PALETTE[i % VENDOR_PALETTE.length] }} />
            {name}: {formatCOPCompact(p.value ?? 0)}
          </p>
        );
      })}
      <p className="tabular mt-1 border-t border-hairline pt-1 font-mono-data text-xs font-semibold text-txt-primary">
        Total: {formatCOPCompact(total)}
      </p>
    </div>
  );
}

interface MonthlyChartProps {
  vendors: VendorRow[];
}

/** [C2] Comisiones por mes — stacked BarChart feb…jul, one segment per vendor, toggleable legend. */
export default function MonthlyChart({ vendors }: MonthlyChartProps) {
  const { t, lang, formatCOPCompact } = useLanguage();
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const { points, names } = useMemo(() => monthlySeries(vendors), [vendors]);
  const data = useMemo(
    () =>
      points.map((p: MonthlyPoint) => ({
        ...p,
        label: monthLabel(p.month as number, lang),
      })),
    [points, lang],
  );

  const toggle = (name: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <motion.section
      className="col-span-12 flex flex-col rounded-xl border border-hairline bg-elevated p-5 xl:col-span-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.25 }}
    >
      <div className="mb-4">
        <h2 className="font-display text-[17px] font-semibold leading-6 text-txt-primary">{t('comi.chartTitle')}</h2>
        <p className="mt-0.5 text-xs text-txt-muted">{t('comi.chartCaption')}</p>
      </div>

      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -14 }} barCategoryGap="30%">
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'Inter' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'Inter' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => formatCOPCompact(v)}
              width={64}
            />
            <Tooltip content={<ChartTooltip names={names} />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            {names.map((name, i) => (
              <Bar
                key={name}
                dataKey={name}
                stackId="comisiones"
                fill={VENDOR_PALETTE[i % VENDOR_PALETTE.length]}
                fillOpacity={hidden.has(name) ? 0.08 : 1}
                radius={i === names.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                isAnimationActive
                animationDuration={500}
                animationEasing="ease-out"
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend chips — click fades series 200ms */}
      <div className="mt-4 flex flex-wrap gap-1.5 border-t border-hairline pt-3.5">
        {names.map((name, i) => {
          const off = hidden.has(name);
          return (
            <button
              key={name}
              type="button"
              aria-pressed={!off}
              onClick={() => toggle(name)}
              className={cn(
                'flex h-7 items-center gap-1.5 rounded-md bg-inset px-2.5 text-[11px] font-medium transition-opacity duration-200',
                off ? 'opacity-40' : 'opacity-100 hover:bg-overlay',
              )}
            >
              <span className="size-1.5 rounded-full" style={{ backgroundColor: VENDOR_PALETTE[i % VENDOR_PALETTE.length] }} />
              <span className="text-txt-secondary">{name}</span>
            </button>
          );
        })}
      </div>
    </motion.section>
  );
}
