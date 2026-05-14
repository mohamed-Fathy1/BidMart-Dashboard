import { useMemo } from 'react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Eye } from 'lucide-react'
import type { ComplaintStatus, ComplaintSummary } from '@/types/api'
import { useUrlListState } from '@/lib/use-url-list-state'
import { useListPageData } from '@/lib/use-list-page-data'
import type { ComplaintsSearch } from '@/routes/_authed.complaints'

const complaintsRoute = getRouteApi('/_authed/complaints')

import { PageHeader } from '@/components/shared/page-header'
import { SearchInput } from '@/components/shared/search-input'
import { FilterSelect } from '@/components/shared/filter-select'
import {
  DataTable,
  type RowActionItem,
} from '@/components/data-table/data-table'
import { useComplaintColumns } from '@/features/complaints/complaints.columns'
import {
  useComplaintStatusCounts,
  useComplaintTypesQuery,
  useComplaintsQuery,
} from '@/features/complaints/complaints.queries'
import { format } from '@/lib/format'
import { cn } from '@/lib/utils'

const STATUS_OPTIONS: ComplaintStatus[] = [
  'UNDER_REVIEW',
  'IN_PROGRESS',
  'RESOLVED',
  'REJECTED',
]

interface StatusChipDescriptor {
  value: '' | ComplaintStatus
  label: string
  count: number
  tint: { active: string; idle: string; dot: string }
}

const TINTS: Record<'' | ComplaintStatus, StatusChipDescriptor['tint']> = {
  '': {
    active: 'border-foreground/80 bg-foreground text-background',
    idle: 'border-border bg-card text-foreground hover:bg-muted',
    dot: 'bg-foreground/40',
  },
  UNDER_REVIEW: {
    active: 'border-amber-300 bg-amber-50 text-amber-900',
    idle: 'border-border bg-card text-foreground hover:bg-amber-50/40 hover:border-amber-200',
    dot: 'bg-amber-500',
  },
  IN_PROGRESS: {
    active: 'border-blue-300 bg-blue-50 text-blue-900',
    idle: 'border-border bg-card text-foreground hover:bg-blue-50/40 hover:border-blue-200',
    dot: 'bg-blue-500',
  },
  RESOLVED: {
    active: 'border-emerald-300 bg-emerald-50 text-emerald-900',
    idle: 'border-border bg-card text-foreground hover:bg-emerald-50/40 hover:border-emerald-200',
    dot: 'bg-emerald-500',
  },
  REJECTED: {
    active: 'border-red-300 bg-red-50 text-red-900',
    idle: 'border-border bg-card text-foreground hover:bg-red-50/40 hover:border-red-200',
    dot: 'bg-red-500',
  },
}

export function ComplaintsListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { search, searchValue, pagination, setPagination, setSearch, setFilter } =
    useUrlListState<ComplaintsSearch>({ route: complaintsRoute, defaultLimit: 20 })

  const statusFilter = search.status ?? ''
  const typeFilter = search.type_id ?? ''

  const { data: response, isLoading } = useComplaintsQuery({
    search: searchValue || undefined,
    status: search.status,
    type_id: search.type_id,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  })

  const { data: types } = useComplaintTypesQuery()
  const counts = useComplaintStatusCounts()

  const hasActiveFilters = searchValue !== '' || statusFilter !== '' || typeFilter !== ''
  const { rows, meta, tableProps } = useListPageData({
    response,
    isLoading,
    pagination,
    setPagination,
    hasActiveFilters,
    clearFilters: () => {
      setSearch('')
      setFilter('status', undefined)
      setFilter('type_id', undefined)
    },
  })

  const columns = useComplaintColumns()

  const chips: StatusChipDescriptor[] = useMemo(
    () => [
      {
        value: '',
        label: t('complaints:filters.all_statuses'),
        count: counts.total,
        tint: TINTS[''],
      },
      ...STATUS_OPTIONS.map((s) => ({
        value: s,
        label: t(`complaints:status.${s.toLowerCase()}`),
        count: counts[s],
        tint: TINTS[s],
      })),
    ],
    [t, counts],
  )

  const typeOptions = useMemo(
    () =>
      (types ?? []).map((type) => ({
        value: type.id,
        label: type.name,
      })),
    [types],
  )

  function getRowActions(_row: ComplaintSummary): RowActionItem<ComplaintSummary>[] {
    return [
      {
        label: t('complaints:actions.view'),
        icon: Eye,
        onClick: (r) =>
          navigate({ to: '/complaints/$complaintId', params: { complaintId: r.id } }),
      },
    ]
  }

  const statusChips = (
    <div className="flex flex-wrap items-center gap-1.5" role="toolbar" aria-label={t('complaints:filters.status_placeholder')}>
      {chips.map((chip) => {
        const active = statusFilter === chip.value
        const tone = active ? chip.tint.active : chip.tint.idle
        return (
          <button
            key={chip.value || 'all'}
            type="button"
            onClick={() =>
              setFilter('status', chip.value === '' ? undefined : chip.value)
            }
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-[color,background-color,border-color] duration-(--duration-hover) ease-(--ease-default)',
              tone,
              'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
            )}
            aria-pressed={active}
          >
            {chip.value !== '' && (
              <span aria-hidden className={cn('size-1.5 rounded-full', chip.tint.dot)} />
            )}
            <span>{chip.label}</span>
            <span
              className={cn(
                'inline-flex min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-medium tabular-nums',
                active
                  ? 'bg-background/20 text-current'
                  : 'bg-muted text-muted-foreground',
              )}
              aria-hidden
            >
              {counts.isLoading && chip.count === 0 ? '—' : format.number(chip.count)}
            </span>
            <span className="sr-only">{`(${chip.count})`}</span>
          </button>
        )
      })}
    </div>
  )

  const toolbar = (
    <div className="rounded-xl border border-border bg-card shadow-rest">
      <div className="border-b border-border px-3 py-2.5">
        {statusChips}
      </div>
      <div className="flex flex-col gap-3 px-3 py-2.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <SearchInput
            value={searchValue}
            onChange={(v) => setSearch(v)}
            placeholder={t('complaints:filters.search_placeholder')}
            className="w-full min-w-[min(100%,220px)] sm:w-80"
          />
          <FilterSelect
            value={typeFilter}
            onChange={(v) => setFilter('type_id', v || undefined)}
            options={typeOptions}
            placeholder={t('complaints:filters.type_placeholder')}
            className="min-w-[168px]"
          />
        </div>
        {meta != null && (
          <p
            className="text-sm text-muted-foreground lg:text-end"
            aria-live="polite"
          >
            {t('complaints:filters.results_count', { count: meta.total })}
          </p>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('complaints:title')}
        description={t('complaints:description')}
      />

      <DataTable
        columns={columns}
        data={rows}
        {...tableProps}
        emptyKeyPrefix="complaints:empty"
        toolbar={toolbar}
        actions={getRowActions}
        rowLabel={(row) => row.submitter.full_name ?? row.id}
        getRowId={(row) => row.id}
        onRowClick={(row) =>
          navigate({ to: '/complaints/$complaintId', params: { complaintId: row.id } })
        }
      />
    </div>
  )
}
