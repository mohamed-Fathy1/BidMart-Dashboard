import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Eye } from 'lucide-react'
import type {
  SupportTicketListItem,
  SupportTicketMessageType,
  SupportTicketStatus,
} from '@/types/api'
import { useUrlListState } from '@/lib/use-url-list-state'
import { useListPageData } from '@/lib/use-list-page-data'
import { PageHeader } from '@/components/shared/page-header'
import { SearchInput } from '@/components/shared/search-input'
import { FilterSelect } from '@/components/shared/filter-select'
import { TableFiltersShell } from '@/components/shared/table-filters-shell'
import { DateRangeField } from '@/components/shared/date-range-field'
import {
  DataTable,
  type RowActionItem,
} from '@/components/data-table/data-table'
import { useSupportTicketColumns } from '@/features/support-tickets/support-tickets.columns'
import { useSupportTicketsQuery } from '@/features/support-tickets/support-tickets.queries'
import type { SupportTicketsSearch } from '@/routes/_authed.support-tickets'

const supportTicketsRoute = getRouteApi('/_authed/support-tickets')

const STATUS_OPTIONS: SupportTicketStatus[] = ['NEW', 'CONTACTED', 'UNDER_REVIEW']
const TYPE_OPTIONS: SupportTicketMessageType[] = [
  'COMPLAINT',
  'SUGGESTION',
  'INQUIRY',
  'ADVERTISEMENT',
  'OTHER',
]

export function SupportTicketsListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const {
    search,
    searchValue,
    pagination,
    setPagination,
    setSearch,
    setFilter,
  } = useUrlListState<SupportTicketsSearch>({
    route: supportTicketsRoute,
    defaultLimit: 10,
  })

  const statusFilter = search.status ?? ''
  const typeFilter = search.message_type ?? ''
  const dateFrom = search.date_from ?? ''
  const dateTo = search.date_to ?? ''

  const { data: response, isLoading } = useSupportTicketsQuery({
    search: searchValue || undefined,
    status: search.status,
    message_type: search.message_type,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  })

  const hasActiveFilters =
    searchValue !== '' ||
    statusFilter !== '' ||
    typeFilter !== '' ||
    dateFrom !== '' ||
    dateTo !== ''

  const { rows, meta, tableProps } = useListPageData({
    response,
    isLoading,
    pagination,
    setPagination,
    hasActiveFilters,
    clearFilters: () => {
      setSearch('')
      setFilter('status', undefined)
      setFilter('message_type', undefined)
      setFilter('date_from', undefined)
      setFilter('date_to', undefined)
    },
  })

  const columns = useSupportTicketColumns()

  const statusOptions = STATUS_OPTIONS.map((status) => ({
    value: status,
    label: t(`supportTickets:status.${status}`),
  }))

  const typeOptions = TYPE_OPTIONS.map((type) => ({
    value: type,
    label: t(`supportTickets:message_type.${type}`),
  }))

  function getRowActions(): RowActionItem<SupportTicketListItem>[] {
    return [
      {
        label: t('supportTickets:actions.view'),
        icon: Eye,
        onClick: (r) =>
          navigate({ to: '/support-tickets/$ticketId', params: { ticketId: r.id } }),
      },
    ]
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('supportTickets:title')}
        description={t('supportTickets:description')}
      />

      <TableFiltersShell
        meta={
          meta != null
            ? t('supportTickets:filters.results_count', { count: meta.total })
            : undefined
        }
      >
        <SearchInput
          value={searchValue}
          onChange={setSearch}
          placeholder={t('supportTickets:filters.search_placeholder')}
          className="w-full min-w-[min(100%,220px)] sm:w-80"
        />
        <FilterSelect
          value={statusFilter}
          onChange={(v) => setFilter('status', (v || undefined) as SupportTicketStatus | undefined)}
          options={statusOptions}
          placeholder={t('supportTickets:filters.status_placeholder')}
          className="min-w-[160px]"
        />
        <FilterSelect
          value={typeFilter}
          onChange={(v) =>
            setFilter('message_type', (v || undefined) as SupportTicketMessageType | undefined)
          }
          options={typeOptions}
          placeholder={t('supportTickets:filters.type_placeholder')}
          className="min-w-[160px]"
        />
        <DateRangeField
          from={dateFrom}
          to={dateTo}
          onFromChange={(v) => setFilter('date_from', v || undefined)}
          onToChange={(v) => setFilter('date_to', v || undefined)}
          fromLabel={t('supportTickets:filters.date_from_label')}
          toLabel={t('supportTickets:filters.date_to_label')}
        />
      </TableFiltersShell>

      <DataTable
        columns={columns}
        data={rows}
        {...tableProps}
        emptyKeyPrefix="supportTickets:empty"
        actions={getRowActions}
        rowLabel={(row) => row.user_name}
        getRowId={(row) => row.id}
        onRowClick={(row) =>
          navigate({ to: '/support-tickets/$ticketId', params: { ticketId: row.id } })
        }
      />
    </div>
  )
}
