/**
 * Espacios Hub — typed in-memory seed dataset.
 * Mirrors the Supabase tables (snake_case fields, string ids).
 * Demo reference date: Tuesday 2026-07-21 ~14:32 (COT) — see `REFERENCE_NOW`
 * in `src/lib/data.ts`. All "recent" timestamps are anchored to it.
 */
import type {
  AnticipoProveedor,
  AuditLog,
  Banco,
  Comision,
  Contenedor,
  Despacho,
  Documento,
  Reconciliacion,
  SyncJob,
  Tercero,
} from './types';

const T0 = '2026-07-21T14:32:00-05:00';

/* ============ TERCEROS (12) ============ */
export const terceros: Tercero[] = [
  { id: 'ter-001', nit: '900123456-1', nombre: 'Muebles y Diseños Andinos SAS', tipo: 'cliente', email: 'compras@mueblesandinos.co', whatsapp: '+573105551234', zona: 'Bogotá', created_at: '2026-01-15T08:00:00-05:00' },
  { id: 'ter-002', nit: '901234567-2', nombre: 'Hogar Moderno Colombia SAS', tipo: 'cliente', email: 'gerencia@hogarmoderno.co', whatsapp: '+573115552345', zona: 'Medellín', created_at: '2026-01-18T08:00:00-05:00' },
  { id: 'ter-003', nit: '890345678-3', nombre: 'Distribuidora El Confort Ltda', tipo: 'cliente', email: 'ventas@elconfort.co', whatsapp: '+573125553456', zona: 'Cali', created_at: '2026-02-02T08:00:00-05:00' },
  { id: 'ter-004', nit: '900456789-4', nombre: 'Espacios Costeros SAS', tipo: 'cliente', email: 'contacto@espacioscosteros.co', whatsapp: '+573135554567', zona: 'Costa', created_at: '2026-02-10T08:00:00-05:00' },
  { id: 'ter-005', nit: '901567890-5', nombre: 'Oficinas Corporativas del Norte SAS', tipo: 'cliente', email: 'admin@oficinorte.co', whatsapp: '+573145555678', zona: 'Bogotá', created_at: '2026-03-01T08:00:00-05:00' },
  { id: 'ter-006', nit: '901678901-6', nombre: 'Inversiones La Cascada SAS', tipo: 'cliente', email: 'compras@lacascada.co', whatsapp: '+573155556789', zona: 'Bucaramanga', created_at: '2026-03-12T08:00:00-05:00' },
  { id: 'ter-007', nit: '890987654-6', nombre: 'Logística Portuaria del Pacífico SAS', tipo: 'proveedor', email: 'operaciones@logpacifico.co', whatsapp: '+573165557890', zona: 'Buenaventura', created_at: '2026-01-05T08:00:00-05:00' },
  { id: 'ter-008', nit: '900876543-7', nombre: 'Transportes Andinos de Carga SAS', tipo: 'proveedor', email: 'servicio@transandinos.co', whatsapp: '+573175558901', zona: 'Bogotá', created_at: '2026-01-05T08:00:00-05:00' },
  { id: 'ter-009', nit: '900765432-8', nombre: 'Agencia de Aduanas Andina SAS', tipo: 'proveedor', email: 'tramites@aduanasandina.co', whatsapp: '+573185559012', zona: 'Bogotá', created_at: '2026-01-08T08:00:00-05:00' },
  { id: 'ter-010', nit: 'CN913100MA1X1', nombre: 'Foshan Furniture Manufacturing Co Ltd', tipo: 'proveedor_exterior', email: 'sales@foshanfurniture.cn', whatsapp: '+8675788881234', zona: 'Foshan', created_at: '2026-01-20T08:00:00-05:00' },
  { id: 'ter-011', nit: 'CN913302MA2Y2', nombre: 'Ningbo Home Decor Export Co Ltd', tipo: 'proveedor_exterior', email: 'export@ningbohomedecor.cn', whatsapp: '+8657487772233', zona: 'Ningbo', created_at: '2026-01-22T08:00:00-05:00' },
  { id: 'ter-012', nit: 'CN914401MA3Z3', nombre: 'Guangzhou Office Solutions Trading', tipo: 'proveedor_exterior', email: 'trade@gzofficesol.cn', whatsapp: '+862036664455', zona: 'Guangzhou', created_at: '2026-02-15T08:00:00-05:00' },
];

/* ============ BANCOS (3) ============ */
export const bancos: Banco[] = [
  { id: 'ban-001', nombre: 'Diseño', sistema_origen: 'SIIGO', created_at: '2026-01-01T08:00:00-05:00' },
  { id: 'ban-002', nombre: 'Ágil Nómina', sistema_origen: 'SIIGO', created_at: '2026-01-01T08:00:00-05:00' },
  { id: 'ban-003', nombre: 'Espacios', sistema_origen: 'SIIGO', created_at: '2026-01-01T08:00:00-05:00' },
];

