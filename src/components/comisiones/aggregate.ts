import { comisiones, despachos, getTercero } from '@/lib/data';
import type { Comision, ComisionRegla } from '@/lib/types';

/** Evaluation order — the engine checks rules in this exact sequence. */
export const RULE_ORDER: ComisionRegla[] = [
  'contenedor_especial',
  'facturacion_anticipada',
  'demora_flete',
  'estandar',
];

/** Rank palette — matches leaderboard avatar dots and chart series colors. */
export const VENDOR_PALETTE = ['#16C784', '#38BDF8', '#8B5CF6', '#F5A524'];

/** Period months available in the segmented selector (2026). */
export type PeriodMonth = 6 | 7 | 8; // jun | jul | ago

/** Comisión after engine evaluation — disabled rules fall back to estándar 2.5 %. */
export interface EffectiveComision extends Comision {
  /** Original rule when the row fell back to estándar because its rule is off. */
  reglaOriginal?: ComisionRegla;
}

export const ESTANDAR_PCT = 2.5;

/** Live stat per rule — effective rows after applying the active-rule set. */
export function ruleStat(
  regla: ComisionRegla,
  activeRules: Record<ComisionRegla, boolean>,
): { count: number; held: boolean } {
  const effective = effectiveComisiones(activeRules);
  if (regla === 'demora_flete') {
    // Held commissions = demora_flete rows still calculada (not yet released).
    return { count: effective.filter((c) => c.regla === 'demora_flete' && c.estado === 'calculada').length, held: true };
  }
  return { count: effective.filter((c) => c.regla === regla && c.estado !== 'anulada').length, held: false };
}

/** Apply the active-rule set: off rules re-rate their rows at estándar 2.5 %. */
export function effectiveComisiones(activeRules: Record<ComisionRegla, boolean>): EffectiveComision[] {
  return comisiones.map((c) => {
    if (c.estado === 'anulada' || activeRules[c.regla]) return { ...c };
    const valor = Math.round((c.valor_base ?? 0) * (ESTANDAR_PCT / 100));
    return { ...c, regla: 'estandar' as ComisionRegla, reglaOriginal: c.regla, pct: ESTANDAR_PCT, valor };
  });
}

export interface VendorRow {
  vendedor: string;
  initials: string;
  ventas: number;
  comisionBase: number;
  ajustes: number;
  retenido: number;
  comisionTotal: number;
  total: number;
  reglas: ComisionRegla[];
  /** Contributing rows (period-filtered, incl. anulada for traceability). */
  rows: EffectiveComision[];
}

function initialsOf(nombre: string): string {
  const parts = nombre.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
}

/** Leaderboard aggregation for a period month, from the comisiones table. */
export function aggregateVendors(
  period: PeriodMonth,
  activeRules: Record<ComisionRegla, boolean>,
): VendorRow[] {
  const rows = effectiveComisiones(activeRules).filter(
    (c) => new Date(c.created_at).getMonth() + 1 === period,
  );
  const byVendor = new Map<string, EffectiveComision[]>();
  for (const c of rows) {
    const list = byVendor.get(c.vendedor) ?? [];
    list.push(c);
    byVendor.set(c.vendedor, list);
  }
  const result: VendorRow[] = [];
  for (const [vendedor, vrows] of byVendor) {
    const countable = vrows.filter((c) => c.estado !== 'anulada');
    const ventas = countable.reduce((acc, c) => acc + (c.valor_base ?? 0), 0);
    const comisionTotal = countable.reduce((acc, c) => acc + (c.valor ?? 0), 0);
    const comisionBase = ventas * (ESTANDAR_PCT / 100);
    const retenido = countable
      .filter((c) => c.regla === 'demora_flete' && c.estado === 'calculada')
      .reduce((acc, c) => acc + (c.valor ?? 0), 0);
    const reglas = RULE_ORDER.filter((r) => countable.some((c) => c.regla === r));
    result.push({
      vendedor,
      initials: initialsOf(vendedor),
      ventas,
      comisionBase,
      ajustes: comisionTotal - comisionBase,
      retenido,
      comisionTotal,
      total: comisionTotal - retenido,
      reglas,
      rows: [...vrows].sort((a, b) => a.created_at.localeCompare(b.created_at)),
    });
  }
  return result.sort((a, b) => b.ventas - a.ventas);
}

/* ==================== Monthly series (feb…jul stacked per vendor) ==================== */

export interface MonthlyPoint {
  /** Month index 1–12. */
  month: number;
  /** vendor name → commission total */
  [vendedor: string]: number | string;
}

/** Deterministic hash for stable synthetic history (same pattern as data.ts trend). */
function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 997;
  return h;
}

/**
 * Stacked monthly commission totals per vendor, feb…jul 2026.
 * July is anchored to the real comisiones table; earlier months are a
 * deterministic baseline proportional to each vendor's July total.
 */
export function monthlySeries(vendors: VendorRow[]): { points: MonthlyPoint[]; names: string[] } {
  const names = vendors.map((v) => v.vendedor);
  const julyTotal = new Map(vendors.map((v) => [v.vendedor, v.total]));
  const months = [2, 3, 4, 5, 6, 7];
  const points: MonthlyPoint[] = months.map((month) => {
    const point: MonthlyPoint = { month };
    for (const name of names) {
      const jul = julyTotal.get(name) ?? 0;
      if (month === 7) {
        point[name] = jul;
      } else {
        const factor = 0.55 + (((hashName(name) + month * 13) % 40) / 100);
        point[name] = Math.round(jul * factor);
      }
    }
    return point;
  });
  return { points, names };
}

/* ==================== Exception queue derivation ==================== */

export type ExceptionMotivo = 'flete' | 'meses' | 'contenedor';

export interface ExceptionItem {
  id: string;
  pedido: string;
  cliente: string;
  valor: number;
  motivo: ExceptionMotivo;
  sugerida: ComisionRegla;
  detectado: string;
}

/**
 * Exception queue derived from the data layer:
 *  - demora_flete held rows whose despacho is still undispatched → freight unassigned
 *  - anulada rows → cross-period conflict the engine voided for review
 */
export function buildExceptions(): ExceptionItem[] {
  const items: ExceptionItem[] = [];
  for (const c of comisiones) {
    if (c.regla === 'demora_flete' && c.estado === 'calculada') {
      const des = despachos.find((d) => d.pedido === c.pedido);
      if (des && !des.despachado) {
        items.push({
          id: c.id,
          pedido: c.pedido ?? '—',
          cliente: getTercero(des.tercero_id)?.nombre ?? '—',
          valor: des.valor ?? c.valor_base ?? 0,
          motivo: 'flete',
          sugerida: 'demora_flete',
          detectado: c.created_at,
        });
      }
    }
    if (c.estado === 'anulada') {
      const des = despachos.find((d) => d.pedido === c.pedido);
      items.push({
        id: c.id,
        pedido: c.pedido ?? '—',
        cliente: getTercero(des?.tercero_id)?.nombre ?? '—',
        valor: c.valor_base ?? 0,
        motivo: 'meses',
        sugerida: 'facturacion_anticipada',
        detectado: c.created_at,
      });
    }
  }
  return items;
}
