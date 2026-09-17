import { getRouteApi } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import type { LivestreamReportRow, LivestreamSortBy } from '@/types/api'
import type { LivestreamsReportParams } from '@/features/reports/reports.api'
import { useUrlListState } from '@/lib/use-url-list-state'
import { useListPageData } from '@/lib/use-list-page-data'
import { rangeParamsFor, rangeValidationError } from '@/lib/report-range'
import { resolvedRangeLabel } from '@/lib/report-period'
import { PageHeader } from '@/components/shared/page-header'
import { TableFiltersShell } from '@/components/shared/table-filters-shell'
import { ReportDateRangeFilter } from '@/components/shared/report-date-range-filter'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable } from '@/components/data-table/data-table'
import { useLivestreamsReportQuery } from '@/features/reports/reports.queries'
import { useLivestreamsReportColumns } from '@/features/reports/livestreams-report.columns'
import { LivestreamsSummary } from '@/features/reports/livestreams-summary'
import { LIVESTREAM_SORT_OPTIONS } from '@/routes/_authed.reports.livestreams'
import type { LivestreamsReportSearch } from '@/routes/_authed.reports.livestreams'

const livestreamsRoute = getRouteApi('/_authed/reports/livestreams')

function compact<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined)) as Partial<T>
}

export function LivestreamsReportPage() {
  const { t } = useTranslation()
  const navigate = livestreamsRoute.useNavigate()

  const {
    search,
    pagination,
    setPagination,
    setFilter,
  } = useUrlListState<LivestreamsReportSearch>({
    route: livestreamsRoute,
    defaultLimit: 20,
  })

  const rangeError = rangeValidationError(search.startDate, search.endDate)
  const range = rangeParamsFor(search.startDate, search.endDate)

  const queryParams: LivestreamsReportParams = compact({
    ...range,
    sortBy: search.sortBy,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  })

  const { data: response, isLoading } = useLivestreamsReportQuery(queryParams, {
    enabled: !rangeError,
  })

  const { rows, meta, tableProps } = useListPageData<LivestreamReportRow>({
    response,
    isLoading,
    pagination,
    setPagination,
    hasActiveFilters: !!search.startDate,
    clearFilters: () => {
      setFilter('startDate', undefined)
      setFilter('endDate', undefined)
    },
  })

  const columns = useLivestreamsReportColumns()

  const description = response?.meta.dateRange ? (
    <span className="font-medium text-foreground">
      {t('reports:range.showing', { range: resolvedRangeLabel(response.meta.dateRange) })}
    </span>
  ) : (
    t('reports:livestreams.description')
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('reports:livestreams.title')}
        description={description}
      />

      <TableFiltersShell
        meta={t('reports:livestreams.meta', { count: meta?.total ?? 0 })}
      >
        <ReportDateRangeFilter
          from={search.startDate}
          to={search.endDate}
          onChange={({ from, to }) => {
            void navigate({
              search: (prev: LivestreamsReportSearch) => ({
                ...prev,
                startDate: from,
                endDate: to,
                page: undefined,
              }),
            })
          }}
          error={rangeError ? t(`components:date_range.errors.${rangeError}`) : undefined}
        />

        <Select
          value={search.sortBy ?? 'DATE'}
          onValueChange={(value) =>
            setFilter('sortBy', value === 'DATE' ? undefined : (value as LivestreamSortBy))
          }
        >
          <SelectTrigger
            size="sm"
            aria-label={t('reports:livestreams.sort.label')}
            className="min-w-[160px]"
          >
            <span className="text-muted-foreground">{t('reports:livestreams.sort.label')}</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LIVESTREAM_SORT_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {t(`reports:livestreams.sort.${option}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableFiltersShell>

      <LivestreamsSummary summary={response?.meta.summary} />

      <DataTable
        columns={columns}
        data={rows}
        {...tableProps}
        pageSizeOptions={[20, 50, 100]}
        getRowId={(row) => row.showId}
        emptyKeyPrefix="reports:livestreams.empty"
      />
    </div>
  )
}
