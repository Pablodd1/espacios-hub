import { formatCOP, formatNumber } from '@/i18n/format';
import type { Lang } from '@/i18n';
import { contenedores, documentos, getJobDurationSec, getTercero, reconciliacion } from '@/lib/data';
import type { SyncJob, SyncJobEstado } from '@/lib/types';

export interface PayloadEntry {
  key: string;
  value: string;
}

export interface JobPayload {
  siigo: PayloadEntry[];
  hgi: PayloadEntry[];
  /** Keys whose values differ between systems. */
  mismatches: Set<string>;
  idempotency: string;
}

function findDocumento(job: SyncJob) {
  const m = job.mensaje ?? '';
  if (!m) return undefined;
  return documentos.find((d) => m.includes(d.numero));
}

function findContenedor(job: SyncJob) {
  const m = job.mensaje ?? '';
  if (!m) return undefined;
  return contenedores.find((c) => m.includes(c.numero_contenedor));
}

function diffKeys(a: PayloadEntry[], b: PayloadEntry[]): Set<string> {
  const mismatches = new Set<string>();
  const mapB = new Map(b.map((e) => [e.key, e.value]));
  for (const e of a) {
    if (mapB.get(e.key) !== e.value) mismatches.add(e.key);
  }
  for (const e of b) {
    if (!a.some((x) => x.key === e.key)) mismatches.add(e.key);
  }
  return mismatches;
}

/**
 * SIIGO payload vs HGI result for the job drawer diff viewer.
 * Grounded in real rows: the documento/contenedor referenced by the job
 * message, plus unresolved reconciliacion deltas for value mismatches.
 */
export function buildJobPayload(job: SyncJob, lang: Lang): JobPayload {
  const doc = findDocumento(job);
  if (doc) {
    const tercero = getTercero(doc.tercero_id)?.nombre ?? null;
    const recon = reconciliacion.find((r) => r.concepto.includes(doc.numero) && r.diferencia !== 0);
    const siigo: PayloadEntry[] = [
      { key: 'documento', value: doc.numero },
      { key: 'tipo', value: doc.tipo },
      { key: 'tercero', value: tercero ?? 'null' },
      { key: 'valor_cop', value: formatCOP(doc.valor, lang) },
      { key: 'estado', value: doc.estado },
    ];
    const hgi: PayloadEntry[] = [
      { key: 'documento', value: doc.numero },
      { key: 'tipo', value: doc.tipo },
      { key: 'tercero', value: doc.estado === 'error' ? 'SIN_MAPEAR' : (tercero ?? 'null') },
      { key: 'valor_cop', value: formatCOP(recon?.valor_hgi ?? doc.valor, lang) },
      { key: 'estado', value: doc.sincronizado_hgi ? 'sincronizado' : doc.estado === 'error' ? 'rechazado' : 'pendiente' },
    ];
    if (job.estado === 'error' && job.mensaje) hgi.push({ key: 'error', value: job.mensaje });
    return { siigo, hgi, mismatches: diffKeys(siigo, hgi), idempotency: doc.idempotency_key ?? `${job.direccion}·${job.id}` };
  }

  const cont = findContenedor(job);
  if (cont) {
    const siigo: PayloadEntry[] = [
      { key: 'contenedor', value: cont.numero_contenedor },
      { key: 'bl', value: cont.bl ?? 'null' },
      { key: 'puerto', value: cont.puerto ?? 'null' },
      { key: 'estado', value: cont.estado },
      { key: 'recibido_fisico', value: String(cont.recibido_fisico) },
    ];
    const hgi: PayloadEntry[] = siigo.map((e) => ({ ...e }));
    return { siigo, hgi, mismatches: diffKeys(siigo, hgi), idempotency: `${job.direccion}·${cont.numero_contenedor}` };
  }

  // Batch / module-level job: summarize the run itself.
  const siigo: PayloadEntry[] = [
    { key: 'job', value: job.id },
    { key: 'modulo', value: job.modulo },
    { key: 'direccion', value: job.direccion },
    { key: 'docs_procesados', value: formatNumber(job.docs_procesados, lang) },
    { key: 'docs_error', value: formatNumber(job.docs_error, lang) },
  ];
  const hgi: PayloadEntry[] = [
    { key: 'job', value: job.id },
    { key: 'modulo', value: job.modulo },
    { key: 'direccion', value: job.direccion },
    { key: 'recibidos', value: formatNumber(job.docs_procesados - job.docs_error, lang) },
    { key: 'errores', value: formatNumber(job.docs_error, lang) },
  ];
  return { siigo, hgi, mismatches: diffKeys(siigo, hgi), idempotency: `${job.direccion}·${job.id}` };
}

/* ==================== Attempts timeline ==================== */

export interface Attempt {
  n: number;
  estado: SyncJobEstado;
  at: string;
  durationSec: number | null;
}

/**
 * Attempt history for a job. The seed carries the current run only; for
 * in-flight retries we surface attempt 1 as failed (per design, attempt 2/3).
 */
export function jobAttempts(job: SyncJob, override?: 'en_proceso' | 'completado'): Attempt[] {
  const dur = getJobDurationSec(job);
  if (override === 'en_proceso') {
    return [
      { n: 1, estado: 'error', at: job.started_at, durationSec: dur },
      { n: 2, estado: 'en_proceso', at: job.started_at, durationSec: null },
    ];
  }
  if (override === 'completado') {
    return [
      { n: 1, estado: 'error', at: job.started_at, durationSec: dur },
      { n: 2, estado: 'completado', at: job.started_at, durationSec: 2.4 },
    ];
  }
  if (job.estado === 'en_proceso') {
    return [
      { n: 1, estado: 'error', at: job.started_at, durationSec: null },
      { n: 2, estado: 'en_proceso', at: job.started_at, durationSec: null },
    ];
  }
  return [{ n: 1, estado: job.estado, at: job.started_at, durationSec: dur }];
}