/* ============ DOCUMENTOS (25) ============ */
export const documentos: Documento[] = [
  // -- Egresos (7): refs E-2024-11xx used by dashboard demo
  { id: 'doc-001', tipo: 'egreso', sistema_origen: 'SIIGO', numero: 'E-2024-1187', tercero_id: 'ter-007', banco_id: 'ban-001', fecha: '2026-07-21', valor: 18500000, base: 18500000, iva: 0, retencion: 0, estado: 'sincronizado', sincronizado_hgi: true, idempotency_key: 'SIIGO-E-2024-1187', notas: 'Pago flete y manejo portuario · Banco Diseño', created_at: '2026-07-21T14:28:00-05:00' },
  { id: 'doc-002', tipo: 'egreso', sistema_origen: 'SIIGO', numero: 'E-2024-1175', tercero_id: 'ter-008', banco_id: 'ban-003', fecha: '2026-07-19', valor: 84350000, base: 84350000, iva: 0, retencion: 0, estado: 'diferencia', sincronizado_hgi: false, idempotency_key: 'SIIGO-E-2024-1175', notas: 'Diferencia TRM vs HGI', created_at: '2026-07-19T09:10:00-05:00' },
  { id: 'doc-003', tipo: 'egreso', sistema_origen: 'SIIGO', numero: 'E-2024-1188', tercero_id: 'ter-010', banco_id: 'ban-003', fecha: '2026-07-21', valor: 120000000, base: 120000000, iva: 0, retencion: 0, estado: 'sincronizado', sincronizado_hgi: true, idempotency_key: 'SIIGO-E-2024-1188', notas: 'Giro proveedor exterior Foshan', created_at: '2026-07-21T08:15:00-05:00' },
  { id: 'doc-004', tipo: 'egreso', sistema_origen: 'SIIGO', numero: 'E-2024-1189', tercero_id: 'ter-009', banco_id: 'ban-002', fecha: '2026-07-20', valor: 6750000, base: 6750000, iva: 0, retencion: 0, estado: 'pendiente', sincronizado_hgi: false, idempotency_key: 'SIIGO-E-2024-1189', notas: 'Pendiente causal HGI', created_at: '2026-07-20T16:40:00-05:00' },
  { id: 'doc-005', tipo: 'egreso', sistema_origen: 'SIIGO', numero: 'E-2024-1190', tercero_id: 'ter-011', banco_id: 'ban-001', fecha: '2026-07-18', valor: 85000000, base: 85000000, iva: 0, retencion: 0, estado: 'sincronizado', sincronizado_hgi: true, idempotency_key: 'SIIGO-E-2024-1190', notas: 'Giro proveedor Ningbo', created_at: '2026-07-18T11:05:00-05:00' },
  { id: 'doc-006', tipo: 'egreso', sistema_origen: 'SIIGO', numero: 'E-2024-1191', tercero_id: 'ter-008', banco_id: 'ban-002', fecha: '2026-07-17', valor: 9200000, base: 9200000, iva: 0, retencion: 0, estado: 'sincronizado', sincronizado_hgi: true, idempotency_key: 'SIIGO-E-2024-1191', notas: 'Transporte nacional contenedor', created_at: '2026-07-17T10:20:00-05:00' },
  { id: 'doc-007', tipo: 'egreso', sistema_origen: 'SIIGO', numero: 'E-2024-1192', tercero_id: 'ter-012', banco_id: 'ban-003', fecha: '2026-07-16', valor: 95000000, base: 95000000, iva: 0, retencion: 0, estado: 'sincronizado', sincronizado_hgi: true, idempotency_key: 'SIIGO-E-2024-1192', notas: 'Giro proveedor exterior Guangzhou', created_at: '2026-07-16T09:00:00-05:00' },
  // -- Recibos de caja (5)
  { id: 'doc-008', tipo: 'recibo_caja', sistema_origen: 'SIIGO', numero: 'RC-5521', tercero_id: 'ter-002', banco_id: 'ban-003', fecha: '2026-07-21', valor: 27500000, base: 27500000, iva: 0, retencion: 0, estado: 'pendiente', sincronizado_hgi: false, idempotency_key: 'SIIGO-RC-5521', notas: 'Recaudo cliente Medellín', created_at: '2026-07-21T14:25:00-05:00' },
  { id: 'doc-009', tipo: 'recibo_caja', sistema_origen: 'SIIGO', numero: 'RC-5509', tercero_id: 'ter-004', banco_id: 'ban-002', fecha: '2026-07-20', valor: 21300000, base: 21300000, iva: 0, retencion: 0, estado: 'diferencia', sincronizado_hgi: false, idempotency_key: 'SIIGO-RC-5509', notas: 'Diferencia en abono aplicado', created_at: '2026-07-20T15:30:00-05:00' },
  { id: 'doc-010', tipo: 'recibo_caja', sistema_origen: 'SIIGO', numero: 'RC-5518', tercero_id: 'ter-001', banco_id: 'ban-001', fecha: '2026-07-18', valor: 32000000, base: 32000000, iva: 0, retencion: 0, estado: 'sincronizado', sincronizado_hgi: true, idempotency_key: 'SIIGO-RC-5518', notas: 'Abono factura FV-0871', created_at: '2026-07-18T12:00:00-05:00' },
  { id: 'doc-011', tipo: 'recibo_caja', sistema_origen: 'SIIGO', numero: 'RC-5519', tercero_id: 'ter-003', banco_id: 'ban-001', fecha: '2026-07-19', valor: 15800000, base: 15800000, iva: 0, retencion: 0, estado: 'sincronizado', sincronizado_hgi: true, idempotency_key: 'SIIGO-RC-5519', notas: 'Recaudo Cali', created_at: '2026-07-19T10:45:00-05:00' },
  { id: 'doc-012', tipo: 'recibo_caja', sistema_origen: 'SIIGO', numero: 'RC-5520', tercero_id: 'ter-006', banco_id: 'ban-002', fecha: '2026-07-21', valor: 12400000, base: 12400000, iva: 0, retencion: 0, estado: 'pendiente', sincronizado_hgi: false, idempotency_key: 'SIIGO-RC-5520', notas: 'Recaudo por aplicar', created_at: '2026-07-21T11:15:00-05:00' },
  // -- Compras (5)
  { id: 'doc-013', tipo: 'compra', sistema_origen: 'SIIGO', numero: 'OC-3310', tercero_id: null, banco_id: null, fecha: '2026-07-21', valor: 7140000, base: 6000000, iva: 1140000, retencion: 0, estado: 'error', sincronizado_hgi: false, idempotency_key: 'SIIGO-OC-3310', notas: 'Error: tercero no mapeado', created_at: '2026-07-21T14:09:00-05:00' },
  { id: 'doc-014', tipo: 'compra', sistema_origen: 'SIIGO', numero: 'OC-3305', tercero_id: 'ter-010', banco_id: null, fecha: '2026-07-15', valor: 142800000, base: 120000000, iva: 22800000, retencion: 0, estado: 'sincronizado', sincronizado_hgi: true, idempotency_key: 'SIIGO-OC-3305', notas: 'Compra muebles Foshan · MSKU-882345-1', created_at: '2026-07-15T08:30:00-05:00' },
  { id: 'doc-015', tipo: 'compra', sistema_origen: 'SIIGO', numero: 'OC-3306', tercero_id: 'ter-011', banco_id: null, fecha: '2026-07-16', valor: 101150000, base: 85000000, iva: 16150000, retencion: 0, estado: 'sincronizado', sincronizado_hgi: true, idempotency_key: 'SIIGO-OC-3306', notas: 'Compra decoración Ningbo', created_at: '2026-07-16T09:40:00-05:00' },
  { id: 'doc-016', tipo: 'compra', sistema_origen: 'SIIGO', numero: 'OC-3308', tercero_id: 'ter-012', banco_id: null, fecha: '2026-07-17', valor: 113050000, base: 95000000, iva: 18050000, retencion: 0, estado: 'sincronizado', sincronizado_hgi: true, idempotency_key: 'SIIGO-OC-3308', notas: 'Compra oficina Guangzhou', created_at: '2026-07-17T14:10:00-05:00' },
  { id: 'doc-017', tipo: 'compra', sistema_origen: 'SIIGO', numero: 'OC-3309', tercero_id: 'ter-007', banco_id: null, fecha: '2026-07-20', valor: 5950000, base: 5000000, iva: 950000, retencion: 0, estado: 'pendiente', sincronizado_hgi: false, idempotency_key: 'SIIGO-OC-3309', notas: 'Servicios portuarios por causar', created_at: '2026-07-20T17:20:00-05:00' },
  // -- Facturas (5)
  { id: 'doc-018', tipo: 'factura', sistema_origen: 'SIIGO', numero: 'FV-0871', tercero_id: 'ter-001', banco_id: null, fecha: '2026-07-15', valor: 38080000, base: 32000000, iva: 6080000, retencion: 800000, estado: 'sincronizado', sincronizado_hgi: true, idempotency_key: 'SIIGO-FV-0871', notas: 'Venta muebles Bogotá', created_at: '2026-07-15T09:00:00-05:00' },
  { id: 'doc-019', tipo: 'factura', sistema_origen: 'SIIGO', numero: 'FV-0872', tercero_id: 'ter-005', banco_id: null, fecha: '2026-07-21', valor: 45220000, base: 38000000, iva: 7220000, retencion: 950000, estado: 'pendiente', sincronizado_hgi: false, idempotency_key: 'SIIGO-FV-0872', notas: 'Venta oficina pendiente cruce', created_at: '2026-07-21T10:05:00-05:00' },
  { id: 'doc-020', tipo: 'factura', sistema_origen: 'SIIGO', numero: 'FV-0873', tercero_id: 'ter-002', banco_id: null, fecha: '2026-07-17', valor: 32725000, base: 27500000, iva: 5225000, retencion: 687500, estado: 'sincronizado', sincronizado_hgi: true, idempotency_key: 'SIIGO-FV-0873', notas: 'Venta Medellín', created_at: '2026-07-17T13:30:00-05:00' },
  { id: 'doc-021', tipo: 'factura', sistema_origen: 'SIIGO', numero: 'FV-0874', tercero_id: 'ter-003', banco_id: null, fecha: '2026-07-18', valor: 18802000, base: 15800000, iva: 3002000, retencion: 395000, estado: 'sincronizado', sincronizado_hgi: true, idempotency_key: 'SIIGO-FV-0874', notas: 'Venta Cali', created_at: '2026-07-18T15:45:00-05:00' },
  { id: 'doc-022', tipo: 'factura', sistema_origen: 'SIIGO', numero: 'FV-0875', tercero_id: 'ter-004', banco_id: null, fecha: '2026-07-20', valor: 25347000, base: 21300000, iva: 4047000, retencion: 532500, estado: 'sincronizado', sincronizado_hgi: true, idempotency_key: 'SIIGO-FV-0875', notas: 'Venta Costa', created_at: '2026-07-20T11:25:00-05:00' },
  // -- Causaciones (3)
  { id: 'doc-023', tipo: 'causacion', sistema_origen: 'SIIGO', numero: 'CA-0903', tercero_id: 'ter-008', banco_id: null, fecha: '2026-07-21', valor: 4500000, base: 4500000, iva: 0, retencion: 0, estado: 'sincronizado', sincronizado_hgi: true, idempotency_key: 'SIIGO-CA-0903', notas: 'Causación flete interno', created_at: '2026-07-21T14:21:00-05:00' },
  { id: 'doc-024', tipo: 'causacion', sistema_origen: 'SIIGO', numero: 'CA-0898', tercero_id: 'ter-007', banco_id: null, fecha: '2026-07-21', valor: 5100000, base: 5100000, iva: 0, retencion: 0, estado: 'diferencia', sincronizado_hgi: false, idempotency_key: 'SIIGO-CA-0898', notas: 'Almacenamiento difiere vs HGI', created_at: '2026-07-21T07:50:00-05:00' },
  { id: 'doc-025', tipo: 'causacion', sistema_origen: 'SIIGO', numero: 'CA-0901', tercero_id: 'ter-009', banco_id: null, fecha: '2026-07-19', valor: 3200000, base: 3200000, iva: 0, retencion: 0, estado: 'pendiente', sincronizado_hgi: false, idempotency_key: 'SIIGO-CA-0901', notas: 'Causación por confirmar', created_at: '2026-07-19T16:10:00-05:00' },
];

