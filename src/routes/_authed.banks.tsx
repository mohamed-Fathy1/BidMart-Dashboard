import { createFileRoute } from '@tanstack/react-router'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { BanksListPage } from '@/features/banks/banks-list-page'
import { PermissionDenied } from '@/routes/_authed'
import { parseListSearchBase, readBoolean, type ListSearchBase } from '@/lib/list-search'

export interface BanksSearch extends ListSearchBase {
  isActive?: boolean
  countryId?: string
}

export const Route = createFileRoute('/_authed/banks')({
  validateSearch: (search: Record<string, unknown>): BanksSearch => ({
    ...parseListSearchBase(search),
    isActive: readBoolean(search.isActive),
    countryId:
      typeof search.countryId === 'string' && search.countryId.trim() !== ''
        ? search.countryId
        : undefined,
  }),
  component: BanksRoute,
})

function BanksRoute() {
  const allowed = usePermission(PERMISSIONS.withdrawals.view)
  if (!allowed) return <PermissionDenied />
  return <BanksListPage />
}
