import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'

export const Route = createFileRoute('/_authed/overview/')({
  component: GeneralOverviewRoute,
})

function GeneralOverviewRoute() {
  const { t } = useTranslation()
  return <EmptyState icon={LayoutDashboard} title={t('overview:tabs.general')} />
}
