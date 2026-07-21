-- rls_policies: enable RLS and permissive anon read/write policies
-- NOTE: Internal demo MVP only. These policies allow the anon (publishable) key
-- full read/write. Tighten before any production / external exposure.

alter table public.terceros enable row level security;
alter table public.bancos enable row level security;
alter table public.documentos enable row level security;
alter table public.contenedores enable row level security;
alter table public.despachos enable row level security;
alter table public.comisiones enable row level security;
alter table public.anticipos_proveedor enable row level security;
alter table public.reconciliacion enable row level security;
alter table public.sync_jobs enable row level security;
alter table public.audit_log enable row level security;

-- Permissive policies for anon (and authenticated) on each table
create policy "anon_all_terceros" on public.terceros for all to anon, authenticated using (true) with check (true);
create policy "anon_all_bancos" on public.bancos for all to anon, authenticated using (true) with check (true);
create policy "anon_all_documentos" on public.documentos for all to anon, authenticated using (true) with check (true);
create policy "anon_all_contenedores" on public.contenedores for all to anon, authenticated using (true) with check (true);
create policy "anon_all_despachos" on public.despachos for all to anon, authenticated using (true) with check (true);
create policy "anon_all_comisiones" on public.comisiones for all to anon, authenticated using (true) with check (true);
create policy "anon_all_anticipos_proveedor" on public.anticipos_proveedor for all to anon, authenticated using (true) with check (true);
create policy "anon_all_reconciliacion" on public.reconciliacion for all to anon, authenticated using (true) with check (true);
create policy "anon_all_sync_jobs" on public.sync_jobs for all to anon, authenticated using (true) with check (true);
create policy "anon_all_audit_log" on public.audit_log for all to anon, authenticated using (true) with check (true);
