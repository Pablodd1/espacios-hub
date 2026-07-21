/**
 * Espacios Hub — seed data module (frontend live data source)
 *
 * Mirrors the Supabase schema for the SIIGO <-> HGI ERP integration demo
 * (Espacios Importados, Colombia). Field names use snake_case to match the
 * SQL columns; check constraints are expressed as string-literal union types.
 *
 * NOTE: ids are stable human-readable strings (not uuids) so FK references are
 * easy to follow. Swap for gen_random_uuid() values when provisioning to
 * Supabase using espacios_hub_init_schema.sql / espacios_hub_seed_data.sql.
 */

// ---------------------------------------------------------------------------
// String-literal unions (mirror SQL CHECK constraints)
// ---------------------------------------------------------------------------
export type TipoTercero = 'cliente' | 'proveedor' | 'proveedor_exterior';
export type TipoDocumento =
  | 'egreso'
  | 'recibo_caja'
  | 'compra'
  | 'factura'
  | 'causacion'
  | 'anticipo';
export type EstadoDocumento = 'pendiente' | 'sincronizado' | 'diferencia' | 'error';
export type EstadoContenedor = 'en_transito' | 'arribado' | 'levante' | 'entregado';
export type ReglaComision =
  | 'estandar'
  | 'contenedor_especial'
  | 'facturacion_anticipada'
  | 'demora_flete';

