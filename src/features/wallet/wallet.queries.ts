import { useQuery } from '@tanstack/react-query'
import {
  getWalletDashboard,
  listWalletTransactions,
  type ListWalletTransactionsParams,
} from '@/features/wallet/wallet.api'

export const walletKeys = {
  all: ['wallet'] as const,
  dashboard: (sellerId: string) => ['wallet', 'dashboard', sellerId] as const,
  transactions: (sellerId: string, params: ListWalletTransactionsParams) =>
    ['wallet', 'transactions', sellerId, params] as const,
}

export function useWalletDashboardQuery(sellerId: string | undefined) {
  return useQuery({
    queryKey: sellerId ? walletKeys.dashboard(sellerId) : ['wallet', 'dashboard', '__none__'],
    queryFn: () => getWalletDashboard(sellerId as string),
    enabled: !!sellerId,
  })
}

export function useWalletTransactionsQuery(
  sellerId: string | undefined,
  params: ListWalletTransactionsParams,
) {
  return useQuery({
    queryKey: sellerId
      ? walletKeys.transactions(sellerId, params)
      : ['wallet', 'transactions', '__none__', params],
    queryFn: () => listWalletTransactions(sellerId as string, params),
    enabled: !!sellerId,
  })
}
