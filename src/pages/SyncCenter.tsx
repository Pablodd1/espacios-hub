import { useEffect, useMemo, useRef, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { useLanguage } from '@/i18n';
import { syncJobs } from '@/lib/data';
import type { SyncJob } from '@/lib/types';
import AuditTimeline from '@/components/sync/AuditTimeline';
import EngineHero from '@/components/sync/EngineHero';
import JobDrawer from '@/components/sync/JobDrawer';
import JobsTable from '@/components/sync/JobsTable';
import type { JobOverride } from '@/components/sync/JobsTable';
import ReconMatrix from '@/components/sync/ReconMatrix';
import ScheduleConfig from '@/components/sync/ScheduleConfig';
import StatsRow from '@/components/sync/StatsRow';
import { ToastStack } from '@/components/comisiones/ui-bits';
import { useToasts } from '@/components/comisiones/use-toasts';

const RETRY_MS = 2600;

export default function SyncCenter() {
  const { t } = useLanguage();
  const { toasts, push } = useToasts();

  const [paused, setPaused] = useState(false);
  const [overrides, setOverrides] = useState<Partial<Record<string, JobOverride>>>({});
  const [selected, setSelected] = useState<SyncJob | null>(null);
  const retryTimers = useRef<number[]>([]);

  useEffect(() => () => retryTimers.current.forEach((id) => window.clearTimeout(id)), []);

  // Live queue: pending + in-flight, minus retries that already succeeded.
  const queue = useMemo(
    () =>
      syncJobs.filter((j) => {
        const effective = overrides[j.id] ?? j.estado;
        return effective === 'pendiente' || effective === 'en_proceso';
      }).length,
    [overrides],
  );

  const handleRetry = (job: SyncJob) => {
    setOverrides((prev) => ({ ...prev, [job.id]: 'en_proceso' }));
    const id = window.setTimeout(() => {
      setOverrides((prev) => ({ ...prev, [job.id]: 'completado' }));
      push(`${job.id} · ${t('sync.retryOk')}`, 'sync');
    }, RETRY_MS);
    retryTimers.current.push(id);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t('nav.sync')} caption={t('sync.caption')} />

      {/* ============ [A] Engine status hero ============ */}
      <EngineHero
        paused={paused}
        queue={queue}
        onPause={() => {
          setPaused(true);
          push(t('sync.pausedToast'), 'warning');
        }}
        onResume={() => {
          setPaused(false);
          push(t('sync.resumedToast'), 'brand');
        }}
      />

      {/* ============ [B] Stats row ============ */}
      <StatsRow />

      {/* ============ [C] Sync jobs history ============ */}
      <JobsTable overrides={overrides} onRetry={handleRetry} onOpen={setSelected} />

      {/* ============ [D] Audit log + reconciliation matrix ============ */}
      <div className="grid grid-cols-12 gap-5">
        <AuditTimeline />
        <ReconMatrix />
      </div>

      {/* ============ [E] Schedule config ============ */}
      <ScheduleConfig onUpdated={(name) => push(`${t('sync.scheduleOf')} ${name} ${t('sync.scheduleUpdated')}`)} />

      <JobDrawer job={selected} override={selected ? overrides[selected.id] : undefined} onClose={() => setSelected(null)} />
      <ToastStack toasts={toasts} />
    </div>
  );
}
