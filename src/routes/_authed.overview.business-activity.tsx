import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Activity } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'

export const Route = createFileRoute('/_authed/overview/business-activity')({
  component: BusinessActivityRoute,
})

function BusinessActivityRoute() {
  const { t } = useTranslation()
  return <EmptyState icon={Activity} title={t('overview:tabs.business_activity')} />
}
