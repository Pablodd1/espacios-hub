/**
 * Live bootstrap — when Supabase env vars are present (LIVE mode), fetch all
 * tables and swap the in-memory seed arrays IN PLACE before React renders.
 * All accessors in data.ts compute per-call from these arrays, so every page
 * automatically shows the live database with zero page-level changes.
 *
 * In DEMO mode (no env vars) this resolves immediately and nothing changes.
 */
import { getSupabaseClient } from './supabaseClient';
import { isLiveMode } from './mode';
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

const TABLES: Array<[string, unknown[]]> = [
  ['terceros', terceros],
  ['bancos', bancos],
  ['documentos', documentos],
  ['contenedores', contenedores],
  ['despachos', despachos],
  ['comisiones', comisiones],
  ['anticipos_proveedor', anticiposProveedor],
  ['reconciliacion', reconciliacion],
  ['sync_jobs', syncJobs],
  ['audit_log', auditLog],
];

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<never>((_r, rej) => setTimeout(() => rej(new Error(`timeout ${label}`)), ms)),
  ]);
}

export async function bootstrapLiveData(): Promise<{ live: boolean; error?: string }> {
  if (!isLiveMode()) return { live: false };
  let client: ReturnType<typeof getSupabaseClient>;
  try {
    client = getSupabaseClient();
  } catch (e) {
    return { live: false, error: (e as Error).message };
  }
  if (!client) return { live: false, error: 'Supabase client unavailable' };
  try {
    for (const [table, arr] of TABLES) {
      const { data, error } = await withTimeout(
        client.from(table).select('*') as unknown as Promise<{ data: unknown[] | null; error: { message: string } | null }>,
        8000,
        table,
      );
      if (error) throw new Error(`${table}: ${error.message}`);
      if (data && data.length) {
        arr.length = 0;
        arr.push(...(data as never[]));
      }
    }
    return { live: true };
  } catch (e) {
    // Graceful degradation: keep demo data, report why
    return { live: false, error: (e as Error).message };
  }
}
