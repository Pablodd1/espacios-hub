import { documentos, getContenedor, getTercero } from '@/lib/data';

/**
 * Debt model for the % sobrecosto panel (contabilidad.md §[B]).
 * Booked debt with foreign suppliers = purchase documents (cxp) issued to
 * `proveedor_exterior` terceros, each linked to its import línea/contenedor.
 */

/** Compra → contenedor linkage (documentos.notas + contenedores.origen). */
const LINE_CONTAINER: Record<string, string> = {
  'OC-3305': 'con-006', // Foshan · MSKU-882345-1
  'OC-3306': 'con-002', // Ningbo · MSKU-905511-0
  'OC-3308': 'con-004', // Guangzhou · TCNU-334455-6
};

export interface DebtLine {
  docNumero: string;
  proveedor: string;
  contenedor: string | null;
  /** Deuda registrada (COP). */
  deuda: number;
}

export function getDebtLines(): DebtLine[] {
  return documentos
    .filter((d) => d.tipo === 'compra' && getTercero(d.tercero_id)?.tipo === 'proveedor_exterior')
    .sort((a, b) => b.valor - a.valor)
    .map((d) => ({
      docNumero: d.numero,
      proveedor: getTercero(d.tercero_id)?.nombre ?? '—',
      contenedor: getContenedor(LINE_CONTAINER[d.numero])?.numero_contenedor ?? null,
      deuda: d.valor,
    }));
}

export function totalBookedDebt(): number {
  return getDebtLines().reduce((acc, l) => acc + l.deuda, 0);
}

/** Anticipo → contenedor linkage by proveedor (contabilidad.md §[D]). */
export const PROVIDER_CONTAINER: Record<string, string> = {
  'ter-010': 'con-006',
  'ter-011': 'con-002',
  'ter-012': 'con-004',
};

/**
 * Applied-progress (%) for advances still open — the seed stores only the
 * boolean `aplicado`; partial consumption is presentation metadata.
 */
export const PARTIAL_APPLIED_PCT: Record<string, number> = {
  'ant-002': 30,
};

/** Arriving purchase invoice per proveedor (for auto-apply references). */
export const PROVIDER_INVOICE: Record<string, string> = {
  'ter-010': 'OC-3305',
  'ter-011': 'OC-3306',
  'ter-012': 'OC-3308',
};
