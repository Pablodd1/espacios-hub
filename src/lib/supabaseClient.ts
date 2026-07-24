/**
 * Espacios Hub — Supabase integration layer.
 *
 * DUAL MODE:
 *  - LIVE: when VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set (see .env.example),
 *    `getSupabaseClient()` returns a real client pointed at the provisioned schema
 *    (supabase/espacios_hub_init_schema.sql).
 *  - DEMO (default): everything below re-exports the synchronous in-memory data layer
 *    (`src/lib/data.ts`), which mirrors the live schema 1:1. Pages keep working with
 *    zero changes.
 *
 * MIGRATION PATH (next phase): pages currently consume synchronous accessors.
 * The async twins below (`live.*`) have identical semantics — migrate page by page:
 *   const documentos = await live.getDocumentosByTipo('egreso');
 * Table names match in-memory exports:
 *   terceros · bancos · documentos · contenedores · despachos · comisiones
 *   anticipos_proveedor (in-memory: anticiposProveedor) · reconciliacion
 *   sync_jobs (in-memory: syncJobs) · audit_log (in-memory: auditLog)
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { isLiveMode } from './mode';
import type { Contenedor, Documento, Reconciliacion, SyncJob, Tercero } from './types';

let _client: SupabaseClient | null = null;

/** Real client in LIVE mode, null in DEMO mode. */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isLiveMode()) return null;
  if (!_client) {
    _client = createClient(
      import.meta.env.VITE_SUPABASE_URL as string,
      import.meta.env.VITE_SUPABASE_ANON_KEY as string,
      {
        // read-only anonymous access: skip GoTrue session handling entirely —
        // avoids the Web Locks deadlock and /auth/v1 round-trips on page load
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      },
    );
  }
  return _client;
}

/** Async accessors — LIVE mode only (throw in DEMO mode by contract). */
export const live = {
  async getDocumentosByTipo(tipo: Documento['tipo']): Promise<Documento[]> {
    const { data, error } = await getSupabaseClient()!.from('documentos').select('*').eq('tipo', tipo).order('fecha', { ascending: false });
    if (error) throw error;
    return data as Documento[];
  },
  async getTerceros(): Promise<Tercero[]> {
    const { data, error } = await getSupabaseClient()!.from('terceros').select('*');
    if (error) throw error;
    return data as Tercero[];
  },
  async getContenedoresActivos(): Promise<Contenedor[]> {
    const { data, error } = await getSupabaseClient()!.from('contenedores').select('*').in('estado', ['en_transito', 'arribado']).order('fecha_arribo');
    if (error) throw error;
    return data as Contenedor[];
  },
  async getLiveFeed(limit = 10): Promise<SyncJob[]> {
    const { data, error } = await getSupabaseClient()!.from('sync_jobs').select('*').order('started_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return data as SyncJob[];
  },
  async getReconciliacionPendiente(): Promise<Reconciliacion[]> {
    const { data, error } = await getSupabaseClient()!.from('reconciliacion').select('*').eq('resuelto', false);
    if (error) throw error;
    return data as Reconciliacion[];
  },
};

// ── DEMO-mode re-exports (single backend entry point for all pages) ──
export {
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
  getSyncJobsToday,
  getLiveFeed,
  getJobDurationSec,
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
