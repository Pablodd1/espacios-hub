-- seed_data: realistic Colombian demo data for Espacios Hub

-- ============ TERCEROS (10) ============
insert into public.terceros (nit, nombre, tipo, email, whatsapp, zona) values
  ('900123456-1','Muebles y Disenos Andinos SAS','cliente','compras@mueblesandinos.co','+573105551234','Bogota'),
  ('901234567-2','Hogar Moderno Colombia SAS','cliente','gerencia@hogarmoderno.co','+573115552345','Medellin'),
  ('890345678-3','Distribuidora El Confort Ltda','cliente','ventas@elconfort.co','+573125553456','Cali'),
  ('900456789-4','Espacios Costeros SAS','cliente','contacto@espacioscosteros.co','+573135554567','Costa'),
  ('901567890-5','Oficinas Corporativas del Norte SAS','cliente','admin@oficinorte.co','+573145555678','Bogota'),
  ('890987654-6','Logistica Portuaria del Pacifico SAS','proveedor','operaciones@logpacifico.co','+573155556789','Buenaventura'),
  ('900876543-7','Transportes Andinos de Carga SAS','proveedor','servicio@transandinos.co','+573165557890','Bogota'),
  ('CN913100MA1X1','Foshan Furniture Manufacturing Co Ltd','proveedor_exterior','sales@foshanfurniture.cn','+8675788881234','Foshan'),
  ('CN913302MA2Y2','Ningbo Home Decor Export Co Ltd','proveedor_exterior','export@ningbohomedecor.cn','+8657487772233','Ningbo'),
  ('CN914401MA3Z3','Guangzhou Office Solutions Trading','proveedor_exterior','trade@gzofficesol.cn','+862036664455','Guangzhou');

-- ============ BANCOS (3) ============
insert into public.bancos (nombre, sistema_origen) values
  ('Diseno','SIIGO'),
  ('Agil Nomina','SIIGO'),
  ('Espacios','SIIGO');

