/**
 * Cartera — page-local view-model.
 *
 * Everything derives from the synchronous data layer (`src/lib/data.ts`).
 * Credit terms: net-30 (vencimiento = fecha + 30 días); "vencido" is the
 * open saldo of invoices whose due date is before REFERENCE_NOW.
 */
import {
  DATA_TODAY,
  getBanco,
  getDocumentosByTipo,
  getTercerosByTipo,
  reconciliacion,
  syncJobs,
} from '@/lib/data';
import type { Banco, Documento, Reconciliacion, SyncJob, Tercero } from '@/lib/types';
import type { DictKey } from '@/i18n';

export const CREDIT_DIAS = 30;
const DAY_MS = 86_400_000;

/* ===================== helpers ===================== */

export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00-05:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function daysSince(iso: string): number {
  const a = new Date(`${iso}T12:00:00-05:00`).getTime();
  const b = new Date(`${DATA_TODAY}T12:00:00-05:00`).getTime();
  return Math.max(0, Math.round((b - a) / DAY_MS));
}

/** Replace `{token}` placeholders with values (i18n interpolation). */
export function interp(template: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)), template);
}

/** `+573105551234` → `+57 310 555 1234` (fallback: raw value). */
export function formatPhone(raw: string | null): string {
  if (!raw) return '—';
  const digits = raw.replace(/[^\d]/g, '');
  if (digits.length === 12 && digits.startsWith('57')) {
    return `+57 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  return raw;
}

/** kebab-case slug for filenames. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/* ===================== client cartera model ===================== */

export interface FacturaCartera {
  doc: Documento;
  /** fecha + CREDIT_DIAS (ISO date). */
  vence: string;
  /** Days since invoice date (anchored to REFERENCE_NOW). */
  ageDias: number;
  /** Days past due (0 when corriente). */
  diasVencido: number;
  /** Abonos allocated to this invoice (oldest-first waterfall). */
  abono: number;
  /** Open balance of this invoice. */
  saldo: number;
}

export interface ClienteCartera {
  tercero: Tercero;
  facturas: FacturaCartera[];
  totalFacturas: number;
  totalAbonos: number;
  /** Open receivable (≥ 0). */
  saldo: number;
  /** Client credit available to apply (abonos above invoices). */
  anticipo: number;
  /** Open saldo already past due. */
  vencido: number;
  /** Max days past due across open invoices (0 = al día). */
  maxDiasVencido: number;
}

function buildCliente(tercero: Tercero, facturasAll: Documento[], recibosAll: Documento[]): ClienteCartera {
  const facturas = facturasAll
    .filter((d) => d.tercero_id === tercero.id)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
  const abonosTotal = recibosAll.filter((d) => d.tercero_id === tercero.id).reduce((acc, d) => acc + d.valor, 0);

  let remaining = abonosTotal;
  const rows: FacturaCartera[] = facturas.map((doc) => {
    const abono = Math.min(doc.valor, remaining);
    remaining -= abono;
    const ageDias = daysSince(doc.fecha);
    const diasVencido = Math.max(0, ageDias - CREDIT_DIAS);
    const saldo = doc.valor - abono;
    return { doc, vence: addDays(doc.fecha, CREDIT_DIAS), ageDias, diasVencido, abono, saldo };
  });

  const saldo = rows.reduce((acc, r) => acc + r.saldo, 0);
  const vencido = rows.reduce((acc, r) => acc + (r.diasVencido > 0 ? r.saldo : 0), 0);
  return {
    tercero,
    facturas: rows,
    totalFacturas: facturas.reduce((acc, d) => acc + d.valor, 0),
    totalAbonos: abonosTotal,
    saldo,
    anticipo: Math.max(0, remaining),
    vencido,
    maxDiasVencido: rows.reduce((acc, r) => Math.max(acc, r.saldo > 0 ? r.diasVencido : 0), 0),
  };
}

export interface CarteraModel {
  clientes: ClienteCartera[];
  facturas: Documento[];
  recibos: Documento[];
  totalCartera: number;
  totalVencida: number;
  recibosHoy: number;
  recibosPendientes: number;
}

/** Single derivation entry point — memoize per page. */
export function buildCarteraModel(): CarteraModel {
  const facturas = getDocumentosByTipo('factura');
  const recibos = getDocumentosByTipo('recibo_caja');
  const tercerosCliente = getTercerosByTipo('cliente');
  const clientes = tercerosCliente.map((t) => buildCliente(t, facturas, recibos)).sort((a, b) => b.saldo - a.saldo);
  return {
    clientes,
    facturas,
    recibos,
    totalCartera: clientes.reduce((acc, c) => acc + c.saldo, 0),
    totalVencida: clientes.reduce((acc, c) => acc + c.vencido, 0),
    recibosHoy: recibos.filter((d) => d.fecha === DATA_TODAY).length,
    recibosPendientes: recibos.filter((d) => d.estado === 'pendiente').length,
  };
}

/* ===================== aging ===================== */

export type AgingKey = 'corriente' | 'd1a30' | 'd31a60' | 'd61a90' | 'd90plus';

export interface AgingBucket {
  key: AgingKey;
  labelKey: DictKey;
  value: number;
  color: string;
}

/** 5 buckets per spec: Corriente / 1–30 / 31–60 / 61–90 / +90 (days past due). */
export function buildAging(clientes: ClienteCartera[]): AgingBucket[] {
  const sums: Record<AgingKey, number> = { corriente: 0, d1a30: 0, d31a60: 0, d61a90: 0, d90plus: 0 };
  for (const c of clientes) {
    for (const f of c.facturas) {
      if (f.saldo <= 0) continue;
      if (f.diasVencido <= 0) sums.corriente += f.saldo;
      else if (f.diasVencido <= 30) sums.d1a30 += f.saldo;
      else if (f.diasVencido <= 60) sums.d31a60 += f.saldo;
      else if (f.diasVencido <= 90) sums.d61a90 += f.saldo;
      else sums.d90plus += f.saldo;
    }
  }
  return [
    { key: 'corriente', labelKey: 'cart.aging.corriente', value: sums.corriente, color: '#16C784' },
    { key: 'd1a30', labelKey: 'cart.aging.d1a30', value: sums.d1a30, color: '#38BDF8' },
    { key: 'd31a60', labelKey: 'cart.aging.d31a60', value: sums.d31a60, color: '#F5A524' },
    { key: 'd61a90', labelKey: 'cart.aging.d61a90', value: sums.d61a90, color: '#D97706' },
    { key: 'd90plus', labelKey: 'cart.aging.d90plus', value: sums.d90plus, color: '#F04452' },
  ];
}

/* ===================== recibos ===================== */

export interface ReciboRow {
  doc: Documento;
  tercero: Tercero | undefined;
  banco: Banco | undefined;
}

export function buildReciboRows(): ReciboRow[] {
  const clientes = getTercerosByTipo('cliente');
  return getDocumentosByTipo('recibo_caja')
    .map((doc) => ({
      doc,
      tercero: clientes.find((t) => t.id === doc.tercero_id),
      banco: getBanco(doc.banco_id),
    }))
    .sort((a, b) => b.doc.numero.localeCompare(a.doc.numero));
}

/** Latest sync job whose message references a document number. */
export function findJobForDocumento(numero: string): SyncJob | undefined {
  return [...syncJobs]
    .sort((a, b) => b.started_at.localeCompare(a.started_at))
    .find((j) => j.mensaje?.includes(numero));
}

/* ===================== reconciliation ===================== */

export type ReconBucketKey = 'anticipos' | 'partidas' | 'cartera';

export interface ReconBucket {
  key: ReconBucketKey;
  labelKey: DictKey;
  siigo: number;
  hgi: number;
  delta: number;
}

/** Open Cartera recon differences (minus locally resolved ids). */
export function buildCarteraDiffs(resolvedIds: ReadonlySet<string>): Reconciliacion[] {
  return reconciliacion.filter(
    (r) => r.modulo === 'Cartera' && r.diferencia !== 0 && !r.resuelto && !resolvedIds.has(r.id),
  );
}

/**
 * Three buckets per spec:
 *  - Anticipos: client credit balances (saldos a favor).
 *  - Partidas por identificar: recibos not yet fully synced (pendiente/diferencia);
 *    HGI misses the open recon delta(s) until resolved.
 *  - Cartera: open receivables.
 */
export function buildReconBuckets(
  clientes: ClienteCartera[],
  recibos: Documento[],
  diffs: Reconciliacion[],
): ReconBucket[] {
  const anticipos = clientes.reduce((acc, c) => acc + c.anticipo, 0);
  const partidasSiigo = recibos.filter((d) => d.estado !== 'sincronizado').reduce((acc, d) => acc + d.valor, 0);
  const delta = diffs.reduce((acc, r) => acc + Math.abs(r.diferencia), 0);
  const cartera = clientes.reduce((acc, c) => acc + c.saldo, 0);
  return [
    { key: 'anticipos', labelKey: 'cart.recon.anticipos', siigo: anticipos, hgi: anticipos, delta: 0 },
    { key: 'partidas', labelKey: 'cart.recon.partidas', siigo: partidasSiigo, hgi: partidasSiigo - delta, delta },
    { key: 'cartera', labelKey: 'cart.recon.cartera', siigo: cartera, hgi: cartera, delta: 0 },
  ];
}

/** Extract the referenced document number from a recon concept ("Recibo RC-5509" → "RC-5509"). */
export function docNumeroFromConcepto(concepto: string): string | null {
  const m = concepto.match(/[A-Z]{2}-\d+/);
  return m ? m[0] : null;
}

export interface SuggestedMatch {
  recibo: Documento;
  factura: Documento;
  tercero: Tercero | undefined;
}

/**
 * Suggested link for an open difference: the receipt referenced by the recon
 * row ↔ an invoice of the same tercero dated within ±3 days.
 */
export function suggestedMatchFor(diff: Reconciliacion): SuggestedMatch | null {
  const numero = docNumeroFromConcepto(diff.concepto);
  if (!numero) return null;
  const recibo = getDocumentosByTipo('recibo_caja').find((d) => d.numero === numero);
  if (!recibo?.tercero_id) return null;
  const reciboTime = new Date(`${recibo.fecha}T12:00:00-05:00`).getTime();
  const factura = getDocumentosByTipo('factura')
    .filter((d) => d.tercero_id === recibo.tercero_id)
    .sort(
      (a, b) =>
        Math.abs(new Date(`${a.fecha}T12:00:00-05:00`).getTime() - reciboTime) -
        Math.abs(new Date(`${b.fecha}T12:00:00-05:00`).getTime() - reciboTime),
    )
    .find((d) => Math.abs(new Date(`${d.fecha}T12:00:00-05:00`).getTime() - reciboTime) <= 3 * DAY_MS);
  if (!factura) return null;
  return { recibo, factura, tercero: getTercerosByTipo('cliente').find((t) => t.id === recibo.tercero_id) };
}

/** Probable-cause chip for a recon difference (derived from the receipt notes). */
export function causaForDiff(diff: Reconciliacion): DictKey {
  const numero = docNumeroFromConcepto(diff.concepto);
  const doc = numero ? getDocumentosByTipo('recibo_caja').find((d) => d.numero === numero) : undefined;
  const notas = doc?.notas?.toLowerCase() ?? '';
  if (notas.includes('mapeado')) return 'cart.recon.causaNoMapeado';
  if (Math.abs(diff.diferencia) <= 10_000 || notas.includes('redondeo')) return 'cart.recon.causaRedondeo';
  return 'cart.recon.causaSinCruzar';
}
