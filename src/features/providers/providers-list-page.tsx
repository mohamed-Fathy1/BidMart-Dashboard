import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Eye, CheckCircle, XCircle, ShieldCheck, Ban, Unlock } from 'lucide-react'
import type { PaginationState } from '@tanstack/react-table'
import type { ProviderSummary, ProviderAccountStatus } from '@/types/api'
import { PageHeader } from '@/components/shared/page-header'
import { SearchInput } from '@/components/shared/search-input'
import { FilterSelect } from '@/components/shared/filter-select'
import { TableFiltersShell } from '@/components/shared/table-filters-shell'
import {
  DataTable,
  type RowActionItem,
} from '@/components/data-table/data-table'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { ReasonDialog } from '@/components/shared/reason-dialog'
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

  const canApprove = usePermission(PERMISSIONS.providers.approve)
  const canReject = usePermission(PERMISSIONS.providers.reject)
  const canVerify = usePermission(PERMISSIONS.providers.verify)
  const canBlock = usePermission(PERMISSIONS.providers.block)
  const canUnblock = usePermission(PERMISSIONS.providers.unblock)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })

  const [approveTarget, setApproveTarget] = useState<ProviderSummary | null>(null)
  const [rejectTarget, setRejectTarget] = useState<ProviderSummary | null>(null)
  const [verifyTarget, setVerifyTarget] = useState<ProviderSummary | null>(null)
  const [blockTarget, setBlockTarget] = useState<ProviderSummary | null>(null)
  const [unblockTarget, setUnblockTarget] = useState<ProviderSummary | null>(null)

  const { data: response, isLoading } = useProvidersQuery({
    search: search || undefined,
    status: statusFilter ? (statusFilter as ProviderAccountStatus) : undefined,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  })

  const data = response?.data ?? []
  const meta = response?.meta

  const columns = useProviderColumns()

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
        onClick: (r) => setApproveTarget(r),
      })
    }

    if (canReject && row.accountStatus === 'pending') {
      items.push({
        label: t('providers:actions.reject'),
        icon: XCircle,
        onClick: (r) => setRejectTarget(r),
        variant: 'destructive',
      })
    }

    if (canVerify && row.accountStatus === 'approved') {
      items.push({
        label: t('providers:actions.toggle_badge'),
        icon: ShieldCheck,
        onClick: (r) => setVerifyTarget(r),
      })
    }

    if (canBlock && row.accountStatus === 'approved') {
      items.push({
        label: t('providers:actions.block'),
        icon: Ban,
        onClick: (r) => setBlockTarget(r),
        variant: 'destructive',
      })
    }

    if (canUnblock && row.accountStatus === 'blocked') {
      items.push({
        label: t('providers:actions.unblock'),
        icon: Unlock,
        onClick: (r) => setUnblockTarget(r),
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
        value={search}
        onChange={(v) => {
          setSearch(v)
          setPagination((p) => ({ ...p, pageIndex: 0 }))
        }}
        placeholder={t('providers:filters.search_placeholder')}
        className="w-full min-w-[min(100%,220px)] sm:w-72"
      />
      <FilterSelect
        value={statusFilter}
        onChange={(v) => {
          setStatusFilter(v)
          setPagination((p) => ({ ...p, pageIndex: 0 }))
        }}
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
        data={data}
        pageCount={meta?.totalPages}
        totalRecords={meta?.total}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
        toolbar={toolbar}
        actions={getRowActions}
        getRowId={(row) => row.id}
        onRowClick={(row) =>
          navigate({ to: '/providers/$storeId', params: { storeId: row.id } })
        }
      />

      <ConfirmDialog
        open={!!approveTarget}
        onOpenChange={(open) => !open && setApproveTarget(null)}
        title={t('providers:approve_dialog.title')}
        description={t('providers:approve_dialog.description')}
        onConfirm={() => {
          if (!approveTarget) return
          approveMutation.mutate(approveTarget.id, {
            onSettled: () => setApproveTarget(null),
          })
        }}
        isLoading={approveMutation.isPending}
      />

      <ReasonDialog
        open={!!rejectTarget}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        title={t('providers:reject_dialog.title')}
        description={t('providers:reject_dialog.description')}
        onConfirm={(reason) => {
          if (!rejectTarget) return
          rejectMutation.mutate(
            { storeId: rejectTarget.id, reason },
            { onSettled: () => setRejectTarget(null) },
          )
        }}
        isLoading={rejectMutation.isPending}
        variant="destructive"
      />

      <ConfirmDialog
        open={!!verifyTarget}
        onOpenChange={(open) => !open && setVerifyTarget(null)}
        title={t('providers:verify_dialog.list_title')}
        description={t('providers:verify_dialog.list_description')}
        onConfirm={() => {
          if (!verifyTarget) return
          verifyMutation.mutate(verifyTarget.id, {
            onSettled: () => setVerifyTarget(null),
          })
        }}
        isLoading={verifyMutation.isPending}
      />

      <ConfirmDialog
        open={!!blockTarget}
        onOpenChange={(open) => !open && setBlockTarget(null)}
        title={t('providers:block_dialog.title')}
        description={t('providers:block_dialog.description')}
        confirmLabel={t('providers:actions.block')}
        onConfirm={() => {
          if (!blockTarget) return
          blockMutation.mutate(blockTarget.id, {
            onSettled: () => setBlockTarget(null),
          })
        }}
        isLoading={blockMutation.isPending}
        variant="destructive"
      />

      <ConfirmDialog
        open={!!unblockTarget}
        onOpenChange={(open) => !open && setUnblockTarget(null)}
        title={t('providers:unblock_dialog.title')}
        description={t('providers:unblock_dialog.description')}
        confirmLabel={t('providers:actions.unblock')}
        onConfirm={() => {
          if (!unblockTarget) return
          unblockMutation.mutate(unblockTarget.id, {
            onSettled: () => setUnblockTarget(null),
          })
        }}
        isLoading={unblockMutation.isPending}
      />
    </div>
  )
}
