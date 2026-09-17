import { getRouteApi } from '@tanstack/react-router'
import { Trans, useTranslation } from 'react-i18next'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataTable } from '@/components/data-table/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { SearchInput } from '@/components/shared/search-input'
import { FilterSelect } from '@/components/shared/filter-select'
import { TableFiltersShell } from '@/components/shared/table-filters-shell'
import { ReportDateRangeFilter } from '@/components/shared/report-date-range-filter'
import { useUrlListState } from '@/lib/use-url-list-state'
import { useListPageData } from '@/lib/use-list-page-data'
import { rangeParamsFor, rangeValidationError } from '@/lib/report-range'
import { resolvedRangeLabel } from '@/lib/report-period'
import { localizedName } from '@/lib/localized-name'
import { useRatingsReviewsQuery, useRatingsSellersQuery } from '@/features/reports/reports.queries'
import { useCategoriesQuery } from '@/features/categories/categories.queries'
import { useRatingsReviewsColumns } from '@/features/reports/ratings-reviews.columns'
import { useRatingsSellersColumns } from '@/features/reports/ratings-sellers.columns'
import { RatingsSummary } from '@/features/reports/ratings-summary'
import type { RatingsReportSearch, RatingsTab } from '@/routes/_authed.reports.ratings'

const ratingsRoute = getRouteApi('/_authed/reports/ratings')

function compact(params: Record<string, string | number | undefined>): Record<string, string | number> {
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined)) as Record<
    string,
    string | number
  >
}

