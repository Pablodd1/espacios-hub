import { AlertTriangle, CheckCircle2, Clock3, GitCompareArrows, Loader2, Send } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLanguage } from '@/i18n';
import type { DictKey } from '@/i18n';
import { cn } from '@/lib/utils';

export type StatusKind =
  // documentos.estado
  | 'sincronizado'
  | 'pendiente'
  | 'diferencia'
  | 'error'
  // sync_jobs.estado
  | 'en_proceso'
  | 'completado'
  // contenedores.estado
  | 'en_transito'
  | 'arribado'
  | 'levante'
  | 'entregado'
  // messaging
  | 'enviado';

type Variant = 'brand' | 'warning' | 'danger' | 'dangerOutline' | 'sync' | 'whatsapp' | 'violet';

const KIND_META: Record<StatusKind, { key: DictKey; variant: Variant; icon: LucideIcon; spin?: boolean }> = {
  sincronizado: { key: 'status.synced', variant: 'brand', icon: CheckCircle2 },
  completado: { key: 'status.completed', variant: 'brand', icon: CheckCircle2 },
  entregado: { key: 'contStatus.entregado', variant: 'brand', icon: CheckCircle2 },
  arribado: { key: 'contStatus.arribado', variant: 'brand', icon: CheckCircle2 },
  pendiente: { key: 'status.pending', variant: 'warning', icon: Clock3 },
  error: { key: 'status.error', variant: 'danger', icon: AlertTriangle },
  diferencia: { key: 'status.diff', variant: 'dangerOutline', icon: GitCompareArrows },
  en_proceso: { key: 'status.inProgress', variant: 'sync', icon: Loader2, spin: true },
  en_transito: { key: 'contStatus.en_transito', variant: 'sync', icon: Loader2 },
  levante: { key: 'contStatus.levante', variant: 'violet', icon: CheckCircle2 },
  enviado: { key: 'status.sent', variant: 'whatsapp', icon: Send },
};

const VARIANT_STYLES: Record<Variant, { bg: string; color: string; border?: string }> = {
  brand: { bg: 'var(--brand-dim)', color: 'var(--brand)' },
  warning: { bg: 'var(--warning-dim)', color: 'var(--warning)' },
  danger: { bg: 'var(--danger-dim)', color: 'var(--danger)' },
  dangerOutline: { bg: 'transparent', color: 'var(--danger)', border: '1px solid rgba(240,68,82,0.45)' },
  sync: { bg: 'var(--sync-dim)', color: 'var(--sync)' },
  whatsapp: { bg: 'rgba(37,211,102,0.12)', color: 'var(--whatsapp)' },
  violet: { bg: 'rgba(139,92,246,0.12)', color: 'var(--violet)' },
};

interface StatusBadgeProps {
  status: StatusKind;
  /** Override the i18n label. */
  label?: string;
  /** Hide the leading status glyph. */
  hideIcon?: boolean;
  className?: string;
}

/**
 * Pill with glyph + i18n label. Status is never conveyed by color alone.
 * Variants: Sincronizado (brand) · Pendiente (warning) · Error (danger) ·
 * Diferencia (danger outline) · En curso (sync + spinner) · Enviado (whatsapp).
 */
export default function StatusBadge({ status, label, hideIcon = false, className }: StatusBadgeProps) {
  const { t } = useLanguage();
  const meta = KIND_META[status];
  const style = VARIANT_STYLES[meta.variant];
  const Icon = meta.icon;
  return (
    <span
      className={cn('inline-flex h-[22px] items-center gap-1.5 rounded-md px-2 text-xs font-semibold', className)}
      style={{ backgroundColor: style.bg, color: style.color, border: style.border }}
    >
      {!hideIcon && (
        <Icon className={cn('size-3', meta.spin && 'animate-spin')} strokeWidth={2.25} aria-hidden />
      )}
      <span>{label ?? t(meta.key)}</span>
    </span>
  );
}
