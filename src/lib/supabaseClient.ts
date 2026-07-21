/**
 * Espacios Hub — Supabase integration scaffold.
 *
 * ⚠️ NOT YET WIRED. `@supabase/supabase-js` is intentionally NOT installed.
 * The app runs on the synchronous in-memory data layer (`src/lib/data.ts`),
 * which mirrors the live schema 1:1 (see `espacios_hub_init_schema.sql`).
 *
 * ─────────────────────────────────────────────────────────────────────────
 * TODO(backend-graft): plug the real client in here.
 *
 *   1. `npm install @supabase/supabase-js`
 *   2. Set env vars:  VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
 *   3. Uncomment the client below and convert each accessor in
 *      `src/lib/data.ts` to its async twin (signatures sketched at bottom).
 *
 * import { createClient, type SupabaseClient } from '@supabase/supabase-js';
 *
 * export const supabase: SupabaseClient = createClient(
 *   import.meta.env.VITE_SUPABASE_URL as string,
 *   import.meta.env.VITE_SUPABASE_ANON_KEY as string,
 * );
 *
 * Table names are identical to the in-memory exports:
 *   terceros · bancos · documentos · contenedores · despachos · comisiones
 *   anticipos_proveedor (in-memory: anticiposProveedor) · reconciliacion
 *   sync_jobs (in-memory: syncJobs) · audit_log (in-memory: auditLog)
 * ─────────────────────────────────────────────────────────────────────────
 *
 * For now this module simply re-exports the synchronous accessors so page
 * code can import from a single "backend" entry point today and migrate
 * with minimal churn later.
 */

export {
  // tables
  db,
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
  // entity lookups
  getTercero,
  getTercerosByTipo,
  getBanco,
  getDocumento,
  getDocumentosByTipo,
  getDocumentosByEstado,
  getDocumentosByTercero,
  getContenedor,
  getContenedoresByEstado,
  getContenedoresActivos,
  getDespacho,
  getDespachosByZona,
  getComisionesByVendedor,
  getComisionesByRegla,
  getAnticiposPendientes,
  getReconciliacionPendiente,
  getAuditLog,
  // sync engine
  getSyncJobsToday,
  getLiveFeed,
  getJobDurationSec,
  // KPIs & aggregates
  docsSincronizadosHoy,
  pendientes,
  diferenciasAbiertas,
  contenedoresEnTransito,
  getKpiSummary,
  getModuleHealth,
  getReconciliationTrend,
  totalAnticiposPendientes,
  recaudoHoy,
  REFERENCE_NOW,
} from './data';

/**
 * Placeholder for the future async client. Returns `null` until the
 * backend graft installs `@supabase/supabase-js`.
 *
 * Future async signatures (reference):
 *   getDocumentosByTipo(tipo): Promise<Documento[]>        // .from('documentos').select('*').eq('tipo', tipo)
 *   getContenedoresActivos(): Promise<Contenedor[]>        // .from('contenedores').in('estado', ['en_transito','arribado']).order('fecha_arribo')
 *   getLiveFeed(limit): Promise<SyncJob[]>                 // .from('sync_jobs').order('started_at', { ascending: false }).limit(limit)
 *   getReconciliationTrend(days): Promise<TrendPoint[]>    // .from('reconciliacion').gte('fecha', since)
 */
export function getSupabaseClient(): null {
  return null;
}
