/**
 * Login page — split screen: brand visual (login-bg.png) left, form right.
 * Full-screen (outside AppShell layout). ES/EN via i18n.
 * After successful sign-in navigates to '/'. App is NOT gated yet (testing mode).
 */
import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion } from 'framer-motion';
import { Loader2, LockKeyhole, Mail, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/i18n';
import { signIn } from '@/lib/auth';
import { isLiveMode } from '@/lib/mode';

export default function Login() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      setError((err as Error).message || t('auth.errorGeneric'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-[#06090E]">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <img src="/login-bg.png" alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#06090E] via-[#06090E]/60 to-transparent" />
        <div className="relative z-10 flex h-full flex-col justify-between p-10">
          <img src="/logo.svg" alt="Espacios Hub" className="h-9 w-auto" />
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-4xl font-bold leading-tight text-txt-primary"
            >
              {t('auth.brandTitle')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="mt-3 max-w-md text-[15px] leading-relaxed text-txt-secondary"
            >
              {t('auth.brandCaption')}
            </motion.p>
            <div className="mt-6 flex items-center gap-2 text-[12px] text-txt-muted">
              <ShieldCheck className="size-4" style={{ color: 'var(--brand)' }} />
              {t('auth.secureNote')}
            </div>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          <img src="/logo.svg" alt="Espacios Hub" className="mb-8 h-8 w-auto lg:hidden" />
          <h2 className="font-display text-2xl font-bold text-txt-primary">{t('auth.title')}</h2>
          <p className="mt-1.5 text-[13px] text-txt-muted">{t('auth.caption')}</p>

          {!isLiveMode() && (
            <div className="mt-5 rounded-lg border px-3.5 py-2.5 text-[12px]"
              style={{ borderColor: 'rgba(245,158,11,0.4)', color: '#F59E0B', background: 'rgba(245,158,11,0.08)' }}>
              {t('auth.demoOnly')}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium text-txt-secondary">{t('auth.email')}</span>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-txt-muted" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@espaciosimportados.com.co"
                  className="w-full rounded-lg border border-border-strong bg-overlay py-2.5 pl-9 pr-3 text-[14px] text-txt-primary outline-none transition-colors placeholder:text-txt-muted focus:border-[var(--brand)]"
                />
              </div>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium text-txt-secondary">{t('auth.password')}</span>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-txt-muted" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-border-strong bg-overlay py-2.5 pl-9 pr-3 text-[14px] text-txt-primary outline-none transition-colors placeholder:text-txt-muted focus:border-[var(--brand)]"
                />
              </div>
            </label>

            {error && (
              <div className="rounded-lg border px-3.5 py-2.5 text-[12px]"
                style={{ borderColor: 'rgba(248,113,113,0.4)', color: '#F87171', background: 'rgba(248,113,113,0.08)' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy || !isLiveMode()}
              className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[14px] font-semibold text-[#041210] transition-all disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: 'var(--brand)' }}
            >
              {busy && <Loader2 className="size-4 animate-spin" />}
              {busy ? t('auth.signingIn') : t('auth.signIn')}
            </button>
          </form>

          <Link
            to="/"
            className="mt-6 flex items-center justify-center gap-1.5 text-[12px] text-txt-muted transition-colors hover:text-txt-secondary"
          >
            <ArrowLeft className="size-3.5" />
            {t('auth.backToApp')}
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
