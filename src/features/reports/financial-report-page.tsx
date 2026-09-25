import { getRouteApi } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { DataTable } from '@/components/data-table/data-table'
import { FilterSelect } from '@/components/shared/filter-select'
import { PageHeader } from '@/components/shared/page-header'
import { ResolvedRangeLabel } from '@/components/shared/resolved-range-label'
import { ReportDateRangeFilter } from '@/components/shared/report-date-range-filter'
import { SearchInput } from '@/components/shared/search-input'
import { TableFiltersShell } from '@/components/shared/table-filters-shell'
import { FINANCIAL_REPORT_STATUSES } from '@/features/reports/financial-report-status'
import { FinancialReportExport } from '@/features/reports/financial-report-export'
import { FinancialReportTotals } from '@/features/reports/financial-report-totals'
import { useFinancialReportColumns } from '@/features/reports/financial-report.columns'
import { OrderDetailSheet } from '@/features/reports/order-detail-sheet'
import { useFinancialReportQuery } from '@/features/reports/reports.queries'
import type { FinancialReportFilters } from '@/features/reports/reports.api'
import { readEnum } from '@/lib/list-search'
import { useListPageData } from '@/lib/use-list-page-data'
import { useUrlListState } from '@/lib/use-url-list-state'
import { rangeParamsFor, rangeValidationError } from '@/lib/report-range'
import type { FinancialReportSearch } from '@/routes/_authed.reports.financial'

const financialRoute = getRouteApi('/_authed/reports/financial')

function compact<T extends Record<string, unknown>>(params: T): T {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined)) as T
}

export function FinancialReportPage() {
  const { t } = useTranslation()

  const { search, pagination, setPagination, setFilter, setFilters, setParam } =
    useUrlListState<FinancialReportSearch>({
      route: financialRoute,
      defaultLimit: 20,
    })

  const rangeError = rangeValidationError(search.startDate, search.endDate)

  const filters: FinancialReportFilters = compact({
    storeName: search.storeName,
    customerName: search.customerName,
    status: search.status,
    ...rangeParamsFor(search.startDate, search.endDate),
  })

  const { data: response, isLoading } = useFinancialReportQuery(
    compact({
      ...filters,
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
    }),
    { enabled: !rangeError },
  )

  const { rows, meta, tableProps } = useListPageData({
    response,
    isLoading,
    pagination,
    setPagination,
    hasActiveFilters: Boolean(
      search.storeName || search.customerName || search.status || search.startDate,
    ),
    clearFilters: () =>
      setFilters({
        storeName: undefined,
        customerName: undefined,
        status: undefined,
        startDate: undefined,
        endDate: undefined,
      }),
  })

  const columns = useFinancialReportColumns()
  const totals = response?.meta.totals

  const statusOptions = FINANCIAL_REPORT_STATUSES.map((status) => ({
    value: status,
    label: t(`reports:financial_bucket.${status}`),
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('reports:financial.title')}
        description={
          <ResolvedRangeLabel
            range={response?.meta.dateRange}
            fallback={t('reports:financial.description')}
          />
        }
        actions={<FinancialReportExport filters={filters} disabled={!!rangeError} />}
      />

      <TableFiltersShell meta={t('reports:financial.meta', { count: meta?.total ?? 0 })}>
        <SearchInput
          value={search.storeName ?? ''}
          onChange={(value) => setFilter('storeName', value || undefined)}
          placeholder={t('reports:financial.filters.store')}
          className="w-full min-w-[min(100%,220px)] sm:w-64"
        />
        <SearchInput
          value={search.customerName ?? ''}
          onChange={(value) => setFilter('customerName', value || undefined)}
          placeholder={t('reports:financial.filters.customer')}
          className="w-full min-w-[min(100%,220px)] sm:w-64"
        />
        <FilterSelect
          value={search.status ?? ''}
          onChange={(value) => setFilter('status', readEnum(value, FINANCIAL_REPORT_STATUSES))}
          options={statusOptions}
          placeholder={t('reports:financial.filters.status')}
          className="min-w-[160px]"
        />
        <ReportDateRangeFilter
          from={search.startDate}
          to={search.endDate}
          onChange={(next) => setFilters({ startDate: next.from, endDate: next.to })}
        />
      </TableFiltersShell>

      <DataTable
        columns={columns}
        data={rows}
        {...tableProps}
        pageSizeOptions={[20, 50, 100]}
        getRowId={(row) => row.orderId}
        rowLabel={(row) => row.orderNumber}
        onRowClick={(row) => setParam('order', row.orderId)}
        emptyKeyPrefix="reports:financial.empty"
        footer={totals ? <FinancialReportTotals totals={totals} /> : undefined}
      />

      <OrderDetailSheet orderId={search.order} onClose={() => setParam('order', undefined)} />
    </div>
  )
}
