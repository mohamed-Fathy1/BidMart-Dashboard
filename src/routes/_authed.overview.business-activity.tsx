import { createFileRoute } from '@tanstack/react-router'
import { BusinessActivityTab } from '@/features/overview/business-activity-tab'

export const Route = createFileRoute('/_authed/overview/business-activity')({
  component: BusinessActivityTab,
})
