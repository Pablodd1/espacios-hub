# Espacios Hub — Integration Runbook (Demo → Producción)

Guía operativa para llevar la plataforma de demo a producción real. Orden recomendado.

## Fase 0 — Ya hecho (código)
- [x] Servicio de sincronización `server/` (auth SIIGO, pull 4 módulos, webhooks, idempotencia, throttle 100 req/min, upsert Supabase, sync_jobs + audit_log) — typecheck + smoke test OK.
- [x] Frontend dual-mode: pill **DEMO** (ámbar) / **EN VIVO** (verde) en el topbar; cliente Supabase real detrás de `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`; fallback a datos demo sin cambios.
- [x] Pack SQL en `supabase/` (schema + seed + RLS).
- [x] Email de solicitud HGI: `docs/HGI_REQUEST_EMAIL.md`.

## Fase 1 — Credenciales y base de datos (1 día, lado cliente)
1. **Supabase**: crear proyecto (us-east-1) → SQL editor → correr en orden:
   `espacios_hub_init_schema.sql` → `espacios_hub_seed_data.sql` → `espacios_hub_rls_policies.sql`.
   ⚠️ Antes de producción: endurecer RLS (políticas por rol autenticado — las actuales son permisivas para demo).
2. **SIIGO developer**: crear app en https://developer.siigo.com (sandbox gratis) → obtener username + access key → Partner-Id: `EspaciosHub`.
3. **Frontend live**: copiar `.env.example` → `.env` con URL + anon key → rebuild (`npm run build`) → el pill cambia a EN VIVO.
4. **Server**: copiar `server/.env.example` → `server/.env` con las 4 credenciales → `npm install && npm run dev` → verificar `GET /health` → `POST /sync/run/all` → revisar `sync_jobs` en Supabase.

## Fase 2 — SIIGO en vivo (1–2 semanas)
- Validar sandbox: sync de los 4 módulos contra datos demo SIIGO.
- Conciliación fiscal diaria: enriquecer con `/trial-balance-by-third` (bases/IVA/retenciones).
- Registrar webhook `{URL}/webhooks/siigo` en el portal → tiempo real.
- Pasar a producción: `SIIGO_SANDBOX=false` + credenciales productivas.
- Activar escritura (push de egresos/recibos creados en Hub → SIIGO con Idempotency-Key).

## Fase 3 — HGI (2–4 semanas, depende de tercero)
- Enviar `docs/HGI_REQUEST_EMAIL.md` a info@hgi.com.co + distribuidor.
- Con licencia + docs: implementar `server/src/hgi/adapter.ts` (contrato ya definido).
- Mientras tanto: lectura SQL Server (solo lectura) para conciliación SIIGO↔HGI diaria.

## Fase 4 — Canales (2 semanas)
- WhatsApp Business Cloud API (verificación Meta Business de Espacios Importados; plantillas con opt-in) → activa el estudio WhatsApp de Cartera.
- Power BI push dataset → alimenta contenedores sin tercer ingreso manual.
- Auth (Supabase Auth) + RLS por rol → requisito para cualquier exposición fuera de la red interna.

## Riesgos conocidos (del audit 2026-07-21)
- RLS demo permisivo — NO exponer públicamente antes de Fase 4.
- Seed de `supabase/` y seed del frontend difieren — regenerar seed SQL desde el frontend antes de poblar producción.
- 1 vulnerabilidad npm alta (lodash vía recharts) — `npm audit fix` en Fase 2.
