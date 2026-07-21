import { anticiposProveedor, documentos, getTercero } from '@/lib/data';
import type { AnticipoProveedor, Contenedor, Documento } from '@/lib/types';

/** Deterministic hash for stable pseudo-random view-model values. */
export function hashOf(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Carrier (naviera) derived from the container prefix — view-model only. */
export function carrierOf(numero: string): string {
  const prefix = numero.split('-')[0]?.toUpperCase() ?? '';
  const map: Record<string, string> = {
    MSKU: 'Maersk Line',
    TCLU: 'MSC',
    BEAU: 'Hapag-Lloyd',
    CSNU: 'COSCO Shipping',
    TEMU: 'ONE',
    TCNU: 'CMA CGM',
  };
  return map[prefix] ?? 'MSC';
}

/** Customs agent — the proveedor of tipo 'proveedor' with aduana role in seed (ter-009). */
export function customsAgentName(): string {
  return getTercero('ter-009')?.nombre ?? 'Agencia de Aduanas Andina SAS';
}

const DAY_MS = 86_400_000;

/** Transit progress: day X of Y between zarpe and ETA, anchored to `now`. */
export function transitProgress(c: Contenedor, now: Date): { day: number; total: number; daysLeft: number } {
  const zarpe = c.fecha_zarpe ? new Date(`${c.fecha_zarpe}T00:00:00-05:00`) : now;
  const eta = c.fecha_arribo ? new Date(`${c.fecha_arribo}T00:00:00-05:00`) : now;
  const total = Math.max(1, Math.round((eta.getTime() - zarpe.getTime()) / DAY_MS));
  const day = Math.min(total, Math.max(1, Math.round((now.getTime() - zarpe.getTime()) / DAY_MS)));
  const daysLeft = Math.max(0, Math.round((eta.getTime() - now.getTime()) / DAY_MS));
  return { day, total, daysLeft };
}

/** Deterministic pseudo position for in-transit containers (demo telemetry). */
export function pseudoPosition(id: string): string {
  const h = hashOf(id);
  const latDeg = 5 + (h % 9);
  const latMin = 10 + (h % 49);
  const lonDeg = 108 + (h % 32);
  const lonMin = 5 + ((h >> 3) % 54);
  return `${latDeg}°${latMin}′N ${lonDeg}°${lonMin}′W`;
}

/** Distribution timestamps derived from zarpe date (flat-file pipeline runs 09:12–09:13). */
export function distTimestamps(c: Contenedor): { hgi: string; pbi: string; ia: string } {
  const base = c.fecha_zarpe ?? c.created_at.slice(0, 10);
  return {
    hgi: `${base}T09:12:00-05:00`,
    pbi: `${base}T09:13:00-05:00`,
    ia: `${base}T09:13:30-05:00`,
  };
}

/** Compras whose notes reference this container number. */
export function linkedCompras(c: Contenedor): Documento[] {
  return documentos.filter(
    (d) => d.tipo === 'compra' && (d.notas ?? '').includes(c.numero_contenedor),
  );
}

/** Advances (anticipos) tied to this container's linked compras. */
export function linkedAnticipos(c: Contenedor): AnticipoProveedor[] {
  const compraNums = new Set(linkedCompras(c).map((d) => d.numero));
  return anticiposProveedor.filter((a) => a.factura !== null && compraNums.has(a.factura));
}

/** Display id for an anticipo: ant-001 → ANT-001. */
export function anticipoLabel(id: string): string {
  return `ANT-${id.replace(/^ant-/, '')}`;
}