/* ============ CONTENEDORES (10): 5 en_transito, 1 arribado, 2 levante, 2 entregado ============ */
export const contenedores: Contenedor[] = [
  // En tránsito (5) — fecha_arribo = ETA
  { id: 'con-001', numero_contenedor: 'TCLU-771204-3', bl: 'TCLUNB7712043', puerto: 'Buenaventura', origen: 'Shanghái', codigo_producto: 'HOG-LINEA', producto: 'Línea hogar · 1.240 unds', cantidad: 1240, estado: 'en_transito', fecha_zarpe: '2026-06-28', fecha_arribo: '2026-07-28', fecha_levante: null, recibido_fisico: false, comision_especial: null, created_at: '2026-06-28T08:00:00-05:00' },
  { id: 'con-002', numero_contenedor: 'MSKU-905511-0', bl: 'MSKUSH9055110', puerto: 'Buenaventura', origen: 'Ningbo', codigo_producto: 'OFI-MESH', producto: 'Sillas oficina mesh · 980 unds', cantidad: 980, estado: 'en_transito', fecha_zarpe: '2026-06-25', fecha_arribo: '2026-07-30', fecha_levante: null, recibido_fisico: false, comision_especial: null, created_at: '2026-06-25T08:00:00-05:00' },
  { id: 'con-003', numero_contenedor: 'BEAU-556789-2', bl: 'BEAUSH5567892', puerto: 'Cartagena', origen: 'Shanghái', codigo_producto: 'SALA-3P', producto: 'Sofás 3 puestos · 420 unds', cantidad: 420, estado: 'en_transito', fecha_zarpe: '2026-06-20', fecha_arribo: '2026-08-02', fecha_levante: null, recibido_fisico: false, comision_especial: 3.0, created_at: '2026-06-20T08:00:00-05:00' },
  { id: 'con-004', numero_contenedor: 'TCNU-334455-6', bl: 'TCNUNB3344556', puerto: 'Buenaventura', origen: 'Guangzhou', codigo_producto: 'ESC-ERG', producto: 'Escritorios ergonómicos · 760 unds', cantidad: 760, estado: 'en_transito', fecha_zarpe: '2026-07-02', fecha_arribo: '2026-08-05', fecha_levante: null, recibido_fisico: false, comision_especial: null, created_at: '2026-07-02T08:00:00-05:00' },
  { id: 'con-005', numero_contenedor: 'MSKU-665544-9', bl: 'MSKUSH6655449', puerto: 'Cartagena', origen: 'Ningbo', codigo_producto: 'DEC-TXT', producto: 'Textiles decorativos · 2.100 unds', cantidad: 2100, estado: 'en_transito', fecha_zarpe: '2026-07-05', fecha_arribo: '2026-08-08', fecha_levante: null, recibido_fisico: false, comision_especial: null, created_at: '2026-07-05T08:00:00-05:00' },
  // Arribado (1)
  { id: 'con-006', numero_contenedor: 'MSKU-882345-1', bl: 'MSKUSH8823451', puerto: 'Buenaventura', origen: 'Shanghái', codigo_producto: 'HOG-COM', producto: 'Muebles comedor · 640 unds', cantidad: 640, estado: 'arribado', fecha_zarpe: '2026-06-10', fecha_arribo: '2026-07-21', fecha_levante: null, recibido_fisico: false, comision_especial: null, created_at: '2026-06-10T08:00:00-05:00' },
  // Levante (2)
  { id: 'con-007', numero_contenedor: 'MSKU-123456-7', bl: 'MSKUSH1234567', puerto: 'Buenaventura', origen: 'Shanghái', codigo_producto: 'SOFA-3P-GRY', producto: 'Sofá 3 puestos gris · 120 unds', cantidad: 120, estado: 'levante', fecha_zarpe: '2026-05-28', fecha_arribo: '2026-07-08', fecha_levante: '2026-07-18', recibido_fisico: true, comision_especial: null, created_at: '2026-05-28T08:00:00-05:00' },
  { id: 'con-008', numero_contenedor: 'TCLU-998877-5', bl: 'TCLUNB9988775', puerto: 'Cartagena', origen: 'Ningbo', codigo_producto: 'EST-LIB-5N', producto: 'Estantería 5 niveles · 60 unds', cantidad: 60, estado: 'levante', fecha_zarpe: '2026-05-30', fecha_arribo: '2026-07-10', fecha_levante: '2026-07-19', recibido_fisico: false, comision_especial: 2.5, created_at: '2026-05-30T08:00:00-05:00' },
  // Entregado (2)
  { id: 'con-009', numero_contenedor: 'MSKU-456789-1', bl: 'MSKUSH4567891', puerto: 'Buenaventura', origen: 'Shanghái', codigo_producto: 'CAMA-QN-TAP', producto: 'Cama queen tapizada · 95 unds', cantidad: 95, estado: 'entregado', fecha_zarpe: '2026-05-10', fecha_arribo: '2026-06-18', fecha_levante: '2026-06-22', recibido_fisico: true, comision_especial: null, created_at: '2026-05-10T08:00:00-05:00' },
  { id: 'con-010', numero_contenedor: 'TCLU-112233-4', bl: 'TCLUNB1122334', puerto: 'Cartagena', origen: 'Guangzhou', codigo_producto: 'MESA-NOC-2C', producto: 'Mesa de noche 2 cajones · 140 unds', cantidad: 140, estado: 'entregado', fecha_zarpe: '2026-05-05', fecha_arribo: '2026-06-12', fecha_levante: '2026-06-16', recibido_fisico: true, comision_especial: null, created_at: '2026-05-05T08:00:00-05:00' },
];

