import { getRouteApi } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import type { LivestreamReportRow } from '@/types/api'
import type { LivestreamsReportParams } from '@/features/reports/reports.api'
import { useUrlListState } from '@/lib/use-url-list-state'
import { useListPageData } from '@/lib/use-list-page-data'
import { rangeParamsFor, rangeValidationError } from '@/lib/report-range'
import { PageHeader } from '@/components/shared/page-header'
import { TableFiltersShell } from '@/components/shared/table-filters-shell'
import { ResolvedRangeLabel } from '@/components/shared/resolved-range-label'
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
import { LIVESTREAM_SORT_OPTIONS } from '@/features/reports/report-options'
import { readEnum } from '@/lib/list-search'
import type { LivestreamsReportSearch } from '@/routes/_authed.reports.livestreams'

const livestreamsRoute = getRouteApi('/_authed/reports/livestreams')

export function LivestreamsReportPage() {
  const { t } = useTranslation()

  const {
    search,
    pagination,
    setPagination,
    setFilter,
    setFilters,
  } = useUrlListState<LivestreamsReportSearch>({
    route: livestreamsRoute,
    defaultLimit: 20,
  })

  const rangeError = rangeValidationError(search.startDate, search.endDate)
  const range = rangeParamsFor(search.startDate, search.endDate)

  const queryParams: LivestreamsReportParams = {
    ...range,
    sortBy: search.sortBy,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  }

  const { data: response, isLoading } = useLivestreamsReportQuery(queryParams, {
    enabled: !rangeError,
  })

  const { rows, meta, tableProps } = useListPageData<LivestreamReportRow>({
    response,
    isLoading,
    pagination,
    setPagination,
    hasActiveFilters: !!search.startDate,
    clearFilters: () => setFilters({ startDate: undefined, endDate: undefined }),
  })

  const columns = useLivestreamsReportColumns()

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('reports:livestreams.title')}
        description={
          <ResolvedRangeLabel
            range={response?.meta.dateRange}
            fallback={t('reports:livestreams.description')}
          />
        }
      />

      <TableFiltersShell
        meta={t('reports:livestreams.meta', { count: meta?.total ?? 0 })}
      >
        <ReportDateRangeFilter
          from={search.startDate}
          to={search.endDate}
          onChange={(next) => setFilters({ startDate: next.from, endDate: next.to })}
        />

        <Select
          value={search.sortBy ?? 'DATE'}
          onValueChange={(value) =>
            setFilter('sortBy', value === 'DATE' ? undefined : readEnum(value, LIVESTREAM_SORT_OPTIONS))
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

      <LivestreamsSummary summary={response?.meta.summary} isLoading={isLoading} />

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
