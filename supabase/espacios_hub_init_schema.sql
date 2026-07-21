-- init_schema: Espacios Hub ERP integration schema (SIIGO <-> HGI)
create extension if not exists "pgcrypto";

create table if not exists public.terceros (
  id uuid primary key default gen_random_uuid(),
  nit text,
  nombre text not null,
  tipo text check (tipo in ('cliente','proveedor','proveedor_exterior')),
  email text,
  whatsapp text,
  zona text,
  created_at timestamptz not null default now()
);

create table if not exists public.bancos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  sistema_origen text not null default 'SIIGO',
  created_at timestamptz not null default now()
);

create table if not exists public.documentos (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('egreso','recibo_caja','compra','factura','causacion','anticipo')),
  sistema_origen text not null default 'SIIGO',
  numero text not null,
  tercero_id uuid references public.terceros(id),
  banco_id uuid references public.bancos(id),
  fecha date not null,
  valor numeric(15,2) not null,
  base numeric(15,2) default 0,
  iva numeric(15,2) default 0,
  retencion numeric(15,2) default 0,
  estado text not null default 'pendiente' check (estado in ('pendiente','sincronizado','diferencia','error')),
  sincronizado_hgi boolean not null default false,
  idempotency_key text unique,
  notas text,
  created_at timestamptz not null default now()
);

create table if not exists public.contenedores (
  id uuid primary key default gen_random_uuid(),
  numero_contenedor text unique not null,
  bl text,
  puerto text,
  codigo_producto text,
  producto text,
  cantidad numeric,
  estado text not null default 'en_transito' check (estado in ('en_transito','arribado','levante','entregado')),
  fecha_zarpe date,
  fecha_arribo date,
  fecha_levante date,
  recibido_fisico boolean not null default false,
  comision_especial numeric(5,2),
  created_at timestamptz not null default now()
);

create table if not exists public.despachos (
  id uuid primary key default gen_random_uuid(),
  pedido text not null,
  factura text,
  tercero_id uuid references public.terceros(id),
  contenedor_id uuid references public.contenedores(id),
  valor numeric(15,2),
  flete numeric(15,2),
  pct_flete numeric(5,2),
  zona text,
  despachado boolean not null default false,
  fecha date,
  created_at timestamptz not null default now()
);

create table if not exists public.comisiones (
  id uuid primary key default gen_random_uuid(),
  vendedor text not null,
  pedido text,
  contenedor_id uuid references public.contenedores(id),
  valor_base numeric(15,2),
  pct numeric(5,2),
  valor numeric(15,2),
  regla text not null default 'estandar' check (regla in ('estandar','contenedor_especial','facturacion_anticipada','demora_flete')),
  estado text not null default 'calculada',
  created_at timestamptz not null default now()
);

create table if not exists public.anticipos_proveedor (
  id uuid primary key default gen_random_uuid(),
  proveedor_id uuid references public.terceros(id),
  linea text,
  valor numeric(15,2),
  aplicado boolean not null default false,
  factura text,
  created_at timestamptz not null default now()
);

create table if not exists public.reconciliacion (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  modulo text not null,
  concepto text not null,
  valor_siigo numeric(15,2),
  valor_hgi numeric(15,2),
  diferencia numeric(15,2) generated always as (coalesce(valor_siigo,0) - coalesce(valor_hgi,0)) stored,
  resuelto boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.sync_jobs (
  id uuid primary key default gen_random_uuid(),
  modulo text not null,
  direccion text not null default 'SIIGO->HGI',
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  docs_procesados int not null default 0,
  docs_error int not null default 0,
  estado text not null default 'completado',
  mensaje text,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor text not null default 'system',
  accion text,
  entidad text,
  entidad_id text,
  detalle jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_documentos_tercero on public.documentos(tercero_id);
create index if not exists idx_documentos_banco on public.documentos(banco_id);
create index if not exists idx_documentos_tipo on public.documentos(tipo);
create index if not exists idx_documentos_estado on public.documentos(estado);
create index if not exists idx_despachos_tercero on public.despachos(tercero_id);
create index if not exists idx_despachos_contenedor on public.despachos(contenedor_id);
create index if not exists idx_comisiones_contenedor on public.comisiones(contenedor_id);
create index if not exists idx_anticipos_proveedor on public.anticipos_proveedor(proveedor_id);
