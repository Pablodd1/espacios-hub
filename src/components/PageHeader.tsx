import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  /** Display XL title. */
  title: string;
  /** Secondary caption line (Inter 13px, muted). */
  caption?: string;
  /** Right-aligned actions (buttons). */
  actions?: ReactNode;
  className?: string;
}

/**
 * Page header — title word-level rise + actions slide-in per design.md §6.
 */
export default function PageHeader({ title, caption, actions, className }: PageHeaderProps) {
  const words = title.split(' ');
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-4', className)}>
      <div>
        <h1 className="font-display text-[30px] font-bold leading-9 tracking-[-0.02em] text-txt-primary">
          {words.map((word, i) => (
            <motion.span
              key={`${word}-${i}`}
              className="inline-block"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              {word}
              {i < words.length - 1 ? ' ' : ''}
            </motion.span>
          ))}
        </h1>
        {caption && (
          <motion.p
            className="mt-1.5 text-[13px] text-txt-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            {caption}
          </motion.p>
        )}
      </div>
      {actions && (
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          {actions}
        </motion.div>
      )}
    </div>
  );
}
