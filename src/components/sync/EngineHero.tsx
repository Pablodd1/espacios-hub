import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Pause, Play, Settings2, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@/i18n';
import { cn } from '@/lib/utils';

/** 12px live pulse dot — hero variant of the signature pulse. */
function HeroDot({ color }: { color: string }) {
  return (
    <span className="relative inline-flex size-3 shrink-0">
      <span
        className="absolute inline-flex size-3 rounded-full motion-safe:animate-[live-pulse_2s_ease-out_infinite]"
        style={{ backgroundColor: color, boxShadow: `0 0 12px 2px ${color}` }}
      />
      <span className="relative inline-flex size-3 rounded-full" style={{ backgroundColor: color }} />
    </span>
  );
}

interface ConnChipProps {
  dot: string;
  label: string;
  detail: string;
  ok?: boolean;
}

/** Connectivity pill — SystemChip styling + latency readout. */
function ConnChip({ dot, label, detail, ok = true }: ConnChipProps) {
  return (
    <span className="inline-flex h-[26px] items-center gap-1.5 rounded-md border border-hairline bg-inset px-2.5">
      <span className="size-1.5 rounded-full" style={{ backgroundColor: dot }} />
      <span className="text-xs font-semibold text-txt-primary">{label}</span>
      <span className="text-[11px] text-txt-muted">{detail}</span>
      {ok && <span className="font-mono-data text-[10px] font-semibold" style={{ color: 'var(--brand)' }}>OK</span>}
    </span>
  );
}

interface EngineHeroProps {
  paused: boolean;
  queue: number;
  onPause: () => void;
  onResume: () => void;
}

/** [A] Engine status hero — live heartbeat, connectivity chips, pause/resume. */
export default function EngineHero({ paused, queue, onPause, onResume }: EngineHeroProps) {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [beat, setBeat] = useState(12);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Heartbeat ticks every second; resets on each 15s poll cycle.
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setBeat((b) => (b + 1) % 15), 1000);
    return () => window.clearInterval(id);
  }, [paused]);

  const dotColor = paused ? 'var(--warning)' : 'var(--sync)';
  const beatText = lang === 'es' ? `hace ${beat} s` : `${beat} s ago`;

  return (
    <motion.section
      className="grid grid-cols-12 gap-5 rounded-xl border bg-elevated p-6 transition-colors duration-200"
      style={{ borderColor: paused ? 'rgba(245,165,36,0.45)' : 'var(--border-hairline)' }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Left: status line + caption + connectivity */}
      <div className="col-span-12 xl:col-span-7">
        <div className="flex items-center gap-3.5">
          <HeroDot color={dotColor} />
          <AnimatePresence mode="wait">
            <motion.h1
              key={paused ? 'off' : 'on'}
              className="font-display text-[26px] font-semibold leading-8 tracking-[-0.015em] text-txt-primary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {paused ? t('sync.engineOff') : t('sync.engineOn')}
            </motion.h1>
          </AnimatePresence>
        </div>
        <div className="mt-2 h-5 text-[13px] text-txt-muted">
          <AnimatePresence mode="wait">
            <motion.p
              key={paused ? 'paused' : 'running'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {paused
                ? `${t('sync.queue')}: ${queue} ${t('sync.jobsWord')} · ${t('sync.pausedNote')}`
                : `${t('sync.lastBeat')} ${beatText} · ${t('sync.queue')}: ${queue} ${t('sync.jobsWord')} · ${t('sync.retriesOn')}`}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <ConnChip dot="var(--siigo)" label="SIIGO API" detail={`${t('sync.connected')} · 84 ms`} />
          <ConnChip dot="var(--hgi)" label="HGI SQL" detail={`${t('sync.connected')} · 12 ms`} />
          <ConnChip dot="var(--whatsapp)" label={t('sync.whatsappApi')} detail={t('sync.connected')} />
        </div>
      </div>

      {/* Right: controls */}
      <div className="col-span-12 flex items-center justify-start gap-3 xl:col-span-5 xl:justify-end">
        {paused ? (
          <motion.button
            type="button"
            onClick={onResume}
            className="flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-canvas transition-colors duration-100 ease-standard hover:bg-brand-hover"
            style={{ boxShadow: '0 0 0 1px rgba(22,199,132,.35), 0 4px 24px -4px rgba(22,199,132,.35)' }}
            whileTap={{ scale: 0.97 }}
          >
            <Play className="size-4" strokeWidth={2} />
            {t('sync.resume')}
          </motion.button>
        ) : (
          <motion.button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="flex h-10 items-center gap-2 rounded-lg border border-brand px-4 text-sm font-semibold text-brand transition-colors duration-100 ease-standard hover:bg-brand-dim"
            whileTap={{ scale: 0.97 }}
          >
            <Pause className="size-4" strokeWidth={2} />
            {t('sync.pause')}
          </motion.button>
        )}
        <button
          type="button"
          onClick={() => navigate('/configuracion')}
          className="flex h-10 items-center gap-2 rounded-lg border border-border-strong px-4 text-sm font-medium text-txt-secondary transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary"
        >
          <Settings2 className="size-4" strokeWidth={1.75} />
          {t('nav.config')}
        </button>
      </div>

      {/* Pause confirm modal — danger-tinted */}
      <AnimatePresence>
        {confirmOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-[rgba(4,6,10,0.6)] backdrop-blur-[8px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal
              aria-label={t('sync.pauseTitle')}
              className="fixed left-1/2 top-1/2 z-50 w-[440px] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border-strong bg-overlay p-6 shadow-2xl"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-start justify-between">
                <h2 className="font-display text-[17px] font-semibold text-txt-primary">{t('sync.pauseTitle')}</h2>
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  aria-label={t('action.cancel')}
                  className="rounded-md p-1 text-txt-muted transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary"
                >
                  <X className="size-4" strokeWidth={1.75} />
                </button>
              </div>
              <p className="mt-2 text-sm text-txt-secondary">{t('sync.pauseBody')}</p>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  className="h-9 rounded-lg px-4 text-sm font-medium text-txt-secondary transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary"
                >
                  {t('action.cancel')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmOpen(false);
                    onPause();
                  }}
                  className={cn(
                    'h-9 rounded-lg bg-danger px-4 text-sm font-semibold text-white transition-all duration-100 ease-standard',
                    'hover:brightness-110 active:scale-[0.97]',
                  )}
                >
                  {t('sync.pauseConfirm')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
