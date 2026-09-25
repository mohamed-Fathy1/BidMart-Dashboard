import { useTranslation } from 'react-i18next'
import { getRouteApi } from '@tanstack/react-router'
import type { OrdersReportParams } from '@/features/reports/reports.api'
import { useOrdersReportQuery } from '@/features/reports/reports.queries'
import { OrdersGroupTiles } from '@/features/reports/orders-group-tiles'
import { useOrdersReportColumns } from '@/features/reports/orders-report.columns'
import { OrderDetailSheet } from '@/features/reports/order-detail-sheet'
import { DataTable } from '@/components/data-table/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { ResolvedRangeLabel } from '@/components/shared/resolved-range-label'
import { ReportDateRangeFilter } from '@/components/shared/report-date-range-filter'
import { TableFiltersShell } from '@/components/shared/table-filters-shell'
import { useListPageData } from '@/lib/use-list-page-data'
import { useUrlListState } from '@/lib/use-url-list-state'
import { rangeParamsFor, rangeValidationError } from '@/lib/report-range'
import type { OrdersReportSearch } from '@/routes/_authed.reports.orders'

const ordersReportRoute = getRouteApi('/_authed/reports/orders')

function compact<T extends Record<string, unknown>>(obj: T): T {
  const result = {} as T
  for (const key in obj) {
    if (obj[key] !== undefined) {
      result[key] = obj[key]
    }
  }
  return result
}

export function OrdersReportPage() {
  const { t } = useTranslation()

  const { search, pagination, setPagination, setFilter, setFilters, setParam } =
    useUrlListState<OrdersReportSearch>({
      route: ordersReportRoute,
      defaultLimit: 20,
    })

  const rangeError = rangeValidationError(search.startDate, search.endDate)
  const range = rangeParamsFor(search.startDate, search.endDate)

  const queryParams: OrdersReportParams = compact({
    ...range,
    group: search.group,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  })

  const { data: response, isLoading } = useOrdersReportQuery(queryParams, {
    enabled: !rangeError,
  })

  const hasActiveFilters = search.group !== undefined || search.startDate !== undefined

  const { rows, meta, tableProps } = useListPageData({
    response,
    isLoading,
    pagination,
    setPagination,
    hasActiveFilters,
    clearFilters: () =>
      setFilters({ group: undefined, startDate: undefined, endDate: undefined }),
  })

  const columns = useOrdersReportColumns()

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('reports:orders.title')}
        description={
          <ResolvedRangeLabel
            range={response?.meta?.dateRange}
            fallback={t('reports:orders.description')}
          />
        }
      />

      <TableFiltersShell
        meta={t('reports:orders.meta', { count: meta?.total ?? 0 })}
      >
        <ReportDateRangeFilter
          from={search.startDate}
          to={search.endDate}
          onChange={(next) => setFilters({ startDate: next.from, endDate: next.to })}
        />
      </TableFiltersShell>

      <OrdersGroupTiles
        summary={response?.meta?.summary}
        isLoading={isLoading}
        activeGroup={search.group}
        onGroupChange={(g) => setFilter('group', g)}
      />

      <DataTable
        columns={columns}
        data={rows}
        {...tableProps}
        pageSizeOptions={[20, 50, 100]}
        getRowId={(row) => row.orderId}
        rowLabel={(row) => row.orderNumber}
        onRowClick={(row) => setParam('order', row.orderId)}
        emptyKeyPrefix="reports:orders.empty"
      />

      <OrderDetailSheet
        orderId={search.order}
        onClose={() => setParam('order', undefined)}
      />
    </div>
  )
}
