import { createFileRoute } from '@tanstack/react-router'
import { FinancialOverviewTab } from '@/features/overview/financial-overview-tab'

export const Route = createFileRoute('/_authed/overview/financial-overview')({
  component: FinancialOverviewTab,
})
