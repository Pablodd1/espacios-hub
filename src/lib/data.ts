/**
 * Espacios Hub — synchronous in-memory data layer.
 *
 * All reads hit the typed seed arrays in `seed-data.ts` (which mirrors the
 * Supabase schema). When the backend is grafted, these accessors are the
 * single swap point — see `supabaseClient.ts` for the async TODO scaffold.
 */
import {
  anticiposProveedor,
  auditLog,
  bancos,
  comisiones,
  contenedores,
  despachos,
  documentos,
  reconciliacion,
  syncJobs,
  terceros,
} from './seed-data';
import type {
  AnticipoProveedor,
  AuditLog,
  Banco,
  Comision,
  ComisionRegla,
  Contenedor,
  ContenedorEstado,
  Despacho,
  Documento,
  DocumentoEstado,
  DocumentoTipo,
  ModuleHealth,
  ModuleKey,
  Reconciliacion,
  SyncJob,
  Tercero,
  TrendPoint,
} from './types';

/** Demo anchor: Tuesday 2026-07-21 14:32 COT. Use instead of `new Date()` for demo coherence. */
export const REFERENCE_NOW = new Date('2026-07-21T14:32:00-05:00');

/** Raw tables — same shape as Supabase rows. */
export const db = {
  terceros,
  bancos,
  documentos,
  contenedores,
  despachos,
  comisiones,
  anticiposProveedor,
  reconciliacion,
  syncJobs,
  auditLog,
} as const;

export {
  anticiposProveedor,
  auditLog,
  bancos,
  comisiones,
  contenedores,
  despachos,
  documentos,
  reconciliacion,
  syncJobs,
  terceros,
};

const isoDay = (d: Date): string => d.toISOString().slice(0, 10);
const today = isoDay(REFERENCE_NOW);

/* ===================== Entity lookups ===================== */

export function getTercero(id: string | null | undefined): Tercero | undefined {
  return terceros.find((t) => t.id === id);
}

export function getTercerosByTipo(tipo: Tercero['tipo']): Tercero[] {
  return terceros.filter((t) => t.tipo === tipo);
}

export function getBanco(id: string | null | undefined): Banco | undefined {
  return bancos.find((b) => b.id === id);
}

export function getDocumento(id: string): Documento | undefined {
  return documentos.find((d) => d.id === id);
}

export function getDocumentosByTipo(tipo: DocumentoTipo): Documento[] {
  return documentos.filter((d) => d.tipo === tipo);
}

export function getDocumentosByEstado(estado: DocumentoEstado): Documento[] {
  return documentos.filter((d) => d.estado === estado);
}

export function getDocumentosByTercero(terceroId: string): Documento[] {
  return documentos.filter((d) => d.tercero_id === terceroId);
}

export function getContenedor(id: string | null | undefined): Contenedor | undefined {
  return contenedores.find((c) => c.id === id);
}

export function getContenedoresByEstado(estado: ContenedorEstado): Contenedor[] {
  return contenedores.filter((c) => c.estado === estado);
}

/** Containers in transit or arrived, ordered by ETA/arrival — dashboard widget source. */
export function getContenedoresActivos(): Contenedor[] {
  return contenedores
    .filter((c) => c.estado === 'en_transito' || c.estado === 'arribado')
    .sort((a, b) => (a.fecha_arribo ?? '').localeCompare(b.fecha_arribo ?? ''));
}

export function getDespacho(id: string): Despacho | undefined {
  return despachos.find((d) => d.id === id);
}

export function getDespachosByZona(zona: string): Despacho[] {
  return despachos.filter((d) => d.zona === zona);
}

export function getComisionesByVendedor(vendedor: string): Comision[] {
  return comisiones.filter((c) => c.vendedor === vendedor);
}

export function getComisionesByRegla(regla: ComisionRegla): Comision[] {
  return comisiones.filter((c) => c.regla === regla);
}

export function getAnticiposPendientes(): AnticipoProveedor[] {
  return anticiposProveedor.filter((a) => !a.aplicado);
}

export function getReconciliacionPendiente(): Reconciliacion[] {
  return reconciliacion.filter((r) => !r.resuelto && r.diferencia !== 0);
}

export function getAuditLog(limit = 20): AuditLog[] {
  return [...auditLog].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, limit);
}

/* ===================== Sync jobs / live feed ===================== */

export function getSyncJobsToday(): SyncJob[] {
  return syncJobs.filter((j) => j.started_at.slice(0, 10) === today);
}

