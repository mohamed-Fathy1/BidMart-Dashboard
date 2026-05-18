import { createFileRoute } from '@tanstack/react-router'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { ComplaintTypesListPage } from '@/features/complaint-types/complaint-types-list-page'
import { PermissionDenied } from '@/routes/_authed'
import { parseListSearchBase, readBoolean, type ListSearchBase } from '@/lib/list-search'

export interface ComplaintTypesSearch extends ListSearchBase {
  isActive?: boolean
}

export const Route = createFileRoute('/_authed/complaint-types')({
  validateSearch: (search: Record<string, unknown>): ComplaintTypesSearch => ({
    ...parseListSearchBase(search),
    isActive: readBoolean(search.isActive),
  }),
  component: ComplaintTypesRoute,
})

function ComplaintTypesRoute() {
  const allowed = usePermission(PERMISSIONS.complaints.view)
  if (!allowed) return <PermissionDenied />
  return <ComplaintTypesListPage />
}
