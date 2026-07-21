import { REFERENCE_NOW, getJobDurationSec, syncJobs } from '@/lib/data';
import type { SyncJob } from '@/lib/types';

/** Jobs within the last 24h relative to the demo anchor. */
export function jobsLast24h(): SyncJob[] {
  const cutoff = REFERENCE_NOW.getTime() - 24 * 3600 * 1000;
  return syncJobs.filter((j) => new Date(j.started_at).getTime() >= cutoff);
}

/** Queue size: pending + in-flight jobs. */
export function queueSize(): number {
  return syncJobs.filter((j) => j.estado === 'pendiente' || j.estado === 'en_proceso').length;
}

export interface SyncStats {
  jobs24h: number;
  /** 0–100 over finished jobs. */
  tasaExito: number;
  /** Average duration (s) over finished jobs. */
  avgDur: number;
  /** Today's jobs with errors or error state. */
  retriesHoy: number;
  sparkJobs: number[];
  sparkSuccess: number[];
  sparkDur: number[];
  sparkRetries: number[];
}

const HOUR_BUCKETS = [6, 7, 8, 9, 10, 11, 12, 13, 14]; // today's working hours so far

/** Stats row source — everything derived from sync_jobs. */
export function computeSyncStats(): SyncStats {
  const jobs = jobsLast24h();
  const finished = jobs.filter((j) => j.estado === 'completado' || j.estado === 'error');
  const ok = finished.filter((j) => j.estado === 'completado').length;
  const durations = finished
    .map((j) => getJobDurationSec(j))
    .filter((d): d is number => d !== null);

  const today = REFERENCE_NOW.toISOString().slice(0, 10);
  const todays = jobs.filter((j) => j.started_at.slice(0, 10) === today);

  const sparkJobs: number[] = [];
  const sparkSuccess: number[] = [];
  const sparkDur: number[] = [];
  const sparkRetries: number[] = [];
  for (const hour of HOUR_BUCKETS) {
    const bucket = todays.filter((j) => new Date(j.started_at).getHours() === hour);
    sparkJobs.push(bucket.length);
    const bFinished = bucket.filter((j) => j.estado === 'completado' || j.estado === 'error');
    const bOk = bFinished.filter((j) => j.estado === 'completado').length;
    sparkSuccess.push(bFinished.length > 0 ? (bOk / bFinished.length) * 100 : 100);
    const bDurs = bucket.map((j) => getJobDurationSec(j)).filter((d): d is number => d !== null);
    sparkDur.push(bDurs.length > 0 ? bDurs.reduce((a, b) => a + b, 0) / bDurs.length : 0);
    sparkRetries.push(bucket.filter((j) => j.estado === 'error' || j.docs_error > 0).length);
  }

  return {
    jobs24h: jobs.length,
    tasaExito: finished.length > 0 ? (ok / finished.length) * 100 : 100,
    avgDur: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
    retriesHoy: todays.filter((j) => j.estado === 'error' || j.docs_error > 0).length,
    sparkJobs,
    sparkSuccess,
    sparkDur,
    sparkRetries,
  };
}

/* ==================== Job type derivation ==================== */

export type JobTipo =
  | 'egreso'
  | 'recibo'
  | 'causacion'
  | 'compra'
  | 'contenedor'
  | 'conciliacion'
  | 'calculo'
  | 'otro';

const TIPO_BY_MODULE: Record<string, JobTipo> = {
  Tesoreria: 'egreso',
  Cartera: 'recibo',
  'Comercio Exterior': 'contenedor',
  Comisiones: 'calculo',
  Contabilidad: 'causacion',
  Logistica: 'compra',
};

/** Derive a display type from the job message, falling back to its module. */
export function jobTipo(job: SyncJob): JobTipo {
  const m = (job.mensaje ?? '').toLowerCase();
  if (m.includes('conciliación') || m.includes('conciliacion')) return 'conciliacion';
  if (m.includes('egreso')) return 'egreso';
  if (m.includes('recibo')) return 'recibo';
  if (m.includes('causación') || m.includes('causacion')) return 'causacion';
  if (m.includes('compra')) return 'compra';
  if (m.includes('contenedor')) return 'contenedor';
  return TIPO_BY_MODULE[job.modulo] ?? 'otro';
}
