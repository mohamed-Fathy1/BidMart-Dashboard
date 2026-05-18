import { createFileRoute } from '@tanstack/react-router'
import { SettingsComplaintTypesListPage } from '@/features/complaint-types/complaint-types-list-page'
import { parseListSearchBase, readBoolean, type ListSearchBase } from '@/lib/list-search'

export interface SettingsComplaintTypesSearch extends ListSearchBase {
  isActive?: boolean
}

export const Route = createFileRoute('/_authed/settings/complaint-types')({
  validateSearch: (search: Record<string, unknown>): SettingsComplaintTypesSearch => ({
    ...parseListSearchBase(search),
    isActive: readBoolean(search.isActive),
  }),
  component: ComplaintTypesRoute,
})

function ComplaintTypesRoute() {
  return <SettingsComplaintTypesListPage />
}
