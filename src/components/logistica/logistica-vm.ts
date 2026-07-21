import { contenedores, despachos, documentos, getContenedor, getSyncJobsToday, getTercero } from '@/lib/data';
import { REFERENCE_NOW } from '@/lib/data';
import type { Contenedor, Despacho, Documento } from '@/lib/types';

/** Deterministic hash for stable pseudo-random view-model values. */
function hashOf(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Ítems de una compra: cantidad del contenedor vinculado en notas, o derivado del id. */
export function itemsOf(d: Documento): number {
  const linked = contenedores.find((c) => (d.notas ?? '').includes(c.numero_contenedor));
  if (linked?.cantidad) return linked.cantidad;
  return 120 + (hashOf(d.id) % 1140);
}

const DAY_MS = 86_400_000;

const daysSince = (isoDate: string): number =>
  Math.max(0, Math.round((REFERENCE_NOW.getTime() - new Date(`${isoDate}T12:00:00-05:00`).getTime()) / DAY_MS));

const daysSinceTs = (isoTs: string): number =>
  Math.max(0, Math.floor((REFERENCE_NOW.getTime() - new Date(isoTs).getTime()) / DAY_MS));

/* ==================== B1 — Ingresados no recibidos ==================== */

export interface Gap1Row {
  id: string;
  numero: string;
  proveedor: string;
  valor: number;
  container: Contenedor | null;
  days: number;
}

/**
 * Compras de mercancía (documentos tipo compra, excluye servicios) cruzadas con
 * contenedores recibido_fisico = false. Cruce: N° de contenedor en notas, o la
 * ciudad de origen mencionada en notas.
 */
export function buildGap1(): Gap1Row[] {
  const notReceived = contenedores.filter((c) => !c.recibido_fisico);
  return documentos
    .filter((d) => d.tipo === 'compra' && !(d.notas ?? '').toLowerCase().includes('servicios'))
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .map((d) => {
      const notas = d.notas ?? '';
      const container =
        notReceived.find((c) => notas.includes(c.numero_contenedor)) ??
        notReceived.find((c) => c.origen !== null && notas.includes(c.origen)) ??
        null;
      return {
        id: d.id,
        numero: d.numero,
        proveedor: getTercero(d.tercero_id)?.nombre ?? '',
        valor: d.valor,
        container,
        days: daysSince(d.fecha),
      };
    });
}

/* ==================== B2 — Facturados no despachados ==================== */

export type Gap2Motivo = 'flete' | 'cumplido';

export interface Gap2Row {
  id: string;
  /** Factura emitida vinculada, o el pedido cuando aún no hay factura. */
  ref: string;
  cliente: string;
  valor: number;
  days: number;
  motivo: Gap2Motivo;
}

/** Despachos con despachado = false — mercancía retenida en bodega. */
export function buildGap2(): Gap2Row[] {
  return despachos
    .filter((d) => !d.despachado)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((d) => {
      let factura = d.factura;
      if (!factura) {
        // Factura del mismo cliente que aún no tiene despacho despachado
        factura =
          documentos.find(
            (doc) =>
              doc.tipo === 'factura' &&
              doc.tercero_id === d.tercero_id &&
              !despachos.some((x) => x.factura === doc.numero && x.despachado),
          )?.numero ?? null;
      }
      const facturaDoc = factura
        ? documentos.find((doc) => doc.tipo === 'factura' && doc.numero === factura)
        : undefined;
      const container = getContenedor(d.contenedor_id);
      return {
        id: d.id,
        ref: factura ?? d.pedido,
        cliente: getTercero(d.tercero_id)?.nombre ?? '—',
        valor: d.valor ?? 0,
        days: facturaDoc ? daysSince(facturaDoc.fecha) : daysSinceTs(d.created_at),
        motivo: container?.recibido_fisico ? 'flete' : 'cumplido',
      };
    });
}

/* ==================== D — Cumplidos con novedades ==================== */

export type NovedadKind = 'none' | 'faltante' | 'averia' | 'precio';

export interface CumplidoRow {
  id: string;
  numero: string;
  containerNum: string;
  fecha: string;
  checklistDone: number;
  checklistTotal: number;
  novedad: NovedadKind;
  /** Units short when novedad = faltante. */
  faltanteUnds: number;
  posted: boolean;
  attachments: string[];
}

const NOVEDAD_CYCLE: NovedadKind[] = ['none', 'faltante', 'averia', 'none', 'precio', 'none'];

/** Cumplidos digitales derivados de despachos despachados con contenedor. */
export function buildCumplidos(): CumplidoRow[] {
  return despachos
    .filter((d) => d.despachado && d.contenedor_id !== null && d.fecha !== null)
    .sort((a, b) => (b.fecha ?? '').localeCompare(a.fecha ?? ''))
    .map((d, i) => {
      const novedad = NOVEDAD_CYCLE[i % NOVEDAD_CYCLE.length];
      const numero = `CUM-${String(418 - i).padStart(4, '0')}`;
      const extra =
        novedad === 'averia'
          ? 'foto-averia.jpg'
          : novedad === 'faltante'
            ? 'foto-faltante.jpg'
            : novedad === 'precio'
              ? 'soporte-precio.pdf'
              : null;
      return {
        id: d.id,
        numero,
        containerNum: getContenedor(d.contenedor_id)?.numero_contenedor ?? '—',
        fecha: d.fecha as string,
        checklistDone: novedad === 'faltante' ? 3 : 4,
        checklistTotal: 4,
        novedad,
        faltanteUnds: 12,
        posted: novedad === 'none',
        attachments: [`cumplido-${numero.toLowerCase()}.pdf`, ...(extra ? [extra] : [])],
      };
    });
}

/* ==================== E — Pipeline relation ==================== */

export interface PipelineRow {
  id: string;
  despachoNum: string;
  pedido: string;
  factura: string | null;
  fletePct: number | null;
  zona: string | null;
  cliente: string;
  valor: number | null;
  fecha: string | null;
  despachado: boolean;
}

export function buildPipeline(): PipelineRow[] {
  return [...despachos]
    .sort((a, b) => (b.fecha ?? '').localeCompare(a.fecha ?? '') || b.created_at.localeCompare(a.created_at))
    .map((d: Despacho) => ({
      id: d.id,
      despachoNum: `DESP-${d.id.replace(/^des-/, '').padStart(4, '0')}`,
      pedido: d.pedido,
      factura: d.factura,
      fletePct: d.pct_flete,
      zona: d.zona,
      cliente: getTercero(d.tercero_id)?.nombre ?? '—',
      valor: d.valor,
      fecha: d.fecha,
      despachado: d.despachado,
    }));
}

/* ==================== KPIs ==================== */

/** Compras sincronizadas hoy: docs netos del batch de Logística de hoy (sync_jobs). */
export function comprasSyncHoy(): number {
  return getSyncJobsToday()
    .filter((j) => j.modulo === 'Logistica' && j.docs_procesados > 0)
    .reduce((acc, j) => acc + (j.docs_procesados - j.docs_error), 0);
}