/** Live feed rows, newest first. */
export function getLiveFeed(limit = 6): SyncJob[] {
  return [...syncJobs].sort((a, b) => b.started_at.localeCompare(a.started_at)).slice(0, limit);
}

/** Job duration in seconds (null when unfinished). */
export function getJobDurationSec(job: SyncJob): number | null {
  if (!job.finished_at) return null;
  return (new Date(job.finished_at).getTime() - new Date(job.started_at).getTime()) / 1000;
}

/* ===================== KPI computations ===================== */

/** Documents synced today = Σ(docs_procesados − docs_error) of today's batch jobs → 142. */
export function docsSincronizadosHoy(): number {
  return getSyncJobsToday()
    .filter((j) => j.docs_procesados > 0)
    .reduce((acc, j) => acc + (j.docs_procesados - j.docs_error), 0);
}

/** Pending syncs = documentos with estado 'pendiente' → 7. */
export function pendientes(): number {
  return documentos.filter((d) => d.estado === 'pendiente').length;
}

/** Open differences = unresolved reconciliacion rows with non-zero diferencia → 3. */
export function diferenciasAbiertas(): number {
  return getReconciliacionPendiente().length;
}

/** Containers in transit → 5. */
export function contenedoresEnTransito(): number {
  return contenedores.filter((c) => c.estado === 'en_transito').length;
}

export interface KpiSummary {
  docsSincronizadosHoy: number;
  pendientes: number;
  diferencias: number;
  contenedoresEnTransito: number;
}

export function getKpiSummary(): KpiSummary {
  return {
    docsSincronizadosHoy: docsSincronizadosHoy(),
    pendientes: pendientes(),
    diferencias: diferenciasAbiertas(),
    contenedoresEnTransito: contenedoresEnTransito(),
  };
}

/* ===================== Module health (donut) ===================== */

const MODULE_ORDER: ModuleKey[] = ['Tesoreria', 'Cartera', 'Comercio Exterior', 'Comisiones', 'Contabilidad', 'Logistica'];

/** Successful docs per module today + success rate — dashboard donut source. */
export function getModuleHealth(): ModuleHealth[] {
  const todays = getSyncJobsToday().filter((j) => j.docs_procesados > 0);
  return MODULE_ORDER.map((modulo) => {
    const jobs = todays.filter((j) => j.modulo === modulo);
    const total = jobs.reduce((acc, j) => acc + j.docs_procesados, 0);
    const errores = jobs.reduce((acc, j) => acc + j.docs_error, 0);
    const ok = total - errores;
    return {
      modulo,
      ok,
      errores,
      total,
      tasaExito: total > 0 ? (ok / total) * 100 : 100,
    };
  });
}

/* ===================== Reconciliation trend (30d area chart) ===================== */

/**
 * Daily reconciled/mismatch document counts for the last `days` days,
 * anchored to REFERENCE_NOW. Deterministic baseline series; the real open
 * differences from `reconciliacion` are folded into their dates so the
 * chart and the alert strip always agree.
 */
export function getReconciliationTrend(days = 30): TrendPoint[] {
  const points: TrendPoint[] = [];
  const openDiffs = getReconciliacionPendiente();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(REFERENCE_NOW);
    d.setDate(d.getDate() - i);
    const fecha = isoDay(d);
    const idx = days - 1 - i;
    // Deterministic baseline: 96–138 reconciled, 0–2 mismatches
    const conciliados = 96 + ((idx * 37 + 13) % 43);
    let diferencias = (idx * 53 + 7) % 9 === 0 ? 2 : (idx * 29 + 3) % 11 === 0 ? 1 : 0;
    const real = openDiffs.filter((r) => r.fecha === fecha).length;
    if (real > 0) diferencias = Math.max(diferencias, real);
    points.push({ fecha, conciliados, diferencias });
  }
  return points;
}

/* ===================== Misc aggregates ===================== */

/** Sum of open advances to foreign suppliers (COP). */
export function totalAnticiposPendientes(): number {
  return getAnticiposPendientes().reduce((acc, a) => acc + (a.valor ?? 0), 0);
}

/** Receivables collected today (recibos de caja dated today). */
export function recaudoHoy(): number {
  return documentos
    .filter((d) => d.tipo === 'recibo_caja' && d.fecha === today)
    .reduce((acc, d) => acc + d.valor, 0);
}

export { today as DATA_TODAY };
