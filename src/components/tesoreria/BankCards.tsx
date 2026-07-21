import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import SystemChip from '@/components/SystemChip';
import { useCountUp } from '@/hooks/use-count-up';
import { useLanguage } from '@/i18n';
import type { Banco } from '@/lib/types';
import { cn } from '@/lib/utils';
import { getBankMeta } from './bank-meta';

export interface BankCardData {
  banco: Banco;
  /** Egresos dated today for this bank. */
  egresosHoy: number;
  /** Docs not yet synchronized (pendiente / error / diferencia). */
  pendientes: number;
}

function CardSpark({ data, color }: { data: number[]; color: string }) {
  const w = 56;
  const h = 40;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (w - 4) + 2;
    const y = h - 3 - ((v - min) / range) * (h - 8);
    return [x, y] as const;
  });
  const line = pts.map(([x, y]) => `${x},${y}`).join(' ');
  const area = `2,${h - 2} ${line} ${w - 2},${h - 2}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <polygon points={area} fill={color} opacity={0.1} />
      <motion.polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }}
      />
    </svg>
  );
}

function BankCard({ data, selected, onToggle, index }: { data: BankCardData; selected: boolean; onToggle: () => void; index: number }) {
  const { t, formatCOP, formatNumber } = useLanguage();
  const meta = getBankMeta(data.banco);
  const balance = useCountUp(meta.saldo);

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={cn(
        'flex flex-col rounded-xl border bg-elevated p-5 text-left',
        'transition-[border-color,transform,background-color] duration-180 ease-standard hover:-translate-y-0.5',
        selected ? 'border-brand/60 bg-brand-dim/40' : 'border-hairline hover:border-border-strong',
      )}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay: 0.08 + index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Top: name + SIIGO→HGI account mapping */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-[17px] font-semibold leading-6 text-txt-primary">Banco {data.banco.nombre}</h3>
        <span className="flex items-center gap-1" title={t('teso.accountMapping')}>
          <SystemChip system="siigo" />
          <span className="font-mono-data text-[11px] text-txt-muted">{meta.siigoCuenta}</span>
          <ArrowRight className="mx-0.5 size-3" style={{ color: 'var(--sync)' }} strokeWidth={2} />
          <SystemChip system="hgi" />
          <span className="font-mono-data text-[11px] text-txt-muted">{meta.hgiCuenta}</span>
        </span>
      </div>

      <p className="text-overline mt-3 text-txt-muted">
        {t('teso.currentAccount')} · <span className="font-mono-data normal-case tracking-normal">{meta.mask}</span>
      </p>

      {/* Balance + sparkline */}
      <div className="mt-1.5 flex items-end justify-between gap-3">
        <p className="tabular font-display text-2xl font-semibold leading-8 tracking-[-0.015em] text-txt-primary">
          {formatCOP(Math.round(balance))}
        </p>
        <CardSpark data={meta.spark} color={data.pendientes > 0 ? 'var(--warning)' : 'var(--brand)'} />
      </div>

      {/* Footer status line */}
      <div className="mt-3 flex items-center justify-between border-t border-hairline pt-3">
        <p className="text-xs text-txt-muted">
          <span className="tabular">{formatNumber(data.egresosHoy)}</span> {t('teso.egresosHoy')}
        </p>
        {data.pendientes > 0 ? (
          <motion.span
            className="rounded-md bg-warning-dim px-1.5 py-0.5 text-[11px] font-semibold"
            style={{ color: 'var(--warning)' }}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.22, delay: 0.5 + index * 0.06, ease: [0.3, 1.4, 0.5, 1] }}
          >
            <span className="tabular">{formatNumber(data.pendientes)}</span> {t('teso.pendientes')}
          </motion.span>
        ) : (
          <span className="text-xs font-medium text-brand">
            <span className="tabular">0</span> {t('teso.pendientes')}
          </span>
        )}
      </div>
    </motion.button>
  );
}

interface BankCardsProps {
  items: BankCardData[];
  selectedIds: Set<string>;
  onToggle: (bancoId: string) => void;
}

/** Bank account cards grid (tesoreria.md §[B]) — stagger 60ms, count-up balances. */
export default function BankCards({ items, selectedIds, onToggle }: BankCardsProps) {
  return (
    <div className="grid grid-cols-12 gap-5">
      {items.map((item, i) => (
        <div key={item.banco.id} className="col-span-12 md:col-span-6 xl:col-span-4">
          <BankCard
            data={item}
            index={i}
            selected={selectedIds.has(item.banco.id)}
            onToggle={() => onToggle(item.banco.id)}
          />
        </div>
      ))}
    </div>
  );
}
