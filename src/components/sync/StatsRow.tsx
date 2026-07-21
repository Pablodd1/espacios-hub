import { useMemo } from 'react';
import { motion } from 'framer-motion';
import KpiCard from '@/components/KpiCard';
import { useLanguage } from '@/i18n';
import { computeSyncStats } from './stats';

/** [B] Stats row — 4 compact KPI chips derived from sync_jobs (last 24h). */
export default function StatsRow() {
  const { t, formatNumber, formatPercent } = useLanguage();
  const stats = useMemo(() => computeSyncStats(), []);

  const cards = [
    {
      label: t('sync.statsJobs24h'),
      value: stats.jobs24h,
      format: (v: number) => formatNumber(Math.round(v)),
      spark: { data: stats.sparkJobs, color: 'var(--sync)' },
    },
    {
      label: t('sync.statsSuccess'),
      value: stats.tasaExito,
      format: (v: number) => formatPercent(v),
      spark: { data: stats.sparkSuccess, color: 'var(--brand)' },
    },
    {
      label: t('sync.statsAvg'),
      value: stats.avgDur,
      format: (v: number) => `${formatNumber(v, 1)} s`,
      spark: { data: stats.sparkDur, color: 'var(--violet)' },
    },
    {
      label: t('sync.statsRetries'),
      value: stats.retriesHoy,
      format: (v: number) => formatNumber(Math.round(v)),
      spark: { data: stats.sparkRetries, color: 'var(--warning)' },
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-5 xl:grid-cols-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
        >
          <KpiCard label={card.label} value={card.value} format={card.format} spark={card.spark} />
        </motion.div>
      ))}
    </div>
  );
}
