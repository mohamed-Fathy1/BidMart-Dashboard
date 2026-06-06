import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertCircle } from 'lucide-react'
import type { PaginationState } from '@tanstack/react-table'
import type { WalletTxType } from '@/types/api'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { SearchInput } from '@/components/shared/search-input'
import { FilterSelect } from '@/components/shared/filter-select'
import { TableFiltersShell } from '@/components/shared/table-filters-shell'
import { DataTable } from '@/components/data-table/data-table'
import { useListPageData } from '@/lib/use-list-page-data'
import {
  useWalletDashboardQuery,
  useWalletTransactionsQuery,
} from '@/features/wallet/wallet.queries'
import { useWalletColumns } from '@/features/wallet/wallet.columns'

const WALLET_TX_TYPES: readonly WalletTxType[] = [
  'TOP_UP',
  'ORDER_PAYMENT',
  'ORDER_REFUND',
  'SELLER_PAYOUT',
  'REFERRAL_CREDIT',
  'ADMIN_ADJUSTMENT',
]

interface WalletPanelProps {
  sellerId: string
}

export function WalletPanel({ sellerId }: WalletPanelProps) {
  const { t } = useTranslation()

  const [typeFilter, setTypeFilter] = useState<WalletTxType | ''>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const {
    data: dashboard,
    isLoading: dashboardLoading,
    isError: dashboardErrored,
  } = useWalletDashboardQuery(sellerId)

  const txParams = {
    type: typeFilter || undefined,
    referenceNumber: searchTerm.trim() || undefined,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  }
  const { data: txResponse, isLoading: txLoading } = useWalletTransactionsQuery(
    sellerId,
    txParams,
  )

  const hasActiveFilters = typeFilter !== '' || searchTerm.trim() !== ''
  const { rows, tableProps } = useListPageData({
    response: txResponse,
    isLoading: txLoading,
    pagination,
    setPagination,
    hasActiveFilters,
    clearFilters: () => {
      setTypeFilter('')
      setSearchTerm('')
      setPagination((p) => ({ ...p, pageIndex: 0 }))
    },
  })

  const columns = useWalletColumns()

  const typeOptions = useMemo(
    () => WALLET_TX_TYPES.map((tx) => ({ value: tx, label: t(`wallet:tx_type.${tx}`) })),
    [t],
  )

  const currency = dashboard?.currencyCode ?? 'SAR'

  function resetToFirstPage() {
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }

  const toolbar = (
    <TableFiltersShell>
      <SearchInput
        value={searchTerm}
        onChange={(v) => {
          setSearchTerm(v)
          resetToFirstPage()
        }}
        placeholder={t('wallet:transactions.filters.search_placeholder')}
        className="w-full min-w-[min(100%,220px)] sm:w-72"
      />
      <FilterSelect
        value={typeFilter}
        onChange={(v) => {
          setTypeFilter((v as WalletTxType | '') || '')
          resetToFirstPage()
        }}
        options={typeOptions}
        placeholder={t('wallet:transactions.filters.type')}
        className="min-w-[180px]"
      />
    </TableFiltersShell>
  )

  return (
    <div className="space-y-6">
      {dashboardErrored ? (
        <Card>
          <CardContent className="flex items-center gap-3 py-6 text-sm text-muted-foreground">
            <AlertCircle className="size-4 text-destructive" aria-hidden />
            {t('wallet:errors.load_failed')}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dashboardLoading || !dashboard ? (
              <>
                <Skeleton className="h-[96px] rounded-xl" />
                <Skeleton className="h-[96px] rounded-xl" />
                <Skeleton className="h-[96px] rounded-xl" />
              </>
            ) : (
              <>
                <StatCard
                  label={t('wallet:stats.balance')}
                  value={`${dashboard.balance} ${currency}`}
                />
                <StatCard
                  label={t('wallet:stats.holding')}
                  value={`${dashboard.holdingBalance} ${currency}`}
                />
                <StatCard
                  label={t('wallet:stats.available')}
                  value={`${dashboard.availableForSettlement} ${currency}`}
                />
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{t('wallet:stats.available_hint')}</p>
        </>
      )}

      <Card>
        <CardContent className="space-y-4 px-6 py-6">
          <header className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">
              {t('wallet:transactions.title')}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t('wallet:transactions.subtitle')}
            </p>
          </header>

          <DataTable
            columns={columns}
            data={rows}
            {...tableProps}
            emptyKeyPrefix="wallet:empty"
            toolbar={toolbar}
            getRowId={(row) => row.id}
          />
        </CardContent>
      </Card>
    </div>
  )
}
