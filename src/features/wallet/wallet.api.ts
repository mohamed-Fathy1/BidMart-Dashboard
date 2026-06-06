import { api } from '@/lib/axios'
import {
  unwrap,
  unwrapPaginated,
  type AdminWalletDashboard,
  type AdminWalletTxItem,
  type ApiEnvelope,
  type Paginated,
  type WalletTxType,
} from '@/types/api'

/**
 * Admin Wallet (spec §B). All routes under `/admin/wallets/:sellerId*`.
 *
 * Notes:
 *  - Money fields are 2-decimal strings (`"450.00"`), never numbers.
 *  - Transaction `amount` is sign-prefixed; debits use U+2212 (`−`), NOT
 *    ASCII `-`. Render as-is — `format.signedMoney` splits sign for coloring.
 *  - A seller with no wallet returns zero-balances (B1) and an empty
 *    paginated list (B2), not a 404.
 */

export interface ListWalletTransactionsParams {
  type?: WalletTxType
  /** `YYYY-MM-DD` */
  dateFrom?: string
  /** `YYYY-MM-DD` — server treats as inclusive. */
  dateTo?: string
  referenceNumber?: string
  page?: number
  limit?: number
}

export async function getWalletDashboard(
  sellerId: string,
): Promise<AdminWalletDashboard> {
  const res = await api.get<
    ApiEnvelope<AdminWalletDashboard> | AdminWalletDashboard
  >(`/admin/wallets/${sellerId}`)
  return unwrap(res.data)
}

export async function listWalletTransactions(
  sellerId: string,
  params: ListWalletTransactionsParams,
): Promise<Paginated<AdminWalletTxItem>> {
  const res = await api.get<ApiEnvelope<AdminWalletTxItem[]>>(
    `/admin/wallets/${sellerId}/transactions`,
    { params },
  )
  return unwrapPaginated(res.data)
}
