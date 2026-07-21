import EmptyState from '@/components/EmptyState';
import PageHeader from '@/components/PageHeader';
import { useLanguage } from '@/i18n';

/** Stub — page agent overwrites this file with the real module. */
export default function Comisiones() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t('nav.comisiones' as const)} />
      <div className="rounded-xl border border-hairline bg-elevated">
        <EmptyState title={t('common.underConstruction')} caption={t('common.underConstructionCaption')} />
      </div>
    </div>
  );
}
