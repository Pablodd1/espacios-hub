import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, X } from 'lucide-react';
import { useLanguage } from '@/i18n';
import { cn } from '@/lib/utils';

export interface NewContainerForm {
  numero: string;
  bl: string;
  origen: string;
  puerto: string;
  producto: string;
  codigo: string;
  cantidad: number | null;
  fechaZarpe: string;
  eta: string;
}

const ORIGENES = ['Shanghái', 'Ningbo'];
const DESTINOS = ['Buenaventura', 'Cartagena'];

type SubmitStep = 'idle' | 'saving' | 'hgi' | 'pbi' | 'ia';

const STEP_ORDER: Exclude<SubmitStep, 'idle'>[] = ['saving', 'hgi', 'pbi', 'ia'];

const inputCls =
  'h-10 w-full rounded-lg border border-border-strong bg-inset px-3 text-sm text-txt-primary placeholder:text-txt-muted focus:border-[var(--sync)] focus:outline-none transition-colors [color-scheme:dark]';

const fieldVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

function Field({ label, children, span2 = false }: { label: string; children: React.ReactNode; span2?: boolean }) {
  return (
    <motion.label variants={fieldVariants} className={cn('flex flex-col gap-1.5', span2 && 'col-span-2')}>
      <span className="text-overline text-txt-muted">{label}</span>
      {children}
    </motion.label>
  );
}

interface NewContainerModalProps {
  open: boolean;
  onClose: () => void;
  /** Called with the form once the register+distribute sequence completes. */
  onRegistered: (form: NewContainerForm) => void;
}

/** §G — New container modal: single entry form + in-button distribution progress. */
export default function NewContainerModal({ open, onClose, onRegistered }: NewContainerModalProps) {
  const { t } = useLanguage();
  const [form, setForm] = useState<NewContainerForm>({
    numero: '',
    bl: '',
    origen: ORIGENES[0],
    puerto: DESTINOS[0],
    producto: '',
    codigo: '',
    cantidad: null,
    fechaZarpe: '',
    eta: '',
  });
  const [step, setStep] = useState<SubmitStep>('idle');
  const busy = step !== 'idle';

  const set = <K extends keyof NewContainerForm>(key: K, value: NewContainerForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = () => {
    if (busy) return;
    setStep('saving');
    // Inline step indicator: Guardando → HGI → Power BI → IA (150ms cross-fade per label swap)
    STEP_ORDER.forEach((s, i) => {
      window.setTimeout(() => setStep(s), i * 550);
    });
    window.setTimeout(() => {
      onRegistered(form);
      setStep('idle');
      setForm({ numero: '', bl: '', origen: ORIGENES[0], puerto: DESTINOS[0], producto: '', codigo: '', cantidad: null, fechaZarpe: '', eta: '' });
    }, STEP_ORDER.length * 550 + 250);
  };

  const stepLabel: Record<Exclude<SubmitStep, 'idle'>, string> = {
    saving: t('comex.stepSaving'),
    hgi: t('comex.stepHgi'),
    pbi: t('comex.stepPbi'),
    ia: t('comex.stepIa'),
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-[rgba(4,6,10,0.6)] backdrop-blur-[8px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={busy ? undefined : onClose}
          />
          <motion.div
            role="dialog"
            aria-modal
            aria-label={t('comex.new')}
            className="fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[560px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border-strong bg-overlay p-6 shadow-2xl"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-[17px] font-semibold text-txt-primary">{t('comex.new')}</h2>
                <p className="mt-1 text-[13px] text-txt-muted">{t('comex.modalCaption')}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                aria-label={t('action.close')}
                className="rounded-md p-1 text-txt-muted transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary disabled:opacity-40"
              >
                <X className="size-4" strokeWidth={1.75} />
              </button>
            </div>

            <motion.div
              className="mt-5 grid grid-cols-2 gap-4"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.03 } } }}
            >
              <Field label={t('comex.formNumero')}>
                <input
                  className={cn(inputCls, 'font-mono-data')}
                  placeholder={t('comex.formNumeroPlaceholder')}
                  value={form.numero}
                  onChange={(e) => set('numero', e.target.value.toUpperCase())}
                  required
                />
              </Field>
              <Field label={t('comex.formBl')}>
                <input className={cn(inputCls, 'font-mono-data')} value={form.bl} onChange={(e) => set('bl', e.target.value.toUpperCase())} />
              </Field>
              <Field label={t('comex.formOrigen')}>
                <select className={inputCls} value={form.origen} onChange={(e) => set('origen', e.target.value)}>
                  {ORIGENES.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                  <option value="Otro">{t('comex.portOther')}</option>
                </select>
              </Field>
              <Field label={t('comex.formDestino')}>
                <select className={inputCls} value={form.puerto} onChange={(e) => set('puerto', e.target.value)}>
                  {DESTINOS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t('comex.formProducto')}>
                <input className={inputCls} value={form.producto} onChange={(e) => set('producto', e.target.value)} />
              </Field>
              <Field label={t('comex.formCodigo')}>
                <input className={cn(inputCls, 'font-mono-data')} value={form.codigo} onChange={(e) => set('codigo', e.target.value.toUpperCase())} />
              </Field>
              <Field label={t('comex.formCantidad')}>
                <input
                  type="number"
                  min={0}
                  className={cn(inputCls, 'tabular font-mono-data')}
                  value={form.cantidad ?? ''}
                  onChange={(e) => set('cantidad', e.target.value === '' ? null : Number(e.target.value))}
                />
              </Field>
              <Field label={t('comex.formZarpe')}>
                <input type="date" className={inputCls} value={form.fechaZarpe} onChange={(e) => set('fechaZarpe', e.target.value)} />
              </Field>
              <Field label={t('comex.formEta')}>
                <input type="date" className={inputCls} value={form.eta} onChange={(e) => set('eta', e.target.value)} />
              </Field>
            </motion.div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                className="h-9 rounded-lg px-4 text-sm font-medium text-txt-secondary transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary disabled:opacity-40"
              >
                {t('action.cancel')}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={busy || form.numero.trim() === ''}
                className="relative inline-flex h-9 min-w-52 items-center justify-center gap-2 overflow-hidden rounded-lg bg-brand px-4 text-sm font-semibold text-canvas transition-all duration-100 ease-standard hover:bg-brand-hover active:scale-[0.97] disabled:cursor-default disabled:opacity-70"
                style={{ boxShadow: '0 0 0 1px rgba(22,199,132,.35), 0 4px 24px -4px rgba(22,199,132,.35)' }}
              >
                {busy && <Loader2 className="size-4 animate-spin" strokeWidth={2} />}
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={step}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                  >
                    {busy ? stepLabel[step as Exclude<SubmitStep, 'idle'>] : t('comex.register')}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
