import { createFileRoute } from '@tanstack/react-router'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { SupportTicketDetailPage } from '@/features/support-tickets/support-ticket-detail-page'
import { PermissionDenied } from '@/routes/_authed'

export const Route = createFileRoute('/_authed/support-tickets/$ticketId')({
  component: SupportTicketDetailRoute,
})

function SupportTicketDetailRoute() {
  const { ticketId } = Route.useParams()
  const allowed = usePermission(PERMISSIONS.contactMessages.view)
  if (!allowed) return <PermissionDenied />
  return <SupportTicketDetailPage ticketId={ticketId} />
}
