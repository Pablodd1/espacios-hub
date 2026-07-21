import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useCountUp } from '@/hooks/use-count-up';
import { useLanguage } from '@/i18n';
import { cn } from '@/lib/utils';
import { buildCarteraModel } from '@/components/cartera/model';
import ResumenTab from '@/components/cartera/ResumenTab';
import RecibosTab from '@/components/cartera/RecibosTab';
import EstadosTab from '@/components/cartera/EstadosTab';
import WhatsAppTab from '@/components/cartera/WhatsAppTab';
import ReconTab from '@/components/cartera/ReconTab';

type CarteraTab = 'resumen' | 'recibos' | 'estados' | 'whatsapp' | 'recon';

const TABS: { key: CarteraTab; labelKey: 'cart.tab.resumen' | 'cart.tab.receipts' | 'cart.tab.statements' | 'cart.tab.whatsapp' | 'cart.tab.recon' }[] = [
  { key: 'resumen', labelKey: 'cart.tab.resumen' },
  { key: 'recibos', labelKey: 'cart.tab.receipts' },
  { key: 'estados', labelKey: 'cart.tab.statements' },
  { key: 'whatsapp', labelKey: 'cart.tab.whatsapp' },
  { key: 'recon', labelKey: 'cart.tab.recon' },
];

/* ==================== [A] KPI chips (compact, count-up 700ms) ==================== */

type ChipTone = 'default' | 'danger' | 'warning';

function KpiChip({
  label,
  value,
  format,
  tone = 'default',
  index,
}: {
  label: string;
  value: number;
  format: (v: number) => string;
  tone?: ChipTone;
  index: number;
}) {
  const animated = useCountUp(value, 700);
  const color =
    tone === 'danger' ? 'var(--danger)' : tone === 'warning' ? 'var(--warning)' : 'var(--text-primary)';
  return (
    <motion.div
      className="rounded-xl border border-hairline bg-elevated px-4 py-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 + index * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      <p className="text-overline text-txt-muted">{label}</p>
      <p className="tabular mt-1 font-display text-[20px] font-semibold leading-6 tracking-[-0.02em]" style={{ color }}>
        {format(animated)}
      </p>
    </motion.div>
  );
}

/* ==================== Toast ==================== */

function CarteraToast({ text }: { text: string | null }) {
  return (
    <AnimatePresence>
      {text && (
        <motion.div
          className="fixed bottom-6 right-6 z-[60] flex w-[360px] items-start gap-3 rounded-xl border border-border-strong bg-overlay p-4 shadow-2xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.22, ease: [0.3, 1.4, 0.5, 1] }}
          role="status"
        >
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand" strokeWidth={1.75} />
          <p className="text-sm font-medium text-txt-primary">{text}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ==================== Page ==================== */

export default function Cartera() {
  const { t, formatCOPCompact, formatNumber } = useLanguage();
  const model = useMemo(() => buildCarteraModel(), []);
  const [tab, setTab] = useState<CarteraTab>('resumen');
  const [statementClientId, setStatementClientId] = useState<string | null>(null);
  const [waPreselectId, setWaPreselectId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const notify = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(null), 4500);
  };

  const openStatement = (terceroId: string) => {
    setStatementClientId(terceroId);
    setTab('estados');
  };

  const sendWhatsAppTo = (terceroId: string) => {
    setWaPreselectId(terceroId);
    setTab('whatsapp');
  };

  const chips: { label: string; value: number; format: (v: number) => string; tone: ChipTone }[] = [
    { label: t('cart.kpi.total'), value: model.totalCartera, format: formatCOPCompact, tone: 'default' },
    { label: t('cart.kpi.vencida'), value: model.totalVencida, format: formatCOPCompact, tone: model.totalVencida > 0 ? 'danger' : 'default' },
    { label: t('cart.kpi.recibosHoy'), value: model.recibosHoy, format: (v) => formatNumber(Math.round(v)), tone: 'default' },
    {
      label: t('cart.kpi.pendientesSync'),
      value: model.recibosPendientes,
      format: (v) => formatNumber(Math.round(v)),
      tone: model.recibosPendientes > 0 ? 'warning' : 'default',
    },
  ];

  return (
    <motion.div
      className="flex flex-col gap-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* [A] Persistent header: title + caption + KPI chips */}
      <PageHeader
        title={t('cart.title')}
        caption={t('cart.caption')}
        actions={
          <>
            {chips.map((c, i) => (
              <KpiChip key={c.label} label={c.label} value={c.value} format={c.format} tone={c.tone} index={i} />
            ))}
          </>
        }
      />

      {/* Tab bar — animated underline (layoutId, 220ms) */}
      <div role="tablist" aria-label={t('cart.title')} className="flex items-center gap-1 border-b border-hairline">
        {TABS.map(({ key, labelKey }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(key)}
              className={cn(
                'relative px-3.5 pb-2.5 pt-2 text-sm font-medium transition-colors duration-180 ease-standard',
                active ? 'text-txt-primary' : 'text-txt-muted hover:text-txt-secondary',
              )}
            >
              {t(labelKey)}
              {active && (
                <motion.span
                  layoutId="cart-tab"
                  className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand"
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content — swap 220ms */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          {tab === 'resumen' && <ResumenTab model={model} onOpenStatement={openStatement} />}
          {tab === 'recibos' && <RecibosTab notify={notify} />}
          {tab === 'estados' && (
            <EstadosTab model={model} selectedId={statementClientId} onSelect={setStatementClientId} onSendWhatsApp={sendWhatsAppTo} />
          )}
          {tab === 'whatsapp' && <WhatsAppTab model={model} preselectId={waPreselectId} notify={notify} />}
          {tab === 'recon' && <ReconTab model={model} notify={notify} />}
        </motion.div>
      </AnimatePresence>

      <CarteraToast text={toast} />
    </motion.div>
  );
}
