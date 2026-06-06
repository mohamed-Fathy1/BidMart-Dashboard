import { Outlet, createFileRoute } from '@tanstack/react-router'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { PermissionDenied } from '@/routes/_authed'
import { parseListSearchBase, type ListSearchBase } from '@/lib/list-search'

export interface WithdrawalsSearch extends ListSearchBase {
  /** Comma-separated status filter (e.g. "NEW,ADJUSTED") per spec §C1. */
  status?: string
  dateFrom?: string
  dateTo?: string
}

export const Route = createFileRoute('/_authed/withdrawals')({
  validateSearch: (search: Record<string, unknown>): WithdrawalsSearch => ({
    ...parseListSearchBase(search),
    status:
      typeof search.status === 'string' && search.status.trim() !== ''
        ? search.status
        : undefined,
    dateFrom:
      typeof search.dateFrom === 'string' && search.dateFrom.trim() !== ''
        ? search.dateFrom
        : undefined,
    dateTo:
      typeof search.dateTo === 'string' && search.dateTo.trim() !== ''
        ? search.dateTo
        : undefined,
  }),
  component: WithdrawalsLayout,
})

function WithdrawalsLayout() {
  const allowed = usePermission(PERMISSIONS.withdrawals.view)
  if (!allowed) return <PermissionDenied />
  return <Outlet />
}
