import { useMemo } from 'react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Eye, CheckCircle, XCircle } from 'lucide-react'
import type { SettlementListItem, SettlementRequestStatus } from '@/types/api'
import { useUrlListState } from '@/lib/use-url-list-state'
import { useListPageData } from '@/lib/use-list-page-data'
import { useConfirmTarget } from '@/lib/use-confirm-target'
import type { WithdrawalsSearch } from '@/routes/_authed.withdrawals'
import { PageHeader } from '@/components/shared/page-header'
import { SearchInput } from '@/components/shared/search-input'
import { FilterSelect } from '@/components/shared/filter-select'
import { TableFiltersShell } from '@/components/shared/table-filters-shell'
import {
  DataTable,
  type RowActionItem,
} from '@/components/data-table/data-table'
import {
  TargetedConfirmDialog,
  TargetedReasonDialog,
} from '@/components/shared/targeted-confirm-dialog'
import { useWithdrawalColumns } from '@/features/withdrawals/withdrawals.columns'
import {
  useWithdrawalsQuery,
  useApproveSettlementMutation,
  useRejectSettlementMutation,
} from '@/features/withdrawals/withdrawals.queries'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { format } from '@/lib/format'

const withdrawalsRoute = getRouteApi('/_authed/withdrawals')

const SETTLEMENT_STATUSES: readonly SettlementRequestStatus[] = [
  'NEW',
  'APPROVED',
  'ADJUSTED',
  'REJECTED',
]

export function WithdrawalsListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { search, searchValue, pagination, setPagination, setSearch, setFilter } =
    useUrlListState<WithdrawalsSearch>({ route: withdrawalsRoute })
  const statusFilter = search.status ?? ''

  const canApprove = usePermission(PERMISSIONS.withdrawals.approve)
  const canReject = usePermission(PERMISSIONS.withdrawals.reject)

  const approveFlow = useConfirmTarget<SettlementListItem>()
  const rejectFlow = useConfirmTarget<SettlementListItem>()

  const { data: response, isLoading } = useWithdrawalsQuery({
    search: searchValue.trim() || undefined,
    status: statusFilter || undefined,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  })

  const hasActiveFilters = searchValue.trim() !== '' || statusFilter !== ''
  const { rows, meta, tableProps } = useListPageData({
    response,
    isLoading,
    pagination,
    setPagination,
    hasActiveFilters,
    clearFilters: () => {
      setSearch('')
      setFilter('status', undefined)
    },
  })

  const columns = useWithdrawalColumns()

  const approveMutation = useApproveSettlementMutation()
  const rejectMutation = useRejectSettlementMutation()

  const statusOptions = useMemo(
    () =>
      SETTLEMENT_STATUSES.map((s) => ({
        value: s,
        label: t(`withdrawals:status_options.${s}`),
      })),
    [t],
  )

  function getRowActions(row: SettlementListItem): RowActionItem<SettlementListItem>[] {
    const items: RowActionItem<SettlementListItem>[] = [
      {
        label: t('withdrawals:actions.view'),
        icon: Eye,
        onClick: (r) =>
          navigate({ to: '/withdrawals/$id', params: { id: r.id } }),
      },
    ]

    if (row.status === 'NEW' && canApprove) {
      items.push({
        label: t('withdrawals:actions.approve'),
        icon: CheckCircle,
        onClick: (r) => approveFlow.ask(r),
        variant: 'success',
      })
    }

    if (row.status === 'NEW' && canReject) {
      items.push({
        label: t('withdrawals:actions.reject'),
        icon: XCircle,
        onClick: (r) => rejectFlow.ask(r),
        variant: 'destructive',
      })
    }

    return items
  }

  const toolbar = (
    <TableFiltersShell
      meta={
        meta != null
          ? t('withdrawals:meta.total_requests', { count: format.number(meta.total) })
          : undefined
      }
    >
      <SearchInput
        value={searchValue}
        onChange={(v) => setSearch(v)}
        placeholder={t('withdrawals:filters.search_placeholder')}
        className="w-full min-w-[min(100%,220px)] sm:w-72"
      />
      <FilterSelect
        value={statusFilter}
        onChange={(v) => setFilter('status', v || undefined)}
        options={statusOptions}
        placeholder={t('withdrawals:filters.status')}
        className="min-w-[160px]"
      />
    </TableFiltersShell>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('withdrawals:page_title')}
        description={t('withdrawals:page_description')}
      />

      <DataTable
        columns={columns}
        data={rows}
        {...tableProps}
        emptyKeyPrefix="withdrawals:empty"
        toolbar={toolbar}
        actions={getRowActions}
        rowLabel={(row) => row.sellerName}
        getRowId={(row) => row.id}
        onRowClick={(row) =>
          navigate({ to: '/withdrawals/$id', params: { id: row.id } })
        }
      />

      <TargetedConfirmDialog
        flow={approveFlow}
        i18nPrefix="withdrawals:approve_dialog"
        getName={(r) => format.currency(Number(r.requestedAmount))}
        confirmLabel={t('withdrawals:approve_dialog.confirm')}
        onConfirm={(target) =>
          approveMutation.mutate(target.id, { onSettled: approveFlow.close })
        }
        isLoading={approveMutation.isPending}
      />

      <TargetedReasonDialog
        flow={rejectFlow}
        i18nPrefix="withdrawals:reject_dialog"
        getName={(r) => r.sellerName}
        confirmLabel={t('withdrawals:reject_dialog.confirm')}
        onConfirm={(target, reason) =>
          rejectMutation.mutate(
            { id: target.id, payload: { reason } },
            { onSettled: rejectFlow.close },
          )
        }
        isLoading={rejectMutation.isPending}
        variant="destructive"
      />
    </div>
  )
}