-- ============ DOCUMENTOS (25) ============
insert into public.documentos (tipo, sistema_origen, numero, tercero_id, banco_id, fecha, valor, base, iva, retencion, estado, sincronizado_hgi, idempotency_key, notas) values
  -- EGRESOS (6)
  ('egreso','SIIGO','EG-2025-0001',(select id from public.terceros where nit='890987654-6'),(select id from public.bancos where nombre='Espacios'),'2025-06-03',18500000,18500000,0,0,'sincronizado',true,'SIIGO-EG-2025-0001','Pago flete y manejo portuario'),
  ('egreso','SIIGO','EG-2025-0002',(select id from public.terceros where nit='900876543-7'),(select id from public.bancos where nombre='Diseno'),'2025-06-05',9200000,9200000,0,0,'sincronizado',true,'SIIGO-EG-2025-0002','Transporte nacional contenedor'),
  ('egreso','SIIGO','EG-2025-0003',(select id from public.terceros where nit='CN913100MA1X1'),(select id from public.bancos where nombre='Espacios'),'2025-06-09',120000000,120000000,0,0,'sincronizado',true,'SIIGO-EG-2025-0003','Giro proveedor exterior Foshan'),
  ('egreso','SIIGO','EG-2025-0004',(select id from public.terceros where nit='CN913302MA2Y2'),(select id from public.bancos where nombre='Diseno'),'2025-06-12',85000000,85000000,0,0,'diferencia',false,'SIIGO-EG-2025-0004','Diferencia TRM vs HGI'),
  ('egreso','SIIGO','EG-2025-0005',(select id from public.terceros where nit='890987654-6'),(select id from public.bancos where nombre='Agil Nomina'),'2025-06-16',6750000,6750000,0,0,'pendiente',false,'SIIGO-EG-2025-0005','Pendiente causal HGI'),
  ('egreso','SIIGO','EG-2025-0006',(select id from public.terceros where nit='CN914401MA3Z3'),(select id from public.bancos where nombre='Espacios'),'2025-06-20',95000000,95000000,0,0,'sincronizado',true,'SIIGO-EG-2025-0006','Giro proveedor exterior Guangzhou'),
  -- RECIBOS DE CAJA (4)
  ('recibo_caja','SIIGO','RC-2025-0001',(select id from public.terceros where nit='900123456-1'),(select id from public.bancos where nombre='Diseno'),'2025-06-04',32000000,32000000,0,0,'sincronizado',true,'SIIGO-RC-2025-0001','Abono factura FV-2025-0001'),
  ('recibo_caja','SIIGO','RC-2025-0002',(select id from public.terceros where nit='901234567-2'),(select id from public.bancos where nombre='Espacios'),'2025-06-07',27500000,27500000,0,0,'sincronizado',true,'SIIGO-RC-2025-0002','Recaudo cliente Medellin'),
  ('recibo_caja','SIIGO','RC-2025-0003',(select id from public.terceros where nit='890345678-3'),(select id from public.bancos where nombre='Diseno'),'2025-06-14',15800000,15800000,0,0,'pendiente',false,'SIIGO-RC-2025-0003','Recaudo por aplicar'),
  ('recibo_caja','SIIGO','RC-2025-0004',(select id from public.terceros where nit='900456789-4'),(select id from public.bancos where nombre='Agil Nomina'),'2025-06-18',21300000,21300000,0,0,'sincronizado',true,'SIIGO-RC-2025-0004','Recaudo Costa'),
  -- COMPRAS (5)
  ('compra','SIIGO','CP-2025-0001',(select id from public.terceros where nit='CN913100MA1X1'),null,'2025-05-28',142800000,120000000,22800000,0,'sincronizado',true,'SIIGO-CP-2025-0001','Compra muebles Foshan contenedor MSKU1234567'),
  ('compra','SIIGO','CP-2025-0002',(select id from public.terceros where nit='CN913302MA2Y2'),null,'2025-05-30',101150000,85000000,16150000,0,'sincronizado',true,'SIIGO-CP-2025-0002','Compra decoracion Ningbo'),
  ('compra','SIIGO','CP-2025-0003',(select id from public.terceros where nit='CN914401MA3Z3'),null,'2025-06-02',113050000,95000000,18050000,0,'diferencia',false,'SIIGO-CP-2025-0003','IVA difiere vs HGI'),
  ('compra','SIIGO','CP-2025-0004',(select id from public.terceros where nit='890987654-6'),null,'2025-06-10',7140000,6000000,1140000,0,'sincronizado',true,'SIIGO-CP-2025-0004','Servicios portuarios'),
  ('compra','SIIGO','CP-2025-0005',(select id from public.terceros where nit='CN913100MA1X1'),null,'2025-06-21',130900000,110000000,20900000,0,'sincronizado',true,'SIIGO-CP-2025-0005','Compra reposicion Foshan'),
  -- FACTURAS (5)
  ('factura','SIIGO','FV-2025-0001',(select id from public.terceros where nit='900123456-1'),null,'2025-06-01',38080000,32000000,6080000,800000,'sincronizado',true,'SIIGO-FV-2025-0001','Venta muebles Bogota'),
  ('factura','SIIGO','FV-2025-0002',(select id from public.terceros where nit='901234567-2'),null,'2025-06-06',32725000,27500000,5225000,687500,'sincronizado',true,'SIIGO-FV-2025-0002','Venta Medellin'),
  ('factura','SIIGO','FV-2025-0003',(select id from public.terceros where nit='890345678-3'),null,'2025-06-13',18802000,15800000,3002000,395000,'pendiente',false,'SIIGO-FV-2025-0003','Venta Cali pendiente cruce'),
  ('factura','SIIGO','FV-2025-0004',(select id from public.terceros where nit='900456789-4'),null,'2025-06-17',25347000,21300000,4047000,532500,'sincronizado',true,'SIIGO-FV-2025-0004','Venta Costa'),
  ('factura','SIIGO','FV-2025-0005',(select id from public.terceros where nit='901567890-5'),null,'2025-06-22',45220000,38000000,7220000,950000,'error',false,'SIIGO-FV-2025-0005','Error numeracion HGI'),
  -- CAUSACIONES (3)
  ('causacion','SIIGO','CAU-2025-0001',(select id from public.terceros where nit='900876543-7'),null,'2025-06-08',4500000,4500000,0,0,'sincronizado',true,'SIIGO-CAU-2025-0001','Causacion flete interno'),
  ('causacion','SIIGO','CAU-2025-0002',(select id from public.terceros where nit='890987654-6'),null,'2025-06-11',3200000,3200000,0,0,'sincronizado',true,'SIIGO-CAU-2025-0002','Causacion almacenamiento'),
  ('causacion','SIIGO','CAU-2025-0003',(select id from public.terceros where nit='900876543-7'),null,'2025-06-19',5100000,5100000,0,0,'pendiente',false,'SIIGO-CAU-2025-0003','Causacion por confirmar'),
  -- ANTICIPOS (2)
  ('anticipo','SIIGO','ANT-2025-0001',(select id from public.terceros where nit='CN913100MA1X1'),(select id from public.bancos where nombre='Espacios'),'2025-05-25',60000000,60000000,0,0,'sincronizado',true,'SIIGO-ANT-2025-0001','Anticipo 50% orden Foshan'),
  ('anticipo','SIIGO','ANT-2025-0002',(select id from public.terceros where nit='CN913302MA2Y2'),(select id from public.bancos where nombre='Diseno'),'2025-05-27',42500000,42500000,0,0,'pendiente',false,'SIIGO-ANT-2025-0002','Anticipo orden Ningbo');

