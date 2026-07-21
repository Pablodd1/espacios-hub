import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  BookOpenCheck,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  HandCoins,
  Landmark,
  Languages,
  LayoutDashboard,
  LogOut,
  Percent,
  RefreshCw,
  Search,
  Settings2,
  Ship,
  Truck,
  UserRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLanguage } from '@/i18n';
import type { DictKey, Lang } from '@/i18n';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

const SIDEBAR_KEY = 'espacios-hub-sidebar-collapsed';

interface NavItem {
  to: string;
  icon: LucideIcon;
  labelKey: DictKey;
}

const OPERACION: NavItem[] = [
  { to: '/', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { to: '/tesoreria', icon: Landmark, labelKey: 'nav.tesoreria' },
  { to: '/cartera', icon: HandCoins, labelKey: 'nav.cartera' },
  { to: '/comercio-exterior', icon: Ship, labelKey: 'nav.comex' },
  { to: '/comisiones', icon: Percent, labelKey: 'nav.comisiones' },
  { to: '/contabilidad', icon: BookOpenCheck, labelKey: 'nav.contabilidad' },
  { to: '/logistica', icon: Truck, labelKey: 'nav.logistica' },
];

const SISTEMA: NavItem[] = [
  { to: '/sync-center', icon: RefreshCw, labelKey: 'nav.sync' },
  { to: '/configuracion', icon: Settings2, labelKey: 'nav.config' },
];

const ROUTE_LABEL: Record<string, DictKey> = {
  '/': 'nav.dashboard',
  '/tesoreria': 'nav.tesoreria',
  '/cartera': 'nav.cartera',
  '/comercio-exterior': 'nav.comex',
  '/comisiones': 'nav.comisiones',
  '/contabilidad': 'nav.contabilidad',
  '/logistica': 'nav.logistica',
  '/sync-center': 'nav.sync',
  '/configuracion': 'nav.config',
};

/** Signature live pulse: expanding ring behind a solid 8px core. */
export function LiveDot({ color = 'var(--sync)', className }: { color?: string; className?: string }) {
  return (
    <span className={cn('relative inline-flex size-2', className)}>
      <span
        className="absolute inline-flex size-2 rounded-full motion-safe:animate-[live-pulse_2s_ease-out_infinite]"
        style={{ backgroundColor: color, boxShadow: `0 0 12px 2px ${color}` }}
      />
      <span className="relative inline-flex size-2 rounded-full" style={{ backgroundColor: color }} />
    </span>
  );
}

function NavGroup({ label, items, collapsed }: { label: string; items: NavItem[]; collapsed: boolean }) {
  const { t } = useLanguage();
  return (
    <div className="px-3">
      {!collapsed && <p className="text-overline px-2 pb-2 pt-5 text-txt-muted">{label}</p>}
      {collapsed && <div className="mx-2 my-4 border-t border-hairline" />}
      <ul className="flex flex-col gap-0.5">
        {items.map(({ to, icon: Icon, labelKey }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/'}
              title={collapsed ? t(labelKey) : undefined}
              className={({ isActive }) =>
                cn(
                  'group relative flex h-10 items-center gap-3 rounded-lg px-2.5 text-sm font-medium transition-colors duration-180 ease-standard',
                  isActive
                    ? 'bg-brand-dim text-txt-primary'
                    : 'text-txt-secondary hover:bg-[var(--bg-hover)] hover:text-txt-primary',
                  collapsed && 'justify-center px-0',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-bar"
                      className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand"
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}
                  <Icon
                    className={cn('size-4 shrink-0', isActive ? 'text-brand' : 'text-txt-muted group-hover:text-txt-secondary')}
                    strokeWidth={1.75}
                  />
                  {!collapsed && <span className="truncate">{t(labelKey)}</span>}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  const options: Lang[] = ['es', 'en'];
  return (
    <div className="flex h-8 items-center gap-1 rounded-lg bg-inset p-1">
      <Languages className="mx-1 size-3.5 text-txt-muted" strokeWidth={1.75} aria-hidden />
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => setLang(opt)}
          aria-pressed={lang === opt}
          className={cn(
            'h-6 min-w-7 rounded-md px-1.5 text-[11px] font-semibold uppercase tracking-wide transition-all duration-180 ease-standard',
            lang === opt
              ? 'border border-border-strong bg-overlay text-txt-primary'
              : 'border border-transparent text-txt-muted hover:text-txt-secondary',
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function UserMenu() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const items = [
    { icon: UserRound, label: t('shell.profile') },
    { icon: Settings2, label: t('shell.preferences') },
    { icon: LogOut, label: t('action.logout') },
  ];
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-[var(--bg-hover)]"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <img src="/avatar-admin.png" alt={t('shell.userName')} className="size-8 rounded-full border border-border-strong object-cover" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
            <motion.div
              role="menu"
              className="absolute right-0 z-50 mt-1 w-48 rounded-lg border border-border-strong bg-overlay p-1 shadow-xl"
              initial={{ opacity: 0, scale: 0.97, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -4 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            >
              {items.map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  type="button"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-txt-secondary transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary"
                >
                  <Icon className="size-4 text-txt-muted" strokeWidth={1.75} />
                  {label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

interface AppShellProps {
  children: ReactNode;
}

/**
 * App shell — 264px/72px collapsible sidebar (persisted) + 64px topbar.
 * Content scrolls independently in <main>.
 */
export default function AppShell({ children }: AppShellProps) {
  const { t, lang } = useLanguage();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem(SIDEBAR_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(SIDEBAR_KEY, collapsed ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  const moduleLabel = useMemo(() => {
    const key = ROUTE_LABEL[location.pathname] ?? 'nav.dashboard';
    return t(key);
  }, [location.pathname, t]);

  const heartbeat = lang === 'es' ? 'hace 12 s' : '12 s ago';

  return (
    <div className="min-h-[100dvh] bg-canvas">
      {/* ============ Sidebar ============ */}
      <motion.aside
        className="fixed inset-y-0 left-0 z-40 flex flex-col border-r border-hairline bg-surface"
        animate={{ width: collapsed ? 72 : 264 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        initial={false}
      >
        {/* Logo block */}
        <div className={cn('flex h-16 items-center gap-2.5 border-b border-hairline px-4', collapsed && 'justify-center px-0')}>
          <img src="/logo.svg" alt="" className="size-8 shrink-0" />
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-display text-[15px] font-bold tracking-[0.02em] text-txt-primary">{t('app.name')}</p>
              <p className="truncate text-[11px] text-txt-muted">{t('app.company')}</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto pb-4">
          <NavGroup label={t('navGroup.operacion')} items={OPERACION} collapsed={collapsed} />
          <NavGroup label={t('navGroup.sistema')} items={SISTEMA} collapsed={collapsed} />
        </nav>

        {/* Footer: sync engine mini-card + user chip */}
        <div className="border-t border-hairline p-3">
          {!collapsed ? (
            <Link
              to="/sync-center"
              className="mb-3 flex items-center gap-2.5 rounded-lg border border-hairline bg-elevated p-3 transition-colors hover:border-border-strong"
            >
              <LiveDot />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-txt-primary">{t('shell.engineActive')}</p>
                <p className="text-[11px] text-txt-muted">
                  {t('shell.lastHeartbeat')} · {heartbeat}
                </p>
              </div>
            </Link>
          ) : (
            <Link to="/sync-center" className="mb-3 flex justify-center" title={t('shell.engineActive')}>
              <LiveDot />
            </Link>
          )}
          <div className={cn('flex items-center gap-2.5 rounded-lg p-1.5', collapsed && 'justify-center')}>
            <img
              src="/avatar-admin.png"
              alt=""
              className="size-8 shrink-0 rounded-full border border-border-strong object-cover"
            />
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-txt-primary">{t('shell.userName')}</p>
                  <p className="truncate text-[11px] text-txt-muted">{t('shell.userRole')}</p>
                </div>
                <ChevronDown className="size-4 text-txt-muted" strokeWidth={1.75} />
              </>
            )}
          </div>
        </div>

        {/* Collapse chevron */}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute -right-3 top-[72px] flex size-6 items-center justify-center rounded-full border border-border-strong bg-overlay text-txt-muted transition-colors hover:text-txt-primary"
        >
          {collapsed ? (
            <ChevronsRight className="size-3.5" strokeWidth={1.75} />
          ) : (
            <ChevronsLeft className="size-3.5" strokeWidth={1.75} />
          )}
        </button>
      </motion.aside>

      {/* ============ Main column ============ */}
      <motion.div
        className="flex min-h-[100dvh] flex-col"
        animate={{ paddingLeft: collapsed ? 72 : 264 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        initial={false}
      >
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-hairline bg-surface/90 px-6 backdrop-blur">
          {/* Breadcrumb */}
          <p className="hidden text-[13px] text-txt-muted md:block">
            {t('shell.breadcrumbRoot')} <span className="mx-1 text-txt-muted">/</span>{' '}
            <span className="text-txt-primary">{moduleLabel}</span>
          </p>

          {/* Search trigger (⌘K visual) */}
          <button
            type="button"
            className="ml-2 flex h-9 w-[280px] items-center gap-2 rounded-lg bg-inset px-3 text-[13px] text-txt-muted transition-colors hover:border-border-strong hover:text-txt-secondary"
          >
            <Search className="size-4 shrink-0" strokeWidth={1.75} />
            <span className="flex-1 truncate text-left">{t('shell.searchPlaceholder')}</span>
            <kbd className="rounded border border-hairline bg-elevated px-1.5 py-0.5 font-mono-data text-[10px] text-txt-muted">
              ⌘K
            </kbd>
          </button>

          <div className="flex-1" />

          {/* Sync status pill SIIGO●HGI */}
          <div
            className="hidden items-center gap-2 rounded-full border border-hairline bg-elevated px-3 py-1.5 lg:flex"
            title={t('shell.systemsOk')}
          >
            <span className="text-[11px] font-semibold" style={{ color: 'var(--siigo)' }}>
              SIIGO
            </span>
            <span className="size-1.5 rounded-full bg-brand" style={{ boxShadow: '0 0 8px 1px rgba(22,199,132,0.6)' }} />
            <span className="text-[11px] font-semibold" style={{ color: 'var(--hgi)' }}>
              HGI
            </span>
          </div>

          <LanguageToggle />

          {/* Notifications */}
          <button
            type="button"
            aria-label={t('shell.notifications')}
            className="relative flex size-9 items-center justify-center rounded-lg text-txt-secondary transition-colors hover:bg-[var(--bg-hover)] hover:text-txt-primary"
          >
            <Bell className="size-4" strokeWidth={1.75} />
            <span className="absolute right-1.5 top-1.5 flex size-3.5 items-center justify-center rounded-full bg-warn text-[8px] font-bold text-canvas">
              3
            </span>
          </button>

          <UserMenu />
        </header>

        {/* Content */}
        <main className="mx-auto w-full max-w-[1600px] flex-1 px-8 pb-12 pt-6">{children}</main>
      </motion.div>
    </div>
  );
}
