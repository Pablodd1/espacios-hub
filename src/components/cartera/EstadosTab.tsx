import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, MessageCircle, Search } from 'lucide-react';
import { useLanguage } from '@/i18n';
import { cn } from '@/lib/utils';
import { REFERENCE_NOW } from '@/lib/data';
import { interp } from './model';
import type { CarteraModel, ClienteCartera } from './model';

/* ==================== Client selector ==================== */

function ClientSelector({
  model,
  selectedId,
  onSelect,
}: {
  model: CarteraModel;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { t, formatCOPCompact } = useLanguage();
  const [query, setQuery] = useState('');

  const clientes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return model.clientes;
    return model.clientes.filter(
      (c) => c.tercero.nombre.toLowerCase().includes(q) || (c.tercero.nit?.toLowerCase().includes(q) ?? false),
    );
  }, [model.clientes, query]);

  return (
    <div className="col-span-12 flex flex-col rounded-xl border border-hairline bg-elevated lg:col-span-4">
      <div className="border-b border-hairline p-3">
        <p className="text-overline px-1 pb-2 text-txt-muted">{t('cart.stmt.selectorTitle')}</p>
        <div className="flex h-9 items-center gap-2 rounded-lg bg-inset px-3">
          <Search className="size-4 shrink-0 text-txt-muted" strokeWidth={1.75} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('cart.stmt.searchPh')}
            className="w-full bg-transparent text-[13px] text-txt-primary outline-none placeholder:text-txt-muted"
          />
        </div>
      </div>
      <ul className="flex max-h-[520px] flex-col gap-0.5 overflow-y-auto p-2">
        {clientes.map((c) => {
          const active = c.tercero.id === selectedId;
          const vencido = c.maxDiasVencido > 0;
          return (
            <li key={c.tercero.id}>
              <button
                type="button"
                onClick={() => onSelect(c.tercero.id)}
                aria-pressed={active}
                className={cn(
                  'relative w-full rounded-lg px-3 py-2.5 text-left transition-colors duration-180 ease-standard',
                  active ? 'bg-brand-dim' : 'hover:bg-[var(--bg-hover)]',
                )}
              >
                {active && <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand" />}
                <span className="flex items-center justify-between gap-2">
                  <span className={cn('truncate text-[13px] font-medium', active ? 'text-txt-primary' : 'text-txt-secondary')}>
                    {c.tercero.nombre}
                  </span>
                  <span className="tabular shrink-0 font-mono-data text-[13px] text-txt-primary">{formatCOPCompact(c.saldo)}</span>
                </span>
                <span className="mt-1 flex items-center justify-between gap-2">
                  <span className="font-mono-data text-[11px] text-txt-muted">{c.tercero.nit ?? '—'}</span>
                  {vencido ? (
                    <span
                      className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
                      style={{ backgroundColor: 'var(--warning-dim)', color: 'var(--warning)' }}
                    >
                      {interp(t('cart.debtors.diasVencido'), { n: c.maxDiasVencido })}
                    </span>
                  ) : (
                    <span
                      className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
                      style={{ backgroundColor: 'var(--brand-dim)', color: 'var(--brand)' }}
                    >
                      {t('cart.debtors.alDia')}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ==================== Statement preview ==================== */

function StatementPreview({ cliente, onSendWhatsApp }: { cliente: ClienteCartera; onSendWhatsApp: (id: string) => void }) {
  const { t, formatCOP, formatDate } = useLanguage();
  const { tercero, facturas } = cliente;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tercero.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="col-span-12 lg:col-span-8"
      >
        {/* Printable document card */}
        <div className="rounded-xl border border-hairline bg-elevated p-6">
          {/* Doc header */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-hairline pb-5">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="" className="size-10" />
              <div>
                <p className="font-display text-[15px] font-bold tracking-[0.02em] text-txt-primary">{t('app.company')}</p>
                <p className="text-[13px] text-txt-secondary">{t('cart.stmt.docTitle')}</p>
              </div>
            </div>
            <p className="rounded-lg bg-inset px-3 py-1.5 font-mono-data text-[12px] text-txt-secondary">
              {interp(t('cart.stmt.corte'), { fecha: formatDate(REFERENCE_NOW, 'day') })}
            </p>
          </div>

          {/* Client block */}
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-hairline py-4">
            <p className="font-display text-[17px] font-semibold text-txt-primary">{tercero.nombre}</p>
            <p className="font-mono-data text-[12px] text-txt-secondary">NIT {tercero.nit ?? '—'}</p>
            {tercero.zona && <p className="text-[12px] text-txt-muted">· {tercero.zona}</p>}
          </div>

          {/* Invoice table */}
          {facturas.length > 0 ? (
            <table className="mt-2 w-full border-collapse text-left">
              <thead>
                <tr className="h-9 border-b border-hairline">
                  <th className="text-overline pr-4 font-semibold text-txt-muted">{t('cart.stmt.colFactura')}</th>
                  <th className="text-overline pr-4 font-semibold text-txt-muted">{t('common.date')}</th>
                  <th className="text-overline pr-4 font-semibold text-txt-muted">{t('cart.stmt.colVence')}</th>
                  <th className="text-overline px-4 text-right font-semibold text-txt-muted">{t('common.amount')}</th>
                  <th className="text-overline px-4 text-right font-semibold text-txt-muted">{t('cart.stmt.colAbonos')}</th>
                  <th className="text-overline pl-4 text-right font-semibold text-txt-muted">{t('cart.stmt.colSaldo')}</th>
                </tr>
              </thead>
              <tbody>
                {facturas.map((f, i) => (
                  <motion.tr
                    key={f.doc.id}
                    className="h-11 border-b border-hairline last:border-b-0"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: 0.05 + i * 0.02, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <td className="pr-4 font-mono-data text-[13px] text-txt-primary">{f.doc.numero}</td>
                    <td className="pr-4 text-[13px] text-txt-secondary">{formatDate(f.doc.fecha, 'day')}</td>
                    <td className="pr-4 text-[13px] text-txt-secondary">{formatDate(f.vence, 'day')}</td>
                    <td className="tabular px-4 text-right font-mono-data text-[13px] text-txt-primary">{formatCOP(f.doc.valor)}</td>
                    <td className="tabular px-4 text-right font-mono-data text-[13px] text-txt-secondary">{formatCOP(f.abono)}</td>
                    <td className="tabular pl-4 text-right font-mono-data text-[13px] font-semibold text-txt-primary">
                      {formatCOP(f.saldo)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border-strong">
                  <td colSpan={5} className="py-3 text-right text-[13px] font-semibold text-txt-secondary">
                    {t('cart.stmt.totalSaldo')}
                  </td>
                  <td className="tabular py-3 pl-4 text-right font-mono-data text-[15px] font-semibold text-txt-primary">
                    {formatCOP(cliente.saldo)}
                  </td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <p className="py-8 text-center text-[13px] text-txt-muted">{t('cart.stmt.noFacturas')}</p>
          )}

          {/* Anticipo note */}
          {cliente.anticipo > 0 && (
            <div className="mt-3 inline-flex rounded-lg bg-brand-dim px-3 py-2 text-[13px] font-medium" style={{ color: 'var(--brand)' }}>
              {interp(t('cart.stmt.anticipo'), { valor: formatCOP(cliente.anticipo) })}
            </div>
          )}

          {/* Actions */}
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-hairline pt-5">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex h-9 items-center gap-2 rounded-lg border border-border-strong px-4 text-sm font-medium text-txt-secondary transition-colors duration-180 hover:bg-[var(--bg-hover)] hover:text-txt-primary"
            >
              <Download className="size-4" strokeWidth={1.75} />
              {t('cart.stmt.downloadPdf')}
            </button>
            <button
              type="button"
              onClick={() => onSendWhatsApp(tercero.id)}
              className="flex h-9 items-center gap-2 rounded-lg bg-whatsapp px-4 text-sm font-semibold text-white transition-all duration-100 ease-standard hover:brightness-110 active:scale-[0.97]"
              style={{ boxShadow: '0 0 0 1px rgba(37,211,102,.35), 0 4px 24px -4px rgba(37,211,102,.35)' }}
            >
              <MessageCircle className="size-4" strokeWidth={1.75} />
              {t('action.sendWhatsApp')}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ==================== Tab ==================== */

export default function EstadosTab({
  model,
  selectedId,
  onSelect,
  onSendWhatsApp,
}: {
  model: CarteraModel;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onSendWhatsApp: (id: string) => void;
}) {
  const cliente = model.clientes.find((c) => c.tercero.id === selectedId) ?? model.clientes[0];
  return (
    <div className="grid grid-cols-12 gap-5">
      <ClientSelector model={model} selectedId={cliente?.tercero.id ?? null} onSelect={onSelect} />
      {cliente && <StatementPreview cliente={cliente} onSendWhatsApp={onSendWhatsApp} />}
    </div>
  );
}
