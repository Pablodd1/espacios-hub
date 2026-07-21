import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, RefreshCw } from 'lucide-react';

interface ToastProps {
  visible: boolean;
  title: string;
  description?: string;
  variant?: 'success' | 'sync';
}

/**
 * Bottom-right toast per design.md §6.6 — y 16→0, easeSnap 220ms.
 * The owning component controls auto-dismiss timing.
 */
export default function Toast({ visible, title, description, variant = 'success' }: ToastProps) {
  const Icon = variant === 'sync' ? RefreshCw : CheckCircle2;
  const color = variant === 'sync' ? 'var(--sync)' : 'var(--brand)';
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          className="fixed bottom-6 right-6 z-[70] flex w-[360px] items-start gap-3 rounded-xl border border-border-strong bg-overlay p-4 shadow-2xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.22, ease: [0.3, 1.4, 0.5, 1] }}
        >
          <Icon className="mt-0.5 size-5 shrink-0" style={{ color }} strokeWidth={1.75} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-txt-primary">{title}</p>
            {description && <p className="mt-0.5 text-xs text-txt-muted">{description}</p>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
