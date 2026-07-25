/**
 * Admin — team & access management.
 * Lists perfiles with roles; toggle admin/usuario, activate/deactivate.
 * Auth credential operations (create user / reset password) require the
 * sync server's admin endpoints (service_role key) — see server/src/admin.ts;
 * this panel calls them when configured, otherwise shows guidance.
 */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CircleUserRound, KeyRound, UserPlus, Loader2,
  CheckCircle2, Info, Trash2,
} from 'lucide-react';
import { useLanguage } from '@/i18n';
import PageHeader from '@/components/PageHeader';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { isLiveMode } from '@/lib/mode';
import type { Perfil } from './Perfil';

interface AdminPerfil extends Perfil { id: string; activo?: boolean; created_at?: string }

export default function Admin() {
  const { t } = useLanguage();
  const live = isLiveMode();
  const [rows, setRows] = useState<AdminPerfil[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  // When the sync server is deployed (Vercel), credential ops call its admin API.
  const apiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '');
  const [credMode, setCredMode] = useState<'create' | 'reset' | null>(null);
  const [credEmail, setCredEmail] = useState('');
  const [credNombre, setCredNombre] = useState('');
  const [credPw, setCredPw] = useState('');
  const [credBusy, setCredBusy] = useState(false);
  const [credMsg, setCredMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function openCred(mode: 'create' | 'reset') {
    if (!apiUrl) { setShowGuide(true); return; }
    setCredMode(mode); setCredMsg(null); setCredEmail(''); setCredNombre(''); setCredPw('');
  }

  async function submitCred() {
    if (!apiUrl || !credMode || !credEmail) return;
    setCredBusy(true); setCredMsg(null);
    try {
      const path = credMode === 'create' ? '/admin/users' : '/admin/reset';
      const body = credMode === 'create'
        ? { email: credEmail, password: credPw || undefined, nombre: credNombre || undefined }
        : { email: credEmail };
      const r = await fetch(apiUrl + path, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`);
      setCredMsg({ ok: true, text: t(credMode === 'create' ? 'adm.credCreated' : 'adm.credResetSent') });
      void load();
    } catch (e) {
      setCredMsg({ ok: false, text: (e as Error).message });
    }
    setCredBusy(false);
  }

  const load = async () => {
    if (!live) return;
    const { data } = await getSupabaseClient()!.from('perfiles').select('*').order('created_at');
    setRows((data ?? []) as AdminPerfil[]);
  };
  useEffect(() => { void load(); }, [live]);

  async function toggleRol(p: AdminPerfil) {
    setBusyId(p.id);
    const rol = p.rol === 'admin' ? 'usuario' : 'admin';
    if (live) await getSupabaseClient()!.from('perfiles').update({ rol }).eq('id', p.id);
    setRows((rs) => rs.map((r) => (r.id === p.id ? { ...r, rol } : r)));
    setBusyId(null);
  }

  async function toggleActivo(p: AdminPerfil) {
    setBusyId(p.id);
    const activo = !(p.activo ?? true);
    if (live) await getSupabaseClient()!.from('perfiles').update({ activo }).eq('id', p.id);
    setRows((rs) => rs.map((r) => (r.id === p.id ? { ...r, activo } : r)));
    setBusyId(null);
  }

  async function removePerfil(p: AdminPerfil) {
    setBusyId(p.id);
    if (live) await getSupabaseClient()!.from('perfiles').delete().eq('id', p.id);
    setRows((rs) => rs.filter((r) => r.id !== p.id));
    setBusyId(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('adm.title')} caption={t('adm.caption')} />

      {/* auth credentials card */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-strong p-4">
        <div className="flex items-center gap-3">
          <KeyRound className="size-5" style={{ color: 'var(--sync)' }} />
          <div>
            <p className="text-[13px] font-semibold text-txt-primary">{t('adm.credTitle')}</p>
            <p className="text-[12px] text-txt-muted">{t('adm.credCaption')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => openCred('create')}
            className="flex items-center gap-2 rounded-lg border border-border-strong px-3.5 py-2 text-[12px] font-medium text-txt-secondary hover:border-[var(--sync)]">
            <UserPlus className="size-4" />{t('adm.createUser')}
          </button>
          <button onClick={() => openCred('reset')}
            className="flex items-center gap-2 rounded-lg border border-border-strong px-3.5 py-2 text-[12px] font-medium text-txt-secondary hover:border-[var(--sync)]">
            <KeyRound className="size-4" />{t('adm.resetPw')}
          </button>
        </div>
      </div>

      {/* users table */}
      <div className="overflow-hidden rounded-xl border border-border-strong">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border-strong bg-overlay text-left">
              <th className="px-4 py-2.5 font-semibold text-txt-secondary">{t('adm.col.user')}</th>
              <th className="px-4 py-2.5 font-semibold text-txt-secondary">{t('adm.col.role')}</th>
              <th className="px-4 py-2.5 font-semibold text-txt-secondary">{t('adm.col.status')}</th>
              <th className="px-4 py-2.5 text-right font-semibold text-txt-secondary">{t('adm.col.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-border-subtle">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-overlay">
                      {p.foto_url ? <img src={p.foto_url} alt="" className="size-full object-cover" /> : <CircleUserRound className="size-5 text-txt-muted" />}
                    </div>
                    <div>
                      <p className="font-medium text-txt-primary">{p.nombre}</p>
                      <p className="text-[11px] text-txt-muted">{p.cargo || p.email || '—'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => void toggleRol(p)} disabled={busyId === p.id}
                    className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-transform hover:scale-105"
                    style={p.rol === 'admin'
                      ? { background: 'rgba(22,199,132,0.12)', color: 'var(--brand)' }
                      : { background: 'rgba(56,189,248,0.12)', color: 'var(--sync)' }}>
                    {busyId === p.id ? <Loader2 className="size-3 animate-spin" /> : t(`per.rol.${p.rol}`)}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => void toggleActivo(p)}
                    className="rounded-full px-3 py-1 text-[11px] font-medium"
                    style={(p.activo ?? true)
                      ? { background: 'rgba(22,199,132,0.12)', color: 'var(--brand)' }
                      : { background: 'rgba(248,113,113,0.12)', color: '#F87171' }}>
                    {(p.activo ?? true) ? t('adm.active') : t('adm.inactive')}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => void removePerfil(p)} className="rounded-lg p-2 text-txt-muted hover:text-red-400">
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-txt-muted">{t('adm.empty')}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* credential form modal (only when VITE_API_URL is configured) */}
      {credMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setCredMode(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md space-y-4 rounded-2xl border border-border-strong bg-[#0B1118] p-6">
            <div className="flex items-center gap-2 text-[15px] font-semibold text-txt-primary">
              {credMode === 'create' ? <UserPlus className="size-5" style={{ color: 'var(--brand)' }} /> : <KeyRound className="size-5" style={{ color: 'var(--sync)' }} />}
              {t(credMode === 'create' ? 'adm.createUser' : 'adm.resetPw')}
            </div>
            <div className="space-y-3">
              <input value={credEmail} onChange={(e) => setCredEmail(e.target.value)} type="email"
                placeholder={t('adm.credEmailPh')}
                className="w-full rounded-lg border border-border-strong bg-transparent px-3 py-2.5 text-[13px] text-txt-primary outline-none focus:border-[var(--brand)]" />
              {credMode === 'create' && (
                <>
                  <input value={credNombre} onChange={(e) => setCredNombre(e.target.value)}
                    placeholder={t('adm.credNombrePh')}
                    className="w-full rounded-lg border border-border-strong bg-transparent px-3 py-2.5 text-[13px] text-txt-primary outline-none focus:border-[var(--brand)]" />
                  <input value={credPw} onChange={(e) => setCredPw(e.target.value)} type="password"
                    placeholder={t('adm.credPwPh')}
                    className="w-full rounded-lg border border-border-strong bg-transparent px-3 py-2.5 text-[13px] text-txt-primary outline-none focus:border-[var(--brand)]" />
                  <p className="text-[11px] text-txt-muted">{t('adm.credPwHint')}</p>
                </>
              )}
            </div>
            {credMsg && (
              <p className="text-[12px]" style={{ color: credMsg.ok ? 'var(--brand)' : '#F87171' }}>{credMsg.text}</p>
            )}
            <button onClick={() => void submitCred()} disabled={credBusy || !credEmail}
              className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-semibold text-[#041210] disabled:opacity-50"
              style={{ background: 'var(--brand)' }}>
              {credBusy ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
              {t('adm.credSubmit')}
            </button>
          </motion.div>
        </div>
      )}

      {/* guidance modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowGuide(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md space-y-4 rounded-2xl border border-border-strong bg-[#0B1118] p-6">
            <div className="flex items-center gap-2 text-[15px] font-semibold text-txt-primary">
              <Info className="size-5" style={{ color: 'var(--sync)' }} />{t('adm.guideTitle')}
            </div>
            <ol className="list-decimal space-y-2 pl-5 text-[13px] leading-relaxed text-txt-secondary">
              <li>{t('adm.guide1')}</li>
              <li>{t('adm.guide2')}</li>
              <li>{t('adm.guide3')}</li>
            </ol>
            <button onClick={() => setShowGuide(false)}
              className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-semibold text-[#041210]"
              style={{ background: 'var(--brand)' }}>
              <CheckCircle2 className="size-4" />{t('adm.guideOk')}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