// ---------------------------------------------------------------------------
// Table interfaces (snake_case fields, matching SQL columns)
// ---------------------------------------------------------------------------
export interface Tercero {
  id: string;
  nit: string | null;
  nombre: string;
  tipo: TipoTercero | null;
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

export interface Documento {
  id: string;
  tipo: TipoDocumento;
  sistema_origen: string;
  numero: string;
  tercero_id: string | null;
  banco_id: string | null;
  fecha: string;
  valor: number;
  base: number | null;
  iva: number | null;
  retencion: number | null;
  estado: EstadoDocumento;
  sincronizado_hgi: boolean;
  idempotency_key: string | null;
  notas: string | null;
  created_at: string;
}

export interface Contenedor {
  id: string;
  numero_contenedor: string;
  bl: string | null;
  puerto: string | null;
  codigo_producto: string | null;
  producto: string | null;
  cantidad: number | null;
  estado: EstadoContenedor;
  fecha_zarpe: string | null;
  fecha_arribo: string | null;
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

export interface Comision {
  id: string;
  vendedor: string;
  pedido: string | null;
  contenedor_id: string | null;
  valor_base: number | null;
  pct: number | null;
  valor: number | null;
  regla: ReglaComision;
  estado: string;
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
  /** Computed: valor_siigo - valor_hgi (GENERATED ALWAYS in SQL). */
  diferencia: number | null;
  resuelto: boolean;
  created_at: string;
}

export interface SyncJob {
  id: string;
  modulo: string;
  direccion: string;
  started_at: string;
  finished_at: string | null;
  docs_procesados: number;
  docs_error: number;
  estado: string;
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

/** Uniform seed timestamp for all rows. */
const SEED_CREATED_AT = '2025-06-26T12:00:00.000Z';

// ---------------------------------------------------------------------------
// terceros (10)
// ---------------------------------------------------------------------------
export const terceros: Tercero[] = [
  { id: 'ter-001', nit: '900123456-1', nombre: 'Muebles y Disenos Andinos SAS', tipo: 'cliente', email: 'compras@mueblesandinos.co', whatsapp: '+573105551234', zona: 'Bogota', created_at: SEED_CREATED_AT },
  { id: 'ter-002', nit: '901234567-2', nombre: 'Hogar Moderno Colombia SAS', tipo: 'cliente', email: 'gerencia@hogarmoderno.co', whatsapp: '+573115552345', zona: 'Medellin', created_at: SEED_CREATED_AT },
  { id: 'ter-003', nit: '890345678-3', nombre: 'Distribuidora El Confort Ltda', tipo: 'cliente', email: 'ventas@elconfort.co', whatsapp: '+573125553456', zona: 'Cali', created_at: SEED_CREATED_AT },
  { id: 'ter-004', nit: '900456789-4', nombre: 'Espacios Costeros SAS', tipo: 'cliente', email: 'contacto@espacioscosteros.co', whatsapp: '+573135554567', zona: 'Costa', created_at: SEED_CREATED_AT },
  { id: 'ter-005', nit: '901567890-5', nombre: 'Oficinas Corporativas del Norte SAS', tipo: 'cliente', email: 'admin@oficinorte.co', whatsapp: '+573145555678', zona: 'Bogota', created_at: SEED_CREATED_AT },
  { id: 'ter-006', nit: '890987654-6', nombre: 'Logistica Portuaria del Pacifico SAS', tipo: 'proveedor', email: 'operaciones@logpacifico.co', whatsapp: '+573155556789', zona: 'Buenaventura', created_at: SEED_CREATED_AT },
  { id: 'ter-007', nit: '900876543-7', nombre: 'Transportes Andinos de Carga SAS', tipo: 'proveedor', email: 'servicio@transandinos.co', whatsapp: '+573165557890', zona: 'Bogota', created_at: SEED_CREATED_AT },
  { id: 'ter-008', nit: 'CN913100MA1X1', nombre: 'Foshan Furniture Manufacturing Co Ltd', tipo: 'proveedor_exterior', email: 'sales@foshanfurniture.cn', whatsapp: '+8675788881234', zona: 'Foshan', created_at: SEED_CREATED_AT },
  { id: 'ter-009', nit: 'CN913302MA2Y2', nombre: 'Ningbo Home Decor Export Co Ltd', tipo: 'proveedor_exterior', email: 'export@ningbohomedecor.cn', whatsapp: '+8657487772233', zona: 'Ningbo', created_at: SEED_CREATED_AT },
  { id: 'ter-010', nit: 'CN914401MA3Z3', nombre: 'Guangzhou Office Solutions Trading', tipo: 'proveedor_exterior', email: 'trade@gzofficesol.cn', whatsapp: '+862036664455', zona: 'Guangzhou', created_at: SEED_CREATED_AT },
];

// ---------------------------------------------------------------------------
// bancos (3)
// ---------------------------------------------------------------------------
export const bancos: Banco[] = [
  { id: 'ban-diseno', nombre: 'Diseno', sistema_origen: 'SIIGO', created_at: SEED_CREATED_AT },
  { id: 'ban-agil-nomina', nombre: 'Agil Nomina', sistema_origen: 'SIIGO', created_at: SEED_CREATED_AT },
  { id: 'ban-espacios', nombre: 'Espacios', sistema_origen: 'SIIGO', created_at: SEED_CREATED_AT },
];

// ---------------------------------------------------------------------------
// documentos (25)
// ---------------------------------------------------------------------------
export const documentos: Documento[] = [
  // EGRESOS (6)
  { id: 'doc-001', tipo: 'egreso', sistema_origen: 'SIIGO', numero: 'EG-2025-0001', tercero_id: 'ter-006', banco_id: 'ban-espacios', fecha: '2025-06-03', valor: 18500000, base: 18500000, iva: 0, retencion: 0, estado: 'sincronizado', sincronizado_hgi: true, idempotency_key: 'SIIGO-EG-2025-0001', notas: 'Pago flete y manejo portuario', created_at: SEED_CREATED_AT },
  { id: 'doc-002', tipo: 'egreso', sistema_origen: 'SIIGO', numero: 'EG-2025-0002', tercero_id: 'ter-007', banco_id: 'ban-diseno', fecha: '2025-06-05', valor: 9200000, base: 9200000, iva: 0, retencion: 0, estado: 'sincronizado', sincronizado_hgi: true, idempotency_key: 'SIIGO-EG-2025-0002', notas: 'Transporte nacional contenedor', created_at: SEED_CREATED_AT },
  { id: 'doc-003', tipo: 'egreso', sistema_origen: 'SIIGO', numero: 'EG-2025-0003', tercero_id: 'ter-008', banco_id: 'ban-espacios', fecha: '2025-06-09', valor: 120000000, base: 120000000, iva: 0, retencion: 0, estado: 'sincronizado', sincronizado_hgi: true, idempotency_key: 'SIIGO-EG-2025-0003', notas: 'Giro proveedor exterior Foshan', created_at: SEED_CREATED_AT },
  { id: 'doc-004', tipo: 'egreso', sistema_origen: 'SIIGO', numero: 'EG-2025-0004', tercero_id: 'ter-009', banco_id: 'ban-diseno', fecha: '2025-06-12', valor: 85000000, base: 85000000, iva: 0, retencion: 0, estado: 'diferencia', sincronizado_hgi: false, idempotency_key: 'SIIGO-EG-2025-0004', notas: 'Diferencia TRM vs HGI', created_at: SEED_CREATED_AT },
  { id: 'doc-005', tipo: 'egreso', sistema_origen: 'SIIGO', numero: 'EG-2025-0005', tercero_id: 'ter-006', banco_id: 'ban-agil-nomina', fecha: '2025-06-16', valor: 6750000, base: 6750000, iva: 0, retencion: 0, estado: 'pendiente', sincronizado_hgi: false, idempotency_key: 'SIIGO-EG-2025-0005', notas: 'Pendiente causal HGI', created_at: SEED_CREATED_AT },
  { id: 'doc-006', tipo: 'egreso', sistema_origen: 'SIIGO', numero: 'EG-2025-0006', tercero_id: 'ter-010', banco_id: 'ban-espacios', fecha: '2025-06-20', valor: 95000000, base: 95000000, iva: 0, retencion: 0, estado: 'sincronizado', sincronizado_hgi: true, idempotency_key: 'SIIGO-EG-2025-0006', notas: 'Giro proveedor exterior Guangzhou', created_at: SEED_CREATED_AT },
  // RECIBOS DE CAJA (4)
  { id: 'doc-007', tipo: 'recibo_caja', sistema_origen: 'SIIGO', numero: 'RC-2025-0001', tercero_id: 'ter-001', banco_id: 'ban-diseno', fecha: '2025-06-04', valor: 32000000, base: 32000000, iva: 0, retencion: 0, estado: 'sincronizado', sincronizado_hgi: true, idempotency_key: 'SIIGO-RC-2025-0001', notas: 'Abono factura FV-2025-0001', created_at: SEED_CREATED_AT },
  { id: 'doc-008', tipo: 'recibo_caja', sistema_origen: 'SIIGO', numero: 'RC-2025-0002', tercero_id: 'ter-002', banco_id: 'ban-espacios', fecha: '2025-06-07', valor: 27500000, base: 27500000, iva: 0, retencion: 0, estado: 'sincronizado', sincronizado_hgi: true, idempotency_key: 'SIIGO-RC-2025-0002', notas: 'Recaudo cliente Medellin', created_at: SEED_CREATED_AT },
  { id: 'doc-009', tipo: 'recibo_caja', sistema_origen: 'SIIGO', numero: 'RC-2025-0003', tercero_id: 'ter-003', banco_id: 'ban-diseno', fecha: '2025-06-14', valor: 15800000, base: 15800000, iva: 0, retencion: 0, estado: 'pendiente', sincronizado_hgi: false, idempotency_key: 'SIIGO-RC-2025-0003', notas: 'Recaudo por aplicar', created_at: SEED_CREATED_AT },
  { id: 'doc-010', tipo: 'recibo_caja', sistema_origen: 'SIIGO', numero: 'RC-2025-0004', tercero_id: 'ter-004', banco_id: 'ban-agil-nomina', fecha: '2025-06-18', valor: 21300000, base: 21300000, iva: 0, retencion: 0, estado: 'sincronizado', sincronizado_hgi: true, idempotency_key: 'SIIGO-RC-2025-0004', notas: 'Recaudo Costa', created_at: SEED_CREATED_AT },
  // COMPRAS (5)
  { id: 'doc-011', tipo: 'compra', sistema_origen: 'SIIGO', numero: 'CP-2025-0001', tercero_id: 'ter-008', banco_id: null, fecha: '2025-05-28', valor: 142800000, base: 120000000, iva: 22800000, retencion: 0, estado: 'sincronizado', sincronizado_hgi: true, idempotency_key: 'SIIGO-CP-2025-0001', notas: 'Compra muebles Foshan contenedor MSKU1234567', created_at: SEED_CREATED_AT },
  { id: 'doc-012', tipo: 'compra', sistema_origen: 'SIIGO', numero: 'CP-2025-0002', tercero_id: 'ter-009', banco_id: null, fecha: '2025-05-30', valor: 101150000, base: 85000000, iva: 16150000, retencion: 0, estado: 'sincronizado', sincronizado_hgi: true, idempotency_key: 'SIIGO-CP-2025-0002', notas: 'Compra decoracion Ningbo', created_at: SEED_CREATED_AT },
  { id: 'doc-013', tipo: 'compra', sistema_origen: 'SIIGO', numero: 'CP-2025-0003', tercero_id: 'ter-010', banco_id: null, fecha: '2025-06-02', valor: 113050000, base: 95000000, iva: 18050000, retencion: 0, estado: 'diferencia', sincronizado_hgi: false, idempotency_key: 'SIIGO-CP-2025-0003', notas: 'IVA difiere vs HGI', created_at: SEED_CREATED_AT },
  { id: 'doc-014', tipo: 'compra', sistema_origen: 'SIIGO', numero: 'CP-2025-0004', tercero_id: 'ter-006', banco_id: null, fecha: '2025-06-10', valor: 7140000, base: 6000000, iva: 1140000, retencion: 0, estado: 'sincronizado', sincronizado_hgi: true, idempotency_key: 'SIIGO-CP-2025-0004', notas: 'Servicios portuarios', created_at: SEED_CREATED_AT },
  { id: 'doc-015', tipo: 'compra', sistema_origen: 'SIIGO', numero: 'CP-2025-0005', tercero_id: 'ter-008', banco_id: null, fecha: '2025-06-21', valor: 130900000, base: 110000000, iva: 20900000, retencion: 0, estado: 'sincronizado', sincronizado_hgi: true, idempotency_key: 'SIIGO-CP-2025-0005', notas: 'Compra reposicion Foshan', created_at: SEED_CREATED_AT },
  // FACTURAS (5)
  { id: 'doc-016', tipo: 'factura', sistema_origen: 'SIIGO', numero: 'FV-2025-0001', tercero_id: 'ter-001', banco_id: null, fecha: '2025-06-01', valor: 38080000, base: 32000000, iva: 6080000, retencion: 800000, estado: 'sincronizado', sincronizado_hgi: true, idempotency_key: 'SIIGO-FV-2025-0001', notas: 'Venta muebles Bogota', created_at: SEED_CREATED_AT },
  { id: 'doc-017', tipo: 'factura', sistema_origen: 'SIIGO', numero: 'FV-2025-0002', tercero_id: 'ter-002', banco_id: null, fecha: '2025-06-06', valor: 32725000, base: 27500000, iva: 5225000, retencion: 687500, estado: 'sincronizado', sincronizado_hgi: true, idempotency_key: 'SIIGO-FV-2025-0002', notas: 'Venta Medellin', created_at: SEED_CREATED_AT },
  { id: 'doc-018', tipo: 'factura', sistema_origen: 'SIIGO', numero: 'FV-2025-0003', tercero_id: 'ter-003', banco_id: null, fecha: '2025-06-13', valor: 18802000, base: 15800000, iva: 3002000, retencion: 395000, estado: 'pendiente', sincronizado_hgi: false, idempotency_key: 'SIIGO-FV-2025-0003', notas: 'Venta Cali pendiente cruce', created_at: SEED_CREATED_AT },
  { id: 'doc-019', tipo: 'factura', sistema_origen: 'SIIGO', numero: 'FV-2025-0004', tercero_id: 'ter-004', banco_id: null, fecha: '2025-06-17', valor: 25347000, base: 21300000, iva: 4047000, retencion: 532500, estado: 'sincronizado', sincronizado_hgi: true, idempotency_key: 'SIIGO-FV-2025-0004', notas: 'Venta Costa', created_at: SEED_CREATED_AT },
  { id: 'doc-020', tipo: 'factura', sistema_origen: 'SIIGO', numero: 'FV-2025-0005', tercero_id: 'ter-005', banco_id: null, fecha: '2025-06-22', valor: 45220000, base: 38000000, iva: 7220000, retencion: 950000, estado: 'error', sincronizado_hgi: false, idempotency_key: 'SIIGO-FV-2025-0005', notas: 'Error numeracion HGI', created_at: SEED_CREATED_AT },
  // CAUSACIONES (3)
  { id: 'doc-021', tipo: 'causacion', sistema_origen: 'SIIGO', numero: 'CAU-2025-0001', tercero_id: 'ter-007', banco_id: null, fecha: '2025-06-08', valor: 4500000, base: 4500000, iva: 0, retencion: 0, estado: 'sincronizado', sincronizado_hgi: true, idempotency_key: 'SIIGO-CAU-2025-0001', notas: 'Causacion flete interno', created_at: SEED_CREATED_AT },
  { id: 'doc-022', tipo: 'causacion', sistema_origen: 'SIIGO', numero: 'CAU-2025-0002', tercero_id: 'ter-006', banco_id: null, fecha: '2025-06-11', valor: 3200000, base: 3200000, iva: 0, retencion: 0, estado: 'sincronizado', sincronizado_hgi: true, idempotency_key: 'SIIGO-CAU-2025-0002', notas: 'Causacion almacenamiento', created_at: SEED_CREATED_AT },
  { id: 'doc-023', tipo: 'causacion', sistema_origen: 'SIIGO', numero: 'CAU-2025-0003', tercero_id: 'ter-007', banco_id: null, fecha: '2025-06-19', valor: 5100000, base: 5100000, iva: 0, retencion: 0, estado: 'pendiente', sincronizado_hgi: false, idempotency_key: 'SIIGO-CAU-2025-0003', notas: 'Causacion por confirmar', created_at: SEED_CREATED_AT },
  // ANTICIPOS (2)
  { id: 'doc-024', tipo: 'anticipo', sistema_origen: 'SIIGO', numero: 'ANT-2025-0001', tercero_id: 'ter-008', banco_id: 'ban-espacios', fecha: '2025-05-25', valor: 60000000, base: 60000000, iva: 0, retencion: 0, estado: 'sincronizado', sincronizado_hgi: true, idempotency_key: 'SIIGO-ANT-2025-0001', notas: 'Anticipo 50% orden Foshan', created_at: SEED_CREATED_AT },
  { id: 'doc-025', tipo: 'anticipo', sistema_origen: 'SIIGO', numero: 'ANT-2025-0002', tercero_id: 'ter-009', banco_id: 'ban-diseno', fecha: '2025-05-27', valor: 42500000, base: 42500000, iva: 0, retencion: 0, estado: 'pendiente', sincronizado_hgi: false, idempotency_key: 'SIIGO-ANT-2025-0002', notas: 'Anticipo orden Ningbo', created_at: SEED_CREATED_AT },
];

// ---------------------------------------------------------------------------
// contenedores (8)
// ---------------------------------------------------------------------------
export const contenedores: Contenedor[] = [
  { id: 'con-001', numero_contenedor: 'MSKU1234567', bl: 'MSKUSH1234567', puerto: 'Buenaventura', codigo_producto: 'SOFA-3P-GRY', producto: 'Sofa 3 puestos gris', cantidad: 120, estado: 'entregado', fecha_zarpe: '2025-04-10', fecha_arribo: '2025-05-15', fecha_levante: '2025-05-18', recibido_fisico: true, comision_especial: null, created_at: SEED_CREATED_AT },
  { id: 'con-002', numero_contenedor: 'MSKU2345678', bl: 'MSKUSH2345678', puerto: 'Cartagena', codigo_producto: 'MESA-COM-6S', producto: 'Mesa comedor 6 sillas', cantidad: 80, estado: 'levante', fecha_zarpe: '2025-04-20', fecha_arribo: '2025-05-25', fecha_levante: '2025-05-28', recibido_fisico: true, comision_especial: 3.0, created_at: SEED_CREATED_AT },
  { id: 'con-003', numero_contenedor: 'TCLU3456789', bl: 'TCLUNB3456789', puerto: 'Buenaventura', codigo_producto: 'CAMA-QN-TAP', producto: 'Cama queen tapizada', cantidad: 95, estado: 'arribado', fecha_zarpe: '2025-05-02', fecha_arribo: '2025-06-05', fecha_levante: null, recibido_fisico: false, comision_especial: null, created_at: SEED_CREATED_AT },
  { id: 'con-004', numero_contenedor: 'MSKU4567890', bl: 'MSKUSH4567890', puerto: 'Shanghai', codigo_producto: 'ESC-OF-ERG', producto: 'Escritorio oficina ergonomico', cantidad: 150, estado: 'en_transito', fecha_zarpe: '2025-06-01', fecha_arribo: null, fecha_levante: null, recibido_fisico: false, comision_especial: null, created_at: SEED_CREATED_AT },
  { id: 'con-005', numero_contenedor: 'TCLU5678901', bl: 'TCLUNB5678901', puerto: 'Ningbo', codigo_producto: 'SILLA-OF-MESH', producto: 'Silla oficina mesh', cantidad: 200, estado: 'en_transito', fecha_zarpe: '2025-06-08', fecha_arribo: null, fecha_levante: null, recibido_fisico: false, comision_especial: null, created_at: SEED_CREATED_AT },
  { id: 'con-006', numero_contenedor: 'MSKU6789012', bl: 'MSKUSH6789012', puerto: 'Buenaventura', codigo_producto: 'EST-LIB-5N', producto: 'Estanteria libros 5 niveles', cantidad: 60, estado: 'arribado', fecha_zarpe: '2025-05-10', fecha_arribo: '2025-06-12', fecha_levante: null, recibido_fisico: false, comision_especial: 2.5, created_at: SEED_CREATED_AT },
  { id: 'con-007', numero_contenedor: 'TCLU7890123', bl: 'TCLUNB7890123', puerto: 'Cartagena', codigo_producto: 'SOFA-2P-BEJ', producto: 'Sofa 2 puestos beige', cantidad: 110, estado: 'levante', fecha_zarpe: '2025-04-15', fecha_arribo: '2025-05-20', fecha_levante: '2025-05-23', recibido_fisico: true, comision_especial: null, created_at: SEED_CREATED_AT },
  { id: 'con-008', numero_contenedor: 'MSKU8901234', bl: 'MSKUSH8901234', puerto: 'Shanghai', codigo_producto: 'MESA-NOC-2C', producto: 'Mesa de noche 2 cajones', cantidad: 140, estado: 'en_transito', fecha_zarpe: '2025-06-15', fecha_arribo: null, fecha_levante: null, recibido_fisico: false, comision_especial: null, created_at: SEED_CREATED_AT },
];

// ---------------------------------------------------------------------------
// despachos (8)
// ---------------------------------------------------------------------------
export const despachos: Despacho[] = [
  { id: 'des-001', pedido: 'PED-1001', factura: 'FV-2025-0001', tercero_id: 'ter-001', contenedor_id: 'con-001', valor: 38080000, flete: 1200000, pct_flete: 3.15, zona: 'Bogota', despachado: true, fecha: '2025-06-02', created_at: SEED_CREATED_AT },
  { id: 'des-002', pedido: 'PED-1002', factura: 'FV-2025-0002', tercero_id: 'ter-002', contenedor_id: 'con-002', valor: 32725000, flete: 1650000, pct_flete: 5.04, zona: 'Medellin', despachado: true, fecha: '2025-06-07', created_at: SEED_CREATED_AT },
  { id: 'des-003', pedido: 'PED-1003', factura: 'FV-2025-0003', tercero_id: 'ter-003', contenedor_id: 'con-003', valor: 18802000, flete: 1400000, pct_flete: 7.45, zona: 'Cali', despachado: false, fecha: '2025-06-14', created_at: SEED_CREATED_AT },
  { id: 'des-004', pedido: 'PED-1004', factura: 'FV-2025-0004', tercero_id: 'ter-004', contenedor_id: 'con-007', valor: 25347000, flete: 2100000, pct_flete: 8.28, zona: 'Costa', despachado: true, fecha: '2025-06-18', created_at: SEED_CREATED_AT },
  { id: 'des-005', pedido: 'PED-1005', factura: null, tercero_id: 'ter-005', contenedor_id: 'con-006', valor: 22000000, flete: 950000, pct_flete: 4.32, zona: 'Bogota', despachado: false, fecha: '2025-06-23', created_at: SEED_CREATED_AT },
  { id: 'des-006', pedido: 'PED-1006', factura: 'FV-2025-0001', tercero_id: 'ter-001', contenedor_id: 'con-002', valor: 15000000, flete: 780000, pct_flete: 5.2, zona: 'Bogota', despachado: true, fecha: '2025-06-09', created_at: SEED_CREATED_AT },
  { id: 'des-007', pedido: 'PED-1007', factura: null, tercero_id: 'ter-002', contenedor_id: 'con-004', valor: 28000000, flete: 1500000, pct_flete: 5.36, zona: 'Medellin', despachado: false, fecha: '2025-06-25', created_at: SEED_CREATED_AT },
  { id: 'des-008', pedido: 'PED-1008', factura: 'FV-2025-0002', tercero_id: 'ter-003', contenedor_id: 'con-005', valor: 19500000, flete: 1300000, pct_flete: 6.67, zona: 'Cali', despachado: false, fecha: '2025-06-26', created_at: SEED_CREATED_AT },
];

// ---------------------------------------------------------------------------
// comisiones (10)
// ---------------------------------------------------------------------------
export const comisiones: Comision[] = [
  { id: 'com-001', vendedor: 'Carlos Ramirez', pedido: 'PED-1001', contenedor_id: 'con-001', valor_base: 38080000, pct: 2.0, valor: 761600, regla: 'estandar', estado: 'calculada', created_at: SEED_CREATED_AT },
  { id: 'com-002', vendedor: 'Maria Fernanda Lopez', pedido: 'PED-1002', contenedor_id: 'con-002', valor_base: 32725000, pct: 3.0, valor: 981750, regla: 'contenedor_especial', estado: 'calculada', created_at: SEED_CREATED_AT },
  { id: 'com-003', vendedor: 'Carlos Ramirez', pedido: 'PED-1003', contenedor_id: 'con-003', valor_base: 18802000, pct: 2.0, valor: 376040, regla: 'estandar', estado: 'calculada', created_at: SEED_CREATED_AT },
  { id: 'com-004', vendedor: 'Andres Mejia', pedido: 'PED-1004', contenedor_id: 'con-007', valor_base: 25347000, pct: 2.5, valor: 633675, regla: 'facturacion_anticipada', estado: 'pagada', created_at: SEED_CREATED_AT },
  { id: 'com-005', vendedor: 'Maria Fernanda Lopez', pedido: 'PED-1005', contenedor_id: 'con-006', valor_base: 22000000, pct: 2.5, valor: 550000, regla: 'contenedor_especial', estado: 'calculada', created_at: SEED_CREATED_AT },
  { id: 'com-006', vendedor: 'Carlos Ramirez', pedido: 'PED-1006', contenedor_id: 'con-002', valor_base: 15000000, pct: 2.0, valor: 300000, regla: 'estandar', estado: 'pagada', created_at: SEED_CREATED_AT },
  { id: 'com-007', vendedor: 'Andres Mejia', pedido: 'PED-1007', contenedor_id: 'con-004', valor_base: 28000000, pct: 1.5, valor: 420000, regla: 'demora_flete', estado: 'calculada', created_at: SEED_CREATED_AT },
  { id: 'com-008', vendedor: 'Maria Fernanda Lopez', pedido: 'PED-1008', contenedor_id: 'con-005', valor_base: 19500000, pct: 2.0, valor: 390000, regla: 'estandar', estado: 'calculada', created_at: SEED_CREATED_AT },
  { id: 'com-009', vendedor: 'Carlos Ramirez', pedido: 'PED-1001', contenedor_id: 'con-001', valor_base: 38080000, pct: 0.5, valor: 190400, regla: 'demora_flete', estado: 'anulada', created_at: SEED_CREATED_AT },
  { id: 'com-010', vendedor: 'Andres Mejia', pedido: 'PED-1004', contenedor_id: 'con-007', valor_base: 25347000, pct: 2.0, valor: 506940, regla: 'estandar', estado: 'calculada', created_at: SEED_CREATED_AT },
];

// ---------------------------------------------------------------------------
// anticipos_proveedor (6) -> exported as anticiposProveedor
// ---------------------------------------------------------------------------
export const anticiposProveedor: AnticipoProveedor[] = [
  { id: 'ant-001', proveedor_id: 'ter-008', linea: 'Sofas', valor: 60000000, aplicado: true, factura: 'CP-2025-0001', created_at: SEED_CREATED_AT },
  { id: 'ant-002', proveedor_id: 'ter-009', linea: 'Decoracion', valor: 42500000, aplicado: false, factura: null, created_at: SEED_CREATED_AT },
  { id: 'ant-003', proveedor_id: 'ter-010', linea: 'Oficina', valor: 47500000, aplicado: true, factura: 'CP-2025-0003', created_at: SEED_CREATED_AT },
  { id: 'ant-004', proveedor_id: 'ter-008', linea: 'Reposicion', valor: 55000000, aplicado: false, factura: null, created_at: SEED_CREATED_AT },
  { id: 'ant-005', proveedor_id: 'ter-009', linea: 'Sillas', valor: 30000000, aplicado: true, factura: 'CP-2025-0002', created_at: SEED_CREATED_AT },
  { id: 'ant-006', proveedor_id: 'ter-010', linea: 'Escritorios', valor: 25000000, aplicado: false, factura: null, created_at: SEED_CREATED_AT },
];

// ---------------------------------------------------------------------------
// reconciliacion (12) — diferencia precomputed as (valor_siigo - valor_hgi)
// ---------------------------------------------------------------------------
export const reconciliacion: Reconciliacion[] = [
  { id: 'rec-001', fecha: '2025-06-05', modulo: 'Tesoreria', concepto: 'Egresos', valor_siigo: 27700000, valor_hgi: 27700000, diferencia: 0, resuelto: true, created_at: SEED_CREATED_AT },
  { id: 'rec-002', fecha: '2025-06-05', modulo: 'Cartera', concepto: 'Recibos', valor_siigo: 32000000, valor_hgi: 32000000, diferencia: 0, resuelto: true, created_at: SEED_CREATED_AT },
  { id: 'rec-003', fecha: '2025-06-10', modulo: 'Contabilidad', concepto: 'Bases', valor_siigo: 120000000, valor_hgi: 120000000, diferencia: 0, resuelto: true, created_at: SEED_CREATED_AT },
  { id: 'rec-004', fecha: '2025-06-10', modulo: 'Contabilidad', concepto: 'IVA', valor_siigo: 22800000, valor_hgi: 22800000, diferencia: 0, resuelto: true, created_at: SEED_CREATED_AT },
  { id: 'rec-005', fecha: '2025-06-12', modulo: 'Tesoreria', concepto: 'Egresos', valor_siigo: 85000000, valor_hgi: 84350000, diferencia: 650000, resuelto: false, created_at: SEED_CREATED_AT },
  { id: 'rec-006', fecha: '2025-06-15', modulo: 'Contabilidad', concepto: 'Retenciones', valor_siigo: 800000, valor_hgi: 800000, diferencia: 0, resuelto: true, created_at: SEED_CREATED_AT },
  { id: 'rec-007', fecha: '2025-06-15', modulo: 'Cartera', concepto: 'Recibos', valor_siigo: 27500000, valor_hgi: 27500000, diferencia: 0, resuelto: true, created_at: SEED_CREATED_AT },
  { id: 'rec-008', fecha: '2025-06-18', modulo: 'Contabilidad', concepto: 'IVA', valor_siigo: 18050000, valor_hgi: 17900000, diferencia: 150000, resuelto: false, created_at: SEED_CREATED_AT },
  { id: 'rec-009', fecha: '2025-06-20', modulo: 'Tesoreria', concepto: 'Anticipos', valor_siigo: 60000000, valor_hgi: 60000000, diferencia: 0, resuelto: true, created_at: SEED_CREATED_AT },
  { id: 'rec-010', fecha: '2025-06-20', modulo: 'Contabilidad', concepto: 'Bases', valor_siigo: 95000000, valor_hgi: 95000000, diferencia: 0, resuelto: true, created_at: SEED_CREATED_AT },
  { id: 'rec-011', fecha: '2025-06-22', modulo: 'Cartera', concepto: 'Recibos', valor_siigo: 21300000, valor_hgi: 21300000, diferencia: 0, resuelto: true, created_at: SEED_CREATED_AT },
  { id: 'rec-012', fecha: '2025-06-25', modulo: 'Contabilidad', concepto: 'Retenciones', valor_siigo: 532500, valor_hgi: 530000, diferencia: 2500, resuelto: false, created_at: SEED_CREATED_AT },
];

// ---------------------------------------------------------------------------
// sync_jobs (8) -> exported as syncJobs
// ---------------------------------------------------------------------------
export const syncJobs: SyncJob[] = [
  { id: 'job-001', modulo: 'Tesoreria', direccion: 'SIIGO->HGI', started_at: '2025-06-05T08:00:00.000Z', finished_at: '2025-06-05T08:02:15.000Z', docs_procesados: 12, docs_error: 0, estado: 'completado', mensaje: 'Egresos y recibos sincronizados', created_at: SEED_CREATED_AT },
  { id: 'job-002', modulo: 'Cartera', direccion: 'SIIGO->HGI', started_at: '2025-06-06T08:00:00.000Z', finished_at: '2025-06-06T08:01:40.000Z', docs_procesados: 8, docs_error: 0, estado: 'completado', mensaje: null, created_at: SEED_CREATED_AT },
  { id: 'job-003', modulo: 'Comercio Exterior', direccion: 'SIIGO->HGI', started_at: '2025-06-08T09:00:00.000Z', finished_at: '2025-06-08T09:05:22.000Z', docs_procesados: 5, docs_error: 0, estado: 'completado', mensaje: 'Contenedores actualizados', created_at: SEED_CREATED_AT },
  { id: 'job-004', modulo: 'Contabilidad', direccion: 'SIIGO->HGI', started_at: '2025-06-10T07:30:00.000Z', finished_at: '2025-06-10T07:34:10.000Z', docs_procesados: 20, docs_error: 1, estado: 'completado', mensaje: '1 documento con advertencia', created_at: SEED_CREATED_AT },
  { id: 'job-005', modulo: 'Logistica', direccion: 'SIIGO->HGI', started_at: '2025-06-12T10:00:00.000Z', finished_at: '2025-06-12T10:03:05.000Z', docs_procesados: 8, docs_error: 0, estado: 'completado', mensaje: null, created_at: SEED_CREATED_AT },
  { id: 'job-006', modulo: 'Tesoreria', direccion: 'HGI->SIIGO', started_at: '2025-06-15T08:00:00.000Z', finished_at: '2025-06-15T08:02:00.000Z', docs_procesados: 6, docs_error: 0, estado: 'completado', mensaje: null, created_at: SEED_CREATED_AT },
  { id: 'job-007', modulo: 'Contabilidad', direccion: 'SIIGO->HGI', started_at: '2025-06-18T07:30:00.000Z', finished_at: '2025-06-18T07:35:45.000Z', docs_procesados: 15, docs_error: 2, estado: 'error', mensaje: '2 documentos con diferencia TRM', created_at: SEED_CREATED_AT },
  { id: 'job-008', modulo: 'Comercio Exterior', direccion: 'SIIGO->HGI', started_at: '2025-06-20T09:00:00.000Z', finished_at: null, docs_procesados: 0, docs_error: 0, estado: 'en_proceso', mensaje: 'Sincronizacion en curso', created_at: SEED_CREATED_AT },
];

// ---------------------------------------------------------------------------
// audit_log (8) -> exported as auditLog
// ---------------------------------------------------------------------------
export const auditLog: AuditLog[] = [
  { id: 'aud-001', actor: 'system', accion: 'sync', entidad: 'documentos', entidad_id: 'EG-2025-0001', detalle: { modulo: 'Tesoreria', resultado: 'ok' }, created_at: SEED_CREATED_AT },
  { id: 'aud-002', actor: 'system', accion: 'sync', entidad: 'documentos', entidad_id: 'EG-2025-0004', detalle: { modulo: 'Tesoreria', resultado: 'diferencia', motivo: 'TRM' }, created_at: SEED_CREATED_AT },
  { id: 'aud-003', actor: 'admin@espacios.co', accion: 'create', entidad: 'terceros', entidad_id: 'Muebles y Disenos Andinos SAS', detalle: { tipo: 'cliente' }, created_at: SEED_CREATED_AT },
  { id: 'aud-004', actor: 'system', accion: 'sync', entidad: 'contenedores', entidad_id: 'MSKU1234567', detalle: { estado: 'entregado' }, created_at: SEED_CREATED_AT },
  { id: 'aud-005', actor: 'contador@espacios.co', accion: 'update', entidad: 'reconciliacion', entidad_id: 'Egresos 2025-06-12', detalle: { accion: 'marcar diferencia' }, created_at: SEED_CREATED_AT },
  { id: 'aud-006', actor: 'system', accion: 'sync', entidad: 'documentos', entidad_id: 'FV-2025-0005', detalle: { resultado: 'error', motivo: 'numeracion' }, created_at: SEED_CREATED_AT },
  { id: 'aud-007', actor: 'admin@espacios.co', accion: 'create', entidad: 'comisiones', entidad_id: 'PED-1001', detalle: { vendedor: 'Carlos Ramirez' }, created_at: SEED_CREATED_AT },
  { id: 'aud-008', actor: 'system', accion: 'sync', entidad: 'sync_jobs', entidad_id: 'Contabilidad 2025-06-18', detalle: { docs_error: 2 }, created_at: SEED_CREATED_AT },
];
