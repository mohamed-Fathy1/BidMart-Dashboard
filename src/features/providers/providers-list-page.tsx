import { useMemo } from 'react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Eye, CheckCircle, XCircle, ShieldCheck, Ban, Unlock } from 'lucide-react'
import type { ProviderSummary, ProviderAccountStatus } from '@/types/api'
import { useUrlListState } from '@/lib/use-url-list-state'
import { useListPageData } from '@/lib/use-list-page-data'
import { useConfirmTarget } from '@/lib/use-confirm-target'
import type { ProvidersSearch } from '@/routes/_authed.providers'

const providersRoute = getRouteApi('/_authed/providers')
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
import { useProviderColumns } from '@/features/providers/providers.columns'
import {
  useProvidersQuery,
  useApproveProviderMutation,
  useRejectProviderMutation,
  useToggleVerificationMutation,
  useBlockProviderMutation,
  useUnblockProviderMutation,
} from '@/features/providers/providers.queries'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { format } from '@/lib/format'

export function ProvidersListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { search, searchValue, pagination, setPagination, setSearch, setFilter } =
    useUrlListState<ProvidersSearch>({ route: providersRoute })
  const statusFilter = search.status ?? ''

  const canApprove = usePermission(PERMISSIONS.providers.approve)
  const canReject = usePermission(PERMISSIONS.providers.reject)
  const canVerify = usePermission(PERMISSIONS.providers.verify)
  const canBlock = usePermission(PERMISSIONS.providers.block)
  const canUnblock = usePermission(PERMISSIONS.providers.unblock)

  const approveFlow = useConfirmTarget<ProviderSummary>()
  const rejectFlow = useConfirmTarget<ProviderSummary>()
  const verifyFlow = useConfirmTarget<ProviderSummary>()
  const blockFlow = useConfirmTarget<ProviderSummary>()
  const unblockFlow = useConfirmTarget<ProviderSummary>()

  const { data: response, isLoading } = useProvidersQuery({
    search: searchValue || undefined,
    status: search.status,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  })

  const hasActiveFilters = searchValue !== '' || statusFilter !== ''
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

  const columns = useProviderColumns()

  function targetName(target: ProviderSummary | null): string {
    if (!target) return ''
    return target.accountName || target.phoneNumber || ''
  }

  const approveMutation = useApproveProviderMutation()
  const rejectMutation = useRejectProviderMutation()
  const verifyMutation = useToggleVerificationMutation()
  const blockMutation = useBlockProviderMutation()
  const unblockMutation = useUnblockProviderMutation()

  const statusOptions = useMemo(
    () => [
      { value: 'pending', label: t('components:status.pending') },
      { value: 'approved', label: t('components:status.approved') },
      { value: 'rejected', label: t('components:status.rejected') },
      { value: 'blocked', label: t('providers:filters.status_blocked') },
    ],
    [t],
  )

  function getRowActions(row: ProviderSummary): RowActionItem<ProviderSummary>[] {
    const items: RowActionItem<ProviderSummary>[] = [
      {
        label: t('providers:actions.view'),
        icon: Eye,
        onClick: (r) =>
          navigate({ to: '/providers/$storeId', params: { storeId: r.id } }),
      },
    ]

    if (canApprove && row.accountStatus === 'pending') {
      items.push({
        label: t('providers:actions.approve'),
        icon: CheckCircle,
        onClick: (r) => approveFlow.ask(r),
        variant: 'success',
      })
    }

    if (canReject && row.accountStatus === 'pending') {
      items.push({
        label: t('providers:actions.reject'),
        icon: XCircle,
        onClick: (r) => rejectFlow.ask(r),
        variant: 'destructive',
      })
    }

    if (canVerify && row.accountStatus === 'approved') {
      items.push({
        label: t('providers:actions.toggle_badge'),
        icon: ShieldCheck,
        onClick: (r) => verifyFlow.ask(r),
      })
    }

    if (canBlock && row.accountStatus === 'approved') {
      items.push({
        label: t('providers:actions.block'),
        icon: Ban,
        onClick: (r) => blockFlow.ask(r),
        variant: 'destructive',
      })
    }

    if (canUnblock && row.accountStatus === 'blocked') {
      items.push({
        label: t('providers:actions.unblock'),
        icon: Unlock,
        onClick: (r) => unblockFlow.ask(r),
      })
    }

    return items
  }

  const toolbar = (
    <TableFiltersShell
      meta={
        meta != null
          ? t('providers:meta.total_stores', { count: format.number(meta.total) })
          : undefined
      }
    >
      <SearchInput
        value={searchValue}
        onChange={(v) => setSearch(v)}
        placeholder={t('providers:filters.search_placeholder')}
        className="w-full min-w-[min(100%,220px)] sm:w-72"
      />
      <FilterSelect
        value={statusFilter}
        onChange={(v) =>
          setFilter('status', (v as ProviderAccountStatus | '') || undefined)
        }
        options={statusOptions}
        placeholder={t('providers:filters.status')}
        className="min-w-[148px]"
      />
    </TableFiltersShell>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('providers:page_title')}
        description={t('providers:page_description')}
      />

      <DataTable
        columns={columns}
        data={rows}
        {...tableProps}
        emptyKeyPrefix="providers:empty"
        toolbar={toolbar}
        actions={getRowActions}
        rowLabel={(row) => row.accountName || row.phoneNumber}
        getRowId={(row) => row.id}
        onRowClick={(row) =>
          navigate({ to: '/providers/$storeId', params: { storeId: row.id } })
        }
      />

      <TargetedConfirmDialog
        flow={approveFlow}
        i18nPrefix="providers:approve_dialog"
        getName={(r) => targetName(r)}
        onConfirm={(target) =>
          approveMutation.mutate(target.id, { onSettled: approveFlow.close })
        }
        isLoading={approveMutation.isPending}
      />

      <TargetedReasonDialog
        flow={rejectFlow}
        i18nPrefix="providers:reject_dialog"
        getName={(r) => targetName(r)}
        onConfirm={(target, reason) =>
          rejectMutation.mutate(
            { storeId: target.id, reason },
            { onSettled: rejectFlow.close },
          )
        }
        isLoading={rejectMutation.isPending}
      />

      <TargetedConfirmDialog
        flow={verifyFlow}
        i18nPrefix="providers:verify_dialog.list"
        getName={(r) => targetName(r)}
        onConfirm={(target) =>
          verifyMutation.mutate(target.id, { onSettled: verifyFlow.close })
        }
        isLoading={verifyMutation.isPending}
      />

      <TargetedConfirmDialog
        flow={blockFlow}
        i18nPrefix="providers:block_dialog"
        getName={(r) => targetName(r)}
        confirmLabel={t('providers:actions.block')}
        onConfirm={(target) =>
          blockMutation.mutate(target.id, { onSettled: blockFlow.close })
        }
        isLoading={blockMutation.isPending}
        variant="destructive"
      />

      <TargetedConfirmDialog
        flow={unblockFlow}
        i18nPrefix="providers:unblock_dialog"
        getName={(r) => targetName(r)}
        confirmLabel={t('providers:actions.unblock')}
        onConfirm={(target) =>
          unblockMutation.mutate(target.id, { onSettled: unblockFlow.close })
        }
        isLoading={unblockMutation.isPending}
      />
    </div>
  )
}
