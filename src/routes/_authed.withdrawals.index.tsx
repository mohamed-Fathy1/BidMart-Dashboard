import { createFileRoute } from '@tanstack/react-router'
import { WithdrawalsListPage } from '@/features/withdrawals/withdrawals-list-page'

export const Route = createFileRoute('/_authed/withdrawals/')({
  component: WithdrawalsListPage,
})