/* ============ DESPACHOS (10) ============ */
export const despachos: Despacho[] = [
  { id: 'des-001', pedido: 'PED-1001', factura: 'FV-0871', tercero_id: 'ter-001', contenedor_id: 'con-007', valor: 38080000, flete: 1200000, pct_flete: 3.15, zona: 'Bogotá', despachado: true, fecha: '2026-07-16', created_at: '2026-07-15T09:00:00-05:00' },
  { id: 'des-002', pedido: 'PED-1002', factura: 'FV-0873', tercero_id: 'ter-002', contenedor_id: 'con-007', valor: 32725000, flete: 1650000, pct_flete: 5.04, zona: 'Medellín', despachado: true, fecha: '2026-07-17', created_at: '2026-07-17T10:00:00-05:00' },
  { id: 'des-003', pedido: 'PED-1003', factura: 'FV-0874', tercero_id: 'ter-003', contenedor_id: 'con-009', valor: 18802000, flete: 1400000, pct_flete: 7.45, zona: 'Cali', despachado: true, fecha: '2026-07-18', created_at: '2026-07-18T11:00:00-05:00' },
  { id: 'des-004', pedido: 'PED-1004', factura: 'FV-0875', tercero_id: 'ter-004', contenedor_id: 'con-010', valor: 25347000, flete: 2100000, pct_flete: 8.28, zona: 'Costa', despachado: true, fecha: '2026-07-20', created_at: '2026-07-20T08:30:00-05:00' },
  { id: 'des-005', pedido: 'PED-1005', factura: null, tercero_id: 'ter-005', contenedor_id: 'con-008', valor: 22000000, flete: 950000, pct_flete: 4.32, zona: 'Bogotá', despachado: false, fecha: '2026-07-21', created_at: '2026-07-21T09:15:00-05:00' },
  { id: 'des-006', pedido: 'PED-1006', factura: 'FV-0871', tercero_id: 'ter-001', contenedor_id: 'con-008', valor: 15000000, flete: 780000, pct_flete: 5.2, zona: 'Bogotá', despachado: true, fecha: '2026-07-19', created_at: '2026-07-19T14:00:00-05:00' },
  { id: 'des-007', pedido: 'PED-1007', factura: null, tercero_id: 'ter-002', contenedor_id: 'con-001', valor: 28000000, flete: 1500000, pct_flete: 5.36, zona: 'Medellín', despachado: false, fecha: null, created_at: '2026-07-20T16:00:00-05:00' },
  { id: 'des-008', pedido: 'PED-1008', factura: 'FV-0874', tercero_id: 'ter-003', contenedor_id: 'con-009', valor: 19500000, flete: 1300000, pct_flete: 6.67, zona: 'Cali', despachado: false, fecha: null, created_at: '2026-07-21T08:45:00-05:00' },
  { id: 'des-009', pedido: 'PED-1009', factura: null, tercero_id: 'ter-006', contenedor_id: 'con-002', valor: 16800000, flete: 890000, pct_flete: 5.3, zona: 'Bucaramanga', despachado: false, fecha: null, created_at: '2026-07-21T10:30:00-05:00' },
  { id: 'des-010', pedido: 'PED-1010', factura: 'FV-0875', tercero_id: 'ter-004', contenedor_id: 'con-010', valor: 9800000, flete: 620000, pct_flete: 6.33, zona: 'Costa', despachado: true, fecha: '2026-07-21', created_at: '2026-07-21T07:20:00-05:00' },
];

