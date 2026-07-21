/**
 * Espacios Hub — domain types.
 * Mirror of the Supabase schema (`espacios_hub_init_schema.sql`) with
 * snake_case fields and string ids (uuid on the backend).
 */

export type TerceroTipo = 'cliente' | 'proveedor' | 'proveedor_exterior';

export interface Tercero {
  id: string;
  nit: string | null;
  nombre: string;
  tipo: TerceroTipo;
  email: string | null;
  whatsapp: string | null;
  zona: string | null;
  created_at: string;
}

export interface Banco {
  id: string;
  nombre: string;
  sistema_origen: string;
  created_at: string;
}

export type DocumentoTipo = 'egreso' | 'recibo_caja' | 'compra' | 'factura' | 'causacion' | 'anticipo';
export type DocumentoEstado = 'pendiente' | 'sincronizado' | 'diferencia' | 'error';

export interface Documento {
  id: string;
  tipo: DocumentoTipo;
  sistema_origen: string;
  numero: string;
  tercero_id: string | null;
  banco_id: string | null;
  fecha: string; // ISO date
  valor: number;
  base: number;
  iva: number;
  retencion: number;
  estado: DocumentoEstado;
  sincronizado_hgi: boolean;
  idempotency_key: string | null;
  notas: string | null;
  created_at: string;
}

export type ContenedorEstado = 'en_transito' | 'arribado' | 'levante' | 'entregado';

export interface Contenedor {
  id: string;
  numero_contenedor: string;
  bl: string | null;
  /** Puerto de destino (Buenaventura / Cartagena). */
  puerto: string | null;
  /** Puerto/ciudad de origen — extensión del seed para la UI de Comex (no está en el SQL inicial). */
  origen: string | null;
  codigo_producto: string | null;
  producto: string | null;
  cantidad: number | null;
  estado: ContenedorEstado;
  fecha_zarpe: string | null;
  fecha_arribo: string | null; // ETA cuando estado = en_transito
  fecha_levante: string | null;
  recibido_fisico: boolean;
  comision_especial: number | null;
  created_at: string;
}

export interface Despacho {
  id: string;
  pedido: string;
  factura: string | null;
  tercero_id: string | null;
  contenedor_id: string | null;
  valor: number | null;
  flete: number | null;
  pct_flete: number | null;
  zona: string | null;
  despachado: boolean;
  fecha: string | null;
  created_at: string;
}

export type ComisionRegla = 'estandar' | 'contenedor_especial' | 'facturacion_anticipada' | 'demora_flete';
export type ComisionEstado = 'calculada' | 'pagada' | 'anulada';

export interface Comision {
  id: string;
  vendedor: string;
  pedido: string | null;
  contenedor_id: string | null;
  valor_base: number | null;
  pct: number | null;
  valor: number | null;
  regla: ComisionRegla;
  estado: ComisionEstado;
  created_at: string;
}

export interface AnticipoProveedor {
  id: string;
  proveedor_id: string | null;
  linea: string | null;
  valor: number | null;
  aplicado: boolean;
  factura: string | null;
  created_at: string;
}

export interface Reconciliacion {
  id: string;
  fecha: string;
  modulo: string;
  concepto: string;
  valor_siigo: number | null;
  valor_hgi: number | null;
  diferencia: number;
  resuelto: boolean;
  created_at: string;
}

export type SyncJobEstado = 'completado' | 'en_proceso' | 'error' | 'pendiente';
export type SyncDireccion = 'SIIGO->HGI' | 'HGI->SIIGO';

export interface SyncJob {
  id: string;
  modulo: string;
  direccion: SyncDireccion;
  started_at: string;
  finished_at: string | null;
  docs_procesados: number;
  docs_error: number;
  estado: SyncJobEstado;
  mensaje: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  accion: string | null;
  entidad: string | null;
  entidad_id: string | null;
  detalle: Record<string, unknown> | null;
  created_at: string;
}

/* ===== Derived / view-model types ===== */

export type ModuleKey = 'Tesoreria' | 'Cartera' | 'Comercio Exterior' | 'Comisiones' | 'Contabilidad' | 'Logistica';

export interface ModuleHealth {
  modulo: ModuleKey;
  ok: number;
  errores: number;
  total: number;
  /** 0–100 */
  tasaExito: number;
}

export interface TrendPoint {
  /** ISO date */
  fecha: string;
  /** short label, e.g. '01 jul' (locale-aware, set by caller) */
  conciliados: number;
  diferencias: number;
}
