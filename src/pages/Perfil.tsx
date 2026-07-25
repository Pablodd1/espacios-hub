/**
 * Perfil — seller profile with photo (Supabase Storage 'avatars' bucket).
 * Works LIVE (persists to perfiles + storage) with local demo fallback.
 */
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, CircleUserRound, Loader2, Save, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/i18n';
import PageHeader from '@/components/PageHeader';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { isLiveMode } from '@/lib/mode';

export interface Perfil {
  id?: string;
  nombre: string;
  cargo: string;
  whatsapp: string;
  email: string;
  rol: 'admin' | 'usuario';
  foto_url: string | null;
}

const EMPTY: Perfil = { nombre: '', cargo: '', whatsapp: '', email: '', rol: 'usuario', foto_url: null };

export default function Perfil() {
  const { t } = useLanguage();
  const live = isLiveMode();
  const fileRef = useRef<HTMLInputElement>(null);
  const [perfil, setPerfil] = useState<Perfil>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // load first profile (seller) if exists
  useEffect(() => {
    if (!live) return;
    void (async () => {
      const { data } = await getSupabaseClient()!.from('perfiles').select('*').order('created_at').limit(1);
      if (data?.length) setPerfil(data[0] as Perfil);
    })();
  }, [live]);

  async function onPhoto(file: File) {
    setPreview(URL.createObjectURL(file));
    if (!live) return;
    setUploading(true);
    const client = getSupabaseClient()!;
    const path = `perfil-${Date.now()}.${file.name.split('.').pop() ?? 'jpg'}`;
    const { error } = await client.storage.from('avatars').upload(path, file, { upsert: true });
    if (!error) {
      const { data } = client.storage.from('avatars').getPublicUrl(path);
      setPerfil((p) => ({ ...p, foto_url: data.publicUrl }));
    }
    setUploading(false);
  }

  async function save() {
    setBusy(true); setSaved(false);
    if (live) {
      const client = getSupabaseClient()!;
      const payload = { nombre: perfil.nombre, cargo: perfil.cargo, whatsapp: perfil.whatsapp, email: perfil.email, rol: perfil.rol, foto_url: perfil.foto_url };
      if (perfil.id) await client.from('perfiles').update(payload).eq('id', perfil.id);
      else {
        const { data } = await client.from('perfiles').insert(payload).select().single();
        if (data) setPerfil((p) => ({ ...p, id: (data as Perfil).id }));
      }
    }
    setBusy(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const foto = preview ?? perfil.foto_url;

  return (
    <div className="space-y-6">
      <PageHeader title={t('per.title')} caption={t('per.caption')} />
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Photo card */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 rounded-xl border border-border-strong p-6">
          <div className="relative">
            <div className="flex size-36 items-center justify-center overflow-hidden rounded-full border-2"
              style={{ borderColor: 'var(--brand)', background: 'var(--overlay)' }}>
              {foto
                ? <img src={foto} alt={perfil.nombre} className="size-full object-cover" />
                : <CircleUserRound className="size-16 text-txt-muted" />}
            </div>
            <button onClick={() => fileRef.current?.click()}
              className="absolute bottom-1 right-1 flex size-9 items-center justify-center rounded-full text-[#041210] shadow-lg transition-transform hover:scale-105"
              style={{ background: 'var(--brand)' }}>
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) void onPhoto(f); }} />
          </div>
          <p className="text-center text-[12px] text-txt-muted">{t('per.photoHint')}</p>
          {perfil.rol === 'admin' && (
            <span className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
              style={{ background: 'rgba(22,199,132,0.12)', color: 'var(--brand)' }}>{t('per.adminBadge')}</span>
          )}
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="space-y-4 rounded-xl border border-border-strong p-6">
          {([
            ['nombre', t('per.f.nombre'), 'text', 'Jasmel Acosta'],
            ['cargo', t('per.f.cargo'), 'text', 'CTO / Vendedor senior'],
            ['whatsapp', t('per.f.whatsapp'), 'text', '+57 300 000 0000'],
            ['email', t('per.f.email'), 'email', 'nombre@espaciosimportados.com.co'],
          ] as const).map(([key, label, type, ph]) => (
            <label key={key} className="block">
              <span className="mb-1.5 block text-[12px] font-medium text-txt-secondary">{label}</span>
              <input type={type} value={perfil[key] ?? ''} placeholder={ph}
                onChange={(e) => setPerfil((p) => ({ ...p, [key]: e.target.value }))}
                className="w-full rounded-lg border border-border-strong bg-overlay px-3 py-2.5 text-[14px] text-txt-primary outline-none placeholder:text-txt-muted focus:border-[var(--brand)]" />
            </label>
          ))}
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-txt-secondary">{t('per.f.rol')}</span>
            <select value={perfil.rol} onChange={(e) => setPerfil((p) => ({ ...p, rol: e.target.value as Perfil['rol'] }))}
              className="w-full rounded-lg border border-border-strong bg-overlay px-3 py-2.5 text-[14px] text-txt-primary">
              <option value="usuario">{t('per.rol.usuario')}</option>
              <option value="admin">{t('per.rol.admin')}</option>
            </select>
          </label>
          <button onClick={() => void save()} disabled={busy || !perfil.nombre}
            className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-[14px] font-semibold text-[#041210] disabled:opacity-50"
            style={{ background: 'var(--brand)' }}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : saved ? <CheckCircle2 className="size-4" /> : <Save className="size-4" />}
            {busy ? t('per.saving') : saved ? t('per.saved') : t('per.save')}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