/* ============ COMISIONES (12) ============ */
export const comisiones: Comision[] = [
  { id: 'com-001', vendedor: 'Carlos Ramírez', pedido: 'PED-1001', contenedor_id: 'con-007', valor_base: 38080000, pct: 2.0, valor: 761600, regla: 'estandar', estado: 'pagada', created_at: '2026-07-16T09:00:00-05:00' },
  { id: 'com-002', vendedor: 'María Fernanda López', pedido: 'PED-1002', contenedor_id: 'con-007', valor_base: 32725000, pct: 3.0, valor: 981750, regla: 'contenedor_especial', estado: 'calculada', created_at: '2026-07-17T10:00:00-05:00' },
  { id: 'com-003', vendedor: 'Carlos Ramírez', pedido: 'PED-1003', contenedor_id: 'con-009', valor_base: 18802000, pct: 2.0, valor: 376040, regla: 'estandar', estado: 'calculada', created_at: '2026-07-18T11:00:00-05:00' },
  { id: 'com-004', vendedor: 'Andrés Mejía', pedido: 'PED-1004', contenedor_id: 'con-010', valor_base: 25347000, pct: 2.5, valor: 633675, regla: 'facturacion_anticipada', estado: 'pagada', created_at: '2026-07-20T08:30:00-05:00' },
  { id: 'com-005', vendedor: 'María Fernanda López', pedido: 'PED-1005', contenedor_id: 'con-008', valor_base: 22000000, pct: 2.5, valor: 550000, regla: 'contenedor_especial', estado: 'calculada', created_at: '2026-07-21T09:15:00-05:00' },
  { id: 'com-006', vendedor: 'Carlos Ramírez', pedido: 'PED-1006', contenedor_id: 'con-008', valor_base: 15000000, pct: 2.0, valor: 300000, regla: 'estandar', estado: 'pagada', created_at: '2026-07-19T14:00:00-05:00' },
  { id: 'com-007', vendedor: 'Andrés Mejía', pedido: 'PED-1007', contenedor_id: 'con-001', valor_base: 28000000, pct: 1.5, valor: 420000, regla: 'demora_flete', estado: 'calculada', created_at: '2026-07-20T16:00:00-05:00' },
  { id: 'com-008', vendedor: 'María Fernanda López', pedido: 'PED-1008', contenedor_id: 'con-009', valor_base: 19500000, pct: 2.0, valor: 390000, regla: 'estandar', estado: 'calculada', created_at: '2026-07-21T08:45:00-05:00' },
  { id: 'com-009', vendedor: 'Juliana Cárdenas', pedido: 'PED-1009', contenedor_id: 'con-002', valor_base: 16800000, pct: 2.0, valor: 336000, regla: 'estandar', estado: 'calculada', created_at: '2026-07-21T10:30:00-05:00' },
  { id: 'com-010', vendedor: 'Carlos Ramírez', pedido: 'PED-1001', contenedor_id: 'con-007', valor_base: 38080000, pct: 0.5, valor: 190400, regla: 'demora_flete', estado: 'anulada', created_at: '2026-07-16T09:05:00-05:00' },
  { id: 'com-011', vendedor: 'Andrés Mejía', pedido: 'PED-1010', contenedor_id: 'con-010', valor_base: 9800000, pct: 2.5, valor: 245000, regla: 'facturacion_anticipada', estado: 'calculada', created_at: '2026-07-21T07:20:00-05:00' },
  { id: 'com-012', vendedor: 'Juliana Cárdenas', pedido: 'PED-1003', contenedor_id: 'con-009', valor_base: 18802000, pct: 3.0, valor: 564060, regla: 'contenedor_especial', estado: 'calculada', created_at: '2026-07-18T11:30:00-05:00' },
];