export function RatingsReportPage() {
  const { t, i18n } = useTranslation()
  const navigate = ratingsRoute.useNavigate()

  const { search, pagination, setPagination, setFilter } = useUrlListState<RatingsReportSearch>({
    route: ratingsRoute,
    defaultLimit: 20,
  })

  const rangeError = rangeValidationError(search.startDate, search.endDate)
  const range = rangeParamsFor(search.startDate, search.endDate)

  const reviewsParams = compact({
    ...range,
    sellerName: search.sellerName,
    rating: search.rating,
    categoryId: search.categoryId,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  })

  const sellersParams = compact({
    ...range,
    sellerName: search.sellerName,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  })

  const {
    data: reviewsResponse,
    isLoading: isLoadingReviews,
  } = useRatingsReviewsQuery(reviewsParams, { enabled: search.tab === 'reviews' && !rangeError })

  const {
    data: sellersResponse,
    isLoading: isLoadingSellers,
  } = useRatingsSellersQuery(sellersParams, { enabled: search.tab === 'sellers' && !rangeError })

  const { data: categoriesResponse } = useCategoriesQuery({ limit: 100 })

  const activeResponse = search.tab === 'reviews' ? reviewsResponse : sellersResponse
  const activeMeta = activeResponse?.meta

  const {
    rows: reviewRows,
    meta: reviewsMeta,
    tableProps: reviewsTableProps,
  } = useListPageData({
    response: reviewsResponse,
    isLoading: isLoadingReviews,
    pagination,
    setPagination,
    hasActiveFilters: !!(search.sellerName || search.rating || search.categoryId || search.startDate || search.endDate),
    clearFilters: () => {
      setFilter('sellerName', undefined)
      setFilter('rating', undefined)
      setFilter('categoryId', undefined)
      setFilter('startDate', undefined)
      setFilter('endDate', undefined)
    },
  })

  const {
    rows: sellerRows,
    meta: sellersMeta,
    tableProps: sellersTableProps,
  } = useListPageData({
    response: sellersResponse,
    isLoading: isLoadingSellers,
    pagination,
    setPagination,
    hasActiveFilters: !!(search.sellerName || search.startDate || search.endDate),
    clearFilters: () => {
      setFilter('sellerName', undefined)
      setFilter('startDate', undefined)
      setFilter('endDate', undefined)
    },
  })

  const reviewsColumns = useRatingsReviewsColumns()
  const sellersColumns = useRatingsSellersColumns()

  const ratingOptions = [1, 2, 3, 4, 5].map((value) => ({
    value: String(value),
    label: t('reports:ratings.filters.stars', { count: value }),
  }))

  const categoryOptions =
    categoriesResponse?.data.map((category) => ({
      value: category.id,
      label: localizedName(category, i18n),
    })) ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('reports:ratings.title')}
        description={
          activeMeta?.dateRange ? (
            <Trans
              i18nKey="reports:range.showing"
              values={{ range: resolvedRangeLabel(activeMeta.dateRange) }}
              components={{ range: <span className="font-medium text-foreground" /> }}
            />
          ) : (
            t('reports:ratings.description')
          )
        }
      />

      <Tabs
        value={search.tab}
        onValueChange={(tab) =>
          navigate({
            search: (prev) => ({
              ...prev,
              tab: tab as RatingsTab,
              rating: undefined,
              categoryId: undefined,
              page: undefined,
            }),
          })
        }
      >
        <TabsList variant="line">
          <TabsTrigger value="reviews">{t('reports:ratings.tabs.reviews')}</TabsTrigger>
          <TabsTrigger value="sellers">{t('reports:ratings.tabs.sellers')}</TabsTrigger>
        </TabsList>
      </Tabs>

      {search.tab === 'reviews' ? (
        <div className="space-y-6">
          <TableFiltersShell
            meta={
              reviewsMeta != null
                ? t('reports:ratings.meta_reviews', { count: reviewsMeta.total })
                : undefined
            }
          >
            <SearchInput
              value={search.sellerName ?? ''}
              onChange={(v) => setFilter('sellerName', v || undefined)}
              placeholder={t('reports:ratings.filters.seller')}
              className="w-full min-w-[min(100%,220px)] sm:w-80"
            />
            <FilterSelect
              value={search.rating ? String(search.rating) : ''}
              onChange={(v) => setFilter('rating', v ? Number(v) : undefined)}
              options={ratingOptions}
              placeholder={t('reports:ratings.filters.rating')}
              className="min-w-[140px]"
            />
            <FilterSelect
              value={search.categoryId ?? ''}
              onChange={(v) => setFilter('categoryId', v || undefined)}
              options={categoryOptions}
              placeholder={t('reports:ratings.filters.category')}
              className="min-w-[160px]"
            />
            <ReportDateRangeFilter
              from={search.startDate}
              to={search.endDate}
              onChange={(next) =>
                navigate({
                  search: (prev) => ({
                    ...prev,
                    startDate: next.from,
                    endDate: next.to,
                    page: undefined,
                  }),
                })
              }
              error={rangeError ? t(`components:date_range.errors.${rangeError}`) : undefined}
            />
          </TableFiltersShell>

          {reviewsResponse?.meta.summary && <RatingsSummary summary={reviewsResponse.meta.summary} />}

          <DataTable
            columns={reviewsColumns}
            data={reviewRows}
            {...reviewsTableProps}
            pageSizeOptions={[20, 50, 100]}
            getRowId={(row) => row.ratingId}
            emptyKeyPrefix="reports:ratings.empty_reviews"
          />
        </div>
      ) : (
        <div className="space-y-6">
          <TableFiltersShell
            meta={
              sellersMeta != null
                ? t('reports:ratings.meta_sellers', { count: sellersMeta.total })
                : undefined
            }
          >
            <SearchInput
              value={search.sellerName ?? ''}
              onChange={(v) => setFilter('sellerName', v || undefined)}
              placeholder={t('reports:ratings.filters.seller')}
              className="w-full min-w-[min(100%,220px)] sm:w-80"
            />
            <ReportDateRangeFilter
              from={search.startDate}
              to={search.endDate}
              onChange={(next) =>
                navigate({
                  search: (prev) => ({
                    ...prev,
                    startDate: next.from,
                    endDate: next.to,
                    page: undefined,
                  }),
                })
              }
              error={rangeError ? t(`components:date_range.errors.${rangeError}`) : undefined}
            />
          </TableFiltersShell>

          <DataTable
            columns={sellersColumns}
            data={sellerRows}
            {...sellersTableProps}
            pageSizeOptions={[20, 50, 100]}
            getRowId={(row) => row.sellerId}
            rowLabel={(row) => row.sellerName}
            onRowClick={(row) => navigate({ to: '/users/$userId', params: { userId: row.sellerId } })}
            emptyKeyPrefix="reports:ratings.empty_sellers"
          />
        </div>
      )}
    </div>
  )
}
