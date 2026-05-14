import { createFileRoute } from '@tanstack/react-router'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { ComplaintDetailPage } from '@/features/complaints/complaint-detail-page'
import { PermissionDenied } from '@/routes/_authed'

export const Route = createFileRoute('/_authed/complaints/$complaintId')({
  component: ComplaintDetailRoute,
})

function ComplaintDetailRoute() {
  const { complaintId } = Route.useParams()
  const allowed = usePermission(PERMISSIONS.complaints.view)
  if (!allowed) return <PermissionDenied />
  return <ComplaintDetailPage complaintId={complaintId} />
}