/* ============ ANTICIPOS_PROVEEDOR (6) ============ */
export const anticiposProveedor: AnticipoProveedor[] = [
  { id: 'ant-001', proveedor_id: 'ter-010', linea: 'Sofás', valor: 60000000, aplicado: true, factura: 'OC-3305', created_at: '2026-06-25T08:00:00-05:00' },
  { id: 'ant-002', proveedor_id: 'ter-011', linea: 'Decoración', valor: 42500000, aplicado: false, factura: null, created_at: '2026-07-02T08:00:00-05:00' },
  { id: 'ant-003', proveedor_id: 'ter-012', linea: 'Oficina', valor: 47500000, aplicado: true, factura: 'OC-3308', created_at: '2026-06-30T08:00:00-05:00' },
  { id: 'ant-004', proveedor_id: 'ter-010', linea: 'Reposición', valor: 55000000, aplicado: false, factura: null, created_at: '2026-07-14T08:00:00-05:00' },
  { id: 'ant-005', proveedor_id: 'ter-011', linea: 'Sillas', valor: 30000000, aplicado: true, factura: 'OC-3306', created_at: '2026-06-28T08:00:00-05:00' },
  { id: 'ant-006', proveedor_id: 'ter-012', linea: 'Escritorios', valor: 25000000, aplicado: false, factura: null, created_at: '2026-07-18T08:00:00-05:00' },
];

/* ============ RECONCILIACION (33): 30 daily ok rows + 3 open differences ============ */