-- ============ CONTENEDORES (8) ============
insert into public.contenedores (numero_contenedor, bl, puerto, codigo_producto, producto, cantidad, estado, fecha_zarpe, fecha_arribo, fecha_levante, recibido_fisico, comision_especial) values
  ('MSKU1234567','MSKUSH1234567','Buenaventura','SOFA-3P-GRY','Sofa 3 puestos gris',120,'entregado','2025-04-10','2025-05-15','2025-05-18',true,null),
  ('MSKU2345678','MSKUSH2345678','Cartagena','MESA-COM-6S','Mesa comedor 6 sillas',80,'levante','2025-04-20','2025-05-25','2025-05-28',true,3.00),
  ('TCLU3456789','TCLUNB3456789','Buenaventura','CAMA-QN-TAP','Cama queen tapizada',95,'arribado','2025-05-02','2025-06-05',null,false,null),
  ('MSKU4567890','MSKUSH4567890','Shanghai','ESC-OF-ERG','Escritorio oficina ergonomico',150,'en_transito','2025-06-01',null,null,false,null),
  ('TCLU5678901','TCLUNB5678901','Ningbo','SILLA-OF-MESH','Silla oficina mesh',200,'en_transito','2025-06-08',null,null,false,null),
  ('MSKU6789012','MSKUSH6789012','Buenaventura','EST-LIB-5N','Estanteria libros 5 niveles',60,'arribado','2025-05-10','2025-06-12',null,false,2.50),
  ('TCLU7890123','TCLUNB7890123','Cartagena','SOFA-2P-BEJ','Sofa 2 puestos beige',110,'levante','2025-04-15','2025-05-20','2025-05-23',true,null),
  ('MSKU8901234','MSKUSH8901234','Shanghai','MESA-NOC-2C','Mesa de noche 2 cajones',140,'en_transito','2025-06-15',null,null,false,null);

