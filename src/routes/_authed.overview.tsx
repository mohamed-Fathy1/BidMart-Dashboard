import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/shared/page-header'

export const Route = createFileRoute('/_authed/overview')({
  component: OverviewPage,
})

function OverviewPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('shell:nav.overview')}
        description={t('shell:overview.subtitle')}
      />

      <div className="rounded-xl border border-border bg-card p-8 text-center shadow-rest">
        <p className="text-sm text-muted-foreground">{t('shell:overview.coming_soon')}</p>
      </div>
    </div>
  )
}