/** Deterministic daily reconciliation rows 2026-06-22 … 2026-07-21. */
function buildDailyReconciliacion(): Reconciliacion[] {
  const modulos = ['Tesoreria', 'Cartera', 'Contabilidad', 'Logistica', 'Comisiones', 'Comercio Exterior'];
  const conceptos = ['Egresos', 'Recibos', 'Bases', 'IVA', 'Comisiones', 'Contenedores'];
  const rows: Reconciliacion[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date('2026-06-22T07:00:00-05:00');
    d.setDate(d.getDate() + i);
    const fecha = d.toISOString().slice(0, 10);
    // Deterministic pseudo-variation (stable across reloads)
    const valor = 95_000_000 + ((i * 7_300_000) % 45_000_000);
    rows.push({
      id: `rec-${String(i + 1).padStart(3, '0')}`,
      fecha,
      modulo: modulos[i % modulos.length],
      concepto: conceptos[i % conceptos.length],
      valor_siigo: valor,
      valor_hgi: valor,
      diferencia: 0,
      resuelto: true,
      created_at: `${fecha}T07:05:00-05:00`,
    });
  }
  return rows;
}

export const reconciliacion: Reconciliacion[] = [
  ...buildDailyReconciliacion(),
  { id: 'rec-diff-1', fecha: '2026-07-19', modulo: 'Tesoreria', concepto: 'Egreso E-2024-1175', valor_siigo: 84350000, valor_hgi: 84100000, diferencia: 235000, resuelto: false, created_at: '2026-07-19T09:15:00-05:00' },
  { id: 'rec-diff-2', fecha: '2026-07-20', modulo: 'Cartera', concepto: 'Recibo RC-5509', valor_siigo: 21300000, valor_hgi: 21050000, diferencia: 250000, resuelto: false, created_at: '2026-07-20T15:35:00-05:00' },
  { id: 'rec-diff-3', fecha: '2026-07-21', modulo: 'Contabilidad', concepto: 'Causación CA-0898', valor_siigo: 5100000, valor_hgi: 4950000, diferencia: 150000, resuelto: false, created_at: '2026-07-21T07:55:00-05:00' },
];

/* ============ SYNC_JOBS (15) ============ */
export const syncJobs: SyncJob[] = [
  // -- Today's granular feed events (docs_procesados = 0 → event rows, not counted in KPIs)
  { id: 'job-ev1', modulo: 'Tesoreria', direccion: 'SIIGO->HGI', started_at: '2026-07-21T14:28:10.200-05:00', finished_at: '2026-07-21T14:28:12.000-05:00', docs_procesados: 0, docs_error: 0, estado: 'completado', mensaje: 'Egreso E-2024-1187 · Banco Diseño', created_at: '2026-07-21T14:28:12-05:00' },
  { id: 'job-ev2', modulo: 'Cartera', direccion: 'SIIGO->HGI', started_at: '2026-07-21T14:25:00-05:00', finished_at: null, docs_procesados: 0, docs_error: 0, estado: 'pendiente', mensaje: 'Recibo de caja RC-5521 · Hogar Moderno Colombia', created_at: '2026-07-21T14:25:00-05:00' },
  { id: 'job-ev3', modulo: 'Contabilidad', direccion: 'SIIGO->HGI', started_at: '2026-07-21T14:21:05.000-05:00', finished_at: '2026-07-21T14:21:06.300-05:00', docs_procesados: 0, docs_error: 0, estado: 'completado', mensaje: 'Causación CA-0903', created_at: '2026-07-21T14:21:06-05:00' },
  { id: 'job-ev4', modulo: 'Comercio Exterior', direccion: 'SIIGO->HGI', started_at: '2026-07-21T14:16:40.000-05:00', finished_at: '2026-07-21T14:16:42.500-05:00', docs_procesados: 0, docs_error: 0, estado: 'completado', mensaje: 'Contenedor MSKU-882345-1 actualizado a arribado', created_at: '2026-07-21T14:16:42-05:00' },
  { id: 'job-ev5', modulo: 'Logistica', direccion: 'SIIGO->HGI', started_at: '2026-07-21T14:09:30.000-05:00', finished_at: '2026-07-21T14:09:31.100-05:00', docs_procesados: 0, docs_error: 0, estado: 'error', mensaje: 'Compra OC-3310 · Error: tercero no mapeado', created_at: '2026-07-21T14:09:31-05:00' },
  { id: 'job-ev6', modulo: 'Contabilidad', direccion: 'SIIGO->HGI', started_at: '2026-07-21T14:04:00.000-05:00', finished_at: '2026-07-21T14:04:03.400-05:00', docs_procesados: 0, docs_error: 0, estado: 'completado', mensaje: 'Conciliación diaria completada · 2 diferencias', created_at: '2026-07-21T14:04:03-05:00' },
  // -- Today's batch runs (KPI + module-health source: docs sum 143 − 1 error = 142 synced)
  { id: 'job-b01', modulo: 'Tesoreria', direccion: 'SIIGO->HGI', started_at: '2026-07-21T06:30:00-05:00', finished_at: '2026-07-21T06:32:15-05:00', docs_procesados: 38, docs_error: 0, estado: 'completado', mensaje: 'Egresos y recibos sincronizados', created_at: '2026-07-21T06:32:15-05:00' },
  { id: 'job-b02', modulo: 'Cartera', direccion: 'SIIGO->HGI', started_at: '2026-07-21T06:32:30-05:00', finished_at: '2026-07-21T06:33:40-05:00', docs_procesados: 29, docs_error: 0, estado: 'completado', mensaje: null, created_at: '2026-07-21T06:33:40-05:00' },
  { id: 'job-b03', modulo: 'Comercio Exterior', direccion: 'SIIGO->HGI', started_at: '2026-07-21T06:35:00-05:00', finished_at: '2026-07-21T06:40:22-05:00', docs_procesados: 6, docs_error: 0, estado: 'completado', mensaje: 'Contenedores actualizados', created_at: '2026-07-21T06:40:22-05:00' },
  { id: 'job-b04', modulo: 'Comisiones', direccion: 'SIIGO->HGI', started_at: '2026-07-21T06:40:30-05:00', finished_at: '2026-07-21T06:41:30-05:00', docs_procesados: 12, docs_error: 0, estado: 'completado', mensaje: null, created_at: '2026-07-21T06:41:30-05:00' },
  { id: 'job-b05', modulo: 'Contabilidad', direccion: 'SIIGO->HGI', started_at: '2026-07-21T06:42:00-05:00', finished_at: '2026-07-21T06:46:10-05:00', docs_procesados: 31, docs_error: 0, estado: 'completado', mensaje: null, created_at: '2026-07-21T06:46:10-05:00' },
  { id: 'job-b06', modulo: 'Logistica', direccion: 'SIIGO->HGI', started_at: '2026-07-21T06:47:00-05:00', finished_at: '2026-07-21T06:50:05-05:00', docs_procesados: 27, docs_error: 1, estado: 'completado', mensaje: '1 documento con advertencia', created_at: '2026-07-21T06:50:05-05:00' },
  // -- Live / historical
  { id: 'job-b07', modulo: 'Comercio Exterior', direccion: 'SIIGO->HGI', started_at: '2026-07-21T13:40:00-05:00', finished_at: null, docs_procesados: 0, docs_error: 0, estado: 'en_proceso', mensaje: 'Sincronización en curso', created_at: '2026-07-21T13:40:00-05:00' },
  { id: 'job-h01', modulo: 'Contabilidad', direccion: 'SIIGO->HGI', started_at: '2026-07-20T07:30:00-05:00', finished_at: '2026-07-20T07:35:45-05:00', docs_procesados: 15, docs_error: 2, estado: 'error', mensaje: '2 documentos con diferencia TRM', created_at: '2026-07-20T07:35:45-05:00' },
  { id: 'job-h02', modulo: 'Tesoreria', direccion: 'HGI->SIIGO', started_at: '2026-07-20T08:00:00-05:00', finished_at: '2026-07-20T08:02:00-05:00', docs_procesados: 6, docs_error: 0, estado: 'completado', mensaje: null, created_at: '2026-07-20T08:02:00-05:00' },
];

