import { createFileRoute } from '@tanstack/react-router'
import { ComplaintTypesListPage } from '@/features/complaints/complaint-types-list-page'

export const Route = createFileRoute('/_authed/settings/complaint-types')({
  component: ComplaintTypesRoute,
})

function ComplaintTypesRoute() {
  return <ComplaintTypesListPage />
}
