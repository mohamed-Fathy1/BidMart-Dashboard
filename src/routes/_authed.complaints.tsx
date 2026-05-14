import { Outlet, createFileRoute, useMatchRoute } from '@tanstack/react-router'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { ComplaintsListPage } from '@/features/complaints/complaints-list-page'
import { PermissionDenied } from '@/routes/_authed'
import { parseListSearchBase, readEnum, type ListSearchBase } from '@/lib/list-search'
import type { ComplaintStatus } from '@/types/api'

const COMPLAINT_STATUS_VALUES: readonly ComplaintStatus[] = [
  'UNDER_REVIEW',
  'IN_PROGRESS',
  'RESOLVED',
  'REJECTED',
]

export interface ComplaintsSearch extends ListSearchBase {
  status?: ComplaintStatus
  type_id?: string
}

function readUuid(raw: unknown): string | undefined {
  return typeof raw === 'string' && raw.trim().length > 0 ? raw : undefined
}

export const Route = createFileRoute('/_authed/complaints')({
  validateSearch: (search: Record<string, unknown>): ComplaintsSearch => ({
    ...parseListSearchBase(search),
    status: readEnum(search.status, COMPLAINT_STATUS_VALUES),
    type_id: readUuid(search.type_id),
  }),
  component: ComplaintsRoute,
})

function ComplaintsRoute() {
  const allowed = usePermission(PERMISSIONS.complaints.view)
  if (!allowed) return <PermissionDenied />

  const matchRoute = useMatchRoute()
  const detailMatch = matchRoute({ to: '/complaints/$complaintId' })

  return detailMatch ? <Outlet /> : <ComplaintsListPage />
}