/* ============ AUDIT_LOG (10) ============ */
export const auditLog: AuditLog[] = [
  { id: 'log-001', actor: 'system', accion: 'sync', entidad: 'documentos', entidad_id: 'E-2024-1187', detalle: { modulo: 'Tesoreria', resultado: 'ok' }, created_at: '2026-07-21T14:28:12-05:00' },
  { id: 'log-002', actor: 'system', accion: 'sync', entidad: 'documentos', entidad_id: 'OC-3310', detalle: { resultado: 'error', motivo: 'tercero_no_mapeado' }, created_at: '2026-07-21T14:09:31-05:00' },
  { id: 'log-003', actor: 'system', accion: 'sync', entidad: 'contenedores', entidad_id: 'MSKU-882345-1', detalle: { estado: 'arribado' }, created_at: '2026-07-21T14:16:42-05:00' },
  { id: 'log-004', actor: 'contador@espacios.co', accion: 'update', entidad: 'reconciliacion', entidad_id: 'E-2024-1175', detalle: { accion: 'marcar_diferencia', motivo: 'TRM' }, created_at: '2026-07-19T09:20:00-05:00' },
  { id: 'log-005', actor: 'admin@espacios.co', accion: 'create', entidad: 'terceros', entidad_id: 'Inversiones La Cascada SAS', detalle: { tipo: 'cliente' }, created_at: '2026-07-18T10:00:00-05:00' },
  { id: 'log-006', actor: 'system', accion: 'sync', entidad: 'documentos', entidad_id: 'E-2024-1175', detalle: { modulo: 'Tesoreria', resultado: 'diferencia', motivo: 'TRM' }, created_at: '2026-07-19T09:10:00-05:00' },
  { id: 'log-007', actor: 'admin@espacios.co', accion: 'create', entidad: 'comisiones', entidad_id: 'PED-1001', detalle: { vendedor: 'Carlos Ramírez' }, created_at: '2026-07-16T09:05:00-05:00' },
  { id: 'log-008', actor: 'system', accion: 'sync', entidad: 'sync_jobs', entidad_id: 'Contabilidad 2026-07-20', detalle: { docs_error: 2 }, created_at: '2026-07-20T07:35:45-05:00' },
  { id: 'log-009', actor: 'adriana.restrepo@espacios.co', accion: 'export', entidad: 'reportes', entidad_id: 'panel-semanal', detalle: { formato: 'xlsx' }, created_at: '2026-07-20T17:00:00-05:00' },
  { id: 'log-010', actor: 'system', accion: 'sync', entidad: 'documentos', entidad_id: 'RC-5509', detalle: { modulo: 'Cartera', resultado: 'diferencia', motivo: 'abono_aplicado' }, created_at: '2026-07-20T15:35:00-05:00' },
];

export const SEED_REFERENCE_NOW = T0;