-- ============ DESPACHOS (8) ============
insert into public.despachos (pedido, factura, tercero_id, contenedor_id, valor, flete, pct_flete, zona, despachado, fecha) values
  ('PED-1001','FV-2025-0001',(select id from public.terceros where nit='900123456-1'),(select id from public.contenedores where numero_contenedor='MSKU1234567'),38080000,1200000,3.15,'Bogota',true,'2025-06-02'),
  ('PED-1002','FV-2025-0002',(select id from public.terceros where nit='901234567-2'),(select id from public.contenedores where numero_contenedor='MSKU2345678'),32725000,1650000,5.04,'Medellin',true,'2025-06-07'),
  ('PED-1003','FV-2025-0003',(select id from public.terceros where nit='890345678-3'),(select id from public.contenedores where numero_contenedor='TCLU3456789'),18802000,1400000,7.45,'Cali',false,'2025-06-14'),
  ('PED-1004','FV-2025-0004',(select id from public.terceros where nit='900456789-4'),(select id from public.contenedores where numero_contenedor='TCLU7890123'),25347000,2100000,8.28,'Costa',true,'2025-06-18'),
  ('PED-1005',null,(select id from public.terceros where nit='901567890-5'),(select id from public.contenedores where numero_contenedor='MSKU6789012'),22000000,950000,4.32,'Bogota',false,'2025-06-23'),
  ('PED-1006','FV-2025-0001',(select id from public.terceros where nit='900123456-1'),(select id from public.contenedores where numero_contenedor='MSKU2345678'),15000000,780000,5.20,'Bogota',true,'2025-06-09'),
  ('PED-1007',null,(select id from public.terceros where nit='901234567-2'),(select id from public.contenedores where numero_contenedor='MSKU4567890'),28000000,1500000,5.36,'Medellin',false,'2025-06-25'),
  ('PED-1008','FV-2025-0002',(select id from public.terceros where nit='890345678-3'),(select id from public.contenedores where numero_contenedor='TCLU5678901'),19500000,1300000,6.67,'Cali',false,'2025-06-26');

-- ============ COMISIONES (10) ============
insert into public.comisiones (vendedor, pedido, contenedor_id, valor_base, pct, valor, regla, estado) values
  ('Carlos Ramirez','PED-1001',(select id from public.contenedores where numero_contenedor='MSKU1234567'),38080000,2.00,761600,'estandar','calculada'),
  ('Maria Fernanda Lopez','PED-1002',(select id from public.contenedores where numero_contenedor='MSKU2345678'),32725000,3.00,981750,'contenedor_especial','calculada'),
  ('Carlos Ramirez','PED-1003',(select id from public.contenedores where numero_contenedor='TCLU3456789'),18802000,2.00,376040,'estandar','calculada'),
  ('Andres Mejia','PED-1004',(select id from public.contenedores where numero_contenedor='TCLU7890123'),25347000,2.50,633675,'facturacion_anticipada','pagada'),
  ('Maria Fernanda Lopez','PED-1005',(select id from public.contenedores where numero_contenedor='MSKU6789012'),22000000,2.50,550000,'contenedor_especial','calculada'),
  ('Carlos Ramirez','PED-1006',(select id from public.contenedores where numero_contenedor='MSKU2345678'),15000000,2.00,300000,'estandar','pagada'),
  ('Andres Mejia','PED-1007',(select id from public.contenedores where numero_contenedor='MSKU4567890'),28000000,1.50,420000,'demora_flete','calculada'),
  ('Maria Fernanda Lopez','PED-1008',(select id from public.contenedores where numero_contenedor='TCLU5678901'),19500000,2.00,390000,'estandar','calculada'),
  ('Carlos Ramirez','PED-1001',(select id from public.contenedores where numero_contenedor='MSKU1234567'),38080000,0.50,190400,'demora_flete','anulada'),
  ('Andres Mejia','PED-1004',(select id from public.contenedores where numero_contenedor='TCLU7890123'),25347000,2.00,506940,'estandar','calculada');

-- ============ ANTICIPOS_PROVEEDOR (6) ============
insert into public.anticipos_proveedor (proveedor_id, linea, valor, aplicado, factura) values
  ((select id from public.terceros where nit='CN913100MA1X1'),'Sofas',60000000,true,'CP-2025-0001'),
  ((select id from public.terceros where nit='CN913302MA2Y2'),'Decoracion',42500000,false,null),
  ((select id from public.terceros where nit='CN914401MA3Z3'),'Oficina',47500000,true,'CP-2025-0003'),
  ((select id from public.terceros where nit='CN913100MA1X1'),'Reposicion',55000000,false,null),
  ((select id from public.terceros where nit='CN913302MA2Y2'),'Sillas',30000000,true,'CP-2025-0002'),
  ((select id from public.terceros where nit='CN914401MA3Z3'),'Escritorios',25000000,false,null);

