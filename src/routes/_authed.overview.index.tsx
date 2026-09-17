import { createFileRoute } from '@tanstack/react-router'
import { GeneralOverviewTab } from '@/features/overview/general-overview-tab'

export const Route = createFileRoute('/_authed/overview/')({
  component: GeneralOverviewTab,
})
