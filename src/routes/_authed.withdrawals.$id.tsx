import { createFileRoute } from '@tanstack/react-router'
import { WithdrawalDetailPage } from '@/features/withdrawals/withdrawal-detail-page'

export const Route = createFileRoute('/_authed/withdrawals/$id')({
  component: WithdrawalDetailRoute,
})

function WithdrawalDetailRoute() {
  const { id } = Route.useParams()
  // key forces a fresh component instance per settlement so transient state
  // (revealed IBAN, dialog flags) cannot leak across navigations.
  return <WithdrawalDetailPage key={id} id={id} />
}