-- ============ RECONCILIACION (12) ============
insert into public.reconciliacion (fecha, modulo, concepto, valor_siigo, valor_hgi, resuelto) values
  ('2025-06-05','Tesoreria','Egresos',27700000,27700000,true),
  ('2025-06-05','Cartera','Recibos',32000000,32000000,true),
  ('2025-06-10','Contabilidad','Bases',120000000,120000000,true),
  ('2025-06-10','Contabilidad','IVA',22800000,22800000,true),
  ('2025-06-12','Tesoreria','Egresos',85000000,84350000,false),
  ('2025-06-15','Contabilidad','Retenciones',800000,800000,true),
  ('2025-06-15','Cartera','Recibos',27500000,27500000,true),
  ('2025-06-18','Contabilidad','IVA',18050000,17900000,false),
  ('2025-06-20','Tesoreria','Anticipos',60000000,60000000,true),
  ('2025-06-20','Contabilidad','Bases',95000000,95000000,true),
  ('2025-06-22','Cartera','Recibos',21300000,21300000,true),
  ('2025-06-25','Contabilidad','Retenciones',532500,530000,false);

-- ============ SYNC_JOBS (8) ============
insert into public.sync_jobs (modulo, direccion, started_at, finished_at, docs_procesados, docs_error, estado, mensaje) values
  ('Tesoreria','SIIGO->HGI','2025-06-05 08:00:00+00','2025-06-05 08:02:15+00',12,0,'completado','Egresos y recibos sincronizados'),
  ('Cartera','SIIGO->HGI','2025-06-06 08:00:00+00','2025-06-06 08:01:40+00',8,0,'completado',null),
  ('Comercio Exterior','SIIGO->HGI','2025-06-08 09:00:00+00','2025-06-08 09:05:22+00',5,0,'completado','Contenedores actualizados'),
  ('Contabilidad','SIIGO->HGI','2025-06-10 07:30:00+00','2025-06-10 07:34:10+00',20,1,'completado','1 documento con advertencia'),
  ('Logistica','SIIGO->HGI','2025-06-12 10:00:00+00','2025-06-12 10:03:05+00',8,0,'completado',null),
  ('Tesoreria','HGI->SIIGO','2025-06-15 08:00:00+00','2025-06-15 08:02:00+00',6,0,'completado',null),
  ('Contabilidad','SIIGO->HGI','2025-06-18 07:30:00+00','2025-06-18 07:35:45+00',15,2,'error','2 documentos con diferencia TRM'),
  ('Comercio Exterior','SIIGO->HGI','2025-06-20 09:00:00+00',null,0,0,'en_proceso','Sincronizacion en curso');

-- ============ AUDIT_LOG (8) ============
insert into public.audit_log (actor, accion, entidad, entidad_id, detalle) values
  ('system','sync','documentos','EG-2025-0001','{"modulo":"Tesoreria","resultado":"ok"}'::jsonb),
  ('system','sync','documentos','EG-2025-0004','{"modulo":"Tesoreria","resultado":"diferencia","motivo":"TRM"}'::jsonb),
  ('admin@espacios.co','create','terceros','Muebles y Disenos Andinos SAS','{"tipo":"cliente"}'::jsonb),
  ('system','sync','contenedores','MSKU1234567','{"estado":"entregado"}'::jsonb),
  ('contador@espacios.co','update','reconciliacion','Egresos 2025-06-12','{"accion":"marcar diferencia"}'::jsonb),
  ('system','sync','documentos','FV-2025-0005','{"resultado":"error","motivo":"numeracion"}'::jsonb),
  ('admin@espacios.co','create','comisiones','PED-1001','{"vendedor":"Carlos Ramirez"}'::jsonb),
  ('system','sync','sync_jobs','Contabilidad 2025-06-18','{"docs_error":2}'::jsonb);
