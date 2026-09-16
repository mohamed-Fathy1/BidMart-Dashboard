import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Landmark } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'

export const Route = createFileRoute('/_authed/overview/financial-overview')({
  component: FinancialOverviewRoute,
})

function FinancialOverviewRoute() {
  const { t } = useTranslation()
  return <EmptyState icon={Landmark} title={t('overview:tabs.financial_overview')} />
}
