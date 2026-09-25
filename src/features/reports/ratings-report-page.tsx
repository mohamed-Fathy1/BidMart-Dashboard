import { getRouteApi } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataTable } from '@/components/data-table/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { SearchInput } from '@/components/shared/search-input'
import { FilterSelect } from '@/components/shared/filter-select'
import { TableFiltersShell } from '@/components/shared/table-filters-shell'
import { ResolvedRangeLabel } from '@/components/shared/resolved-range-label'
import { ReportDateRangeFilter } from '@/components/shared/report-date-range-filter'
import { useUrlListState } from '@/lib/use-url-list-state'
import { useListPageData } from '@/lib/use-list-page-data'
import { rangeParamsFor, rangeValidationError } from '@/lib/report-range'
import { localizedName } from '@/lib/localized-name'
import { useRatingsReviewsQuery, useRatingsSellersQuery } from '@/features/reports/reports.queries'
import { useCategoriesQuery } from '@/features/categories/categories.queries'
import { useRatingsReviewsColumns } from '@/features/reports/ratings-reviews.columns'
import { useRatingsSellersColumns } from '@/features/reports/ratings-sellers.columns'
import { RatingsSummary } from '@/features/reports/ratings-summary'
import type { RatingsReviewsParams, RatingsSellersParams } from '@/features/reports/reports.api'
import { RATINGS_TABS } from '@/features/reports/report-options'
import { readEnum } from '@/lib/list-search'
import type { RatingsReportSearch } from '@/routes/_authed.reports.ratings'

const ratingsRoute = getRouteApi('/_authed/reports/ratings')

export function RatingsReportPage() {
  const { t, i18n } = useTranslation()
  const navigate = ratingsRoute.useNavigate()

  const { search, pagination, setPagination, setFilter, setFilters } =
    useUrlListState<RatingsReportSearch>({
      route: ratingsRoute,
      defaultLimit: 20,
    })

  const rangeError = rangeValidationError(search.startDate, search.endDate)
  const range = rangeParamsFor(search.startDate, search.endDate)

  const reviewsParams: RatingsReviewsParams = {
    ...range,
    sellerName: search.sellerName,
    rating: search.rating,
    categoryId: search.categoryId,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  }

  const sellersParams: RatingsSellersParams = {
    ...range,
    sellerName: search.sellerName,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  }

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
    tableProps: reviewsTableProps,
  } = useListPageData({
    response: reviewsResponse,
    isLoading: isLoadingReviews,
    pagination,
    setPagination,
    hasActiveFilters: !!(search.sellerName || search.rating || search.categoryId || search.startDate || search.endDate),
    clearFilters: () =>
      setFilters({
        sellerName: undefined,
        rating: undefined,
        categoryId: undefined,
        startDate: undefined,
        endDate: undefined,
      }),
  })

  const {
    rows: sellerRows,
    tableProps: sellersTableProps,
  } = useListPageData({
    response: sellersResponse,
    isLoading: isLoadingSellers,
    pagination,
    setPagination,
    hasActiveFilters: !!(search.sellerName || search.startDate || search.endDate),
    clearFilters: () =>
      setFilters({ sellerName: undefined, startDate: undefined, endDate: undefined }),
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
          <ResolvedRangeLabel
            range={activeMeta?.dateRange}
            fallback={t('reports:ratings.description')}
          />
        }
      />

      <Tabs
        value={search.tab}
        onValueChange={(tab) =>
          setFilters({
            tab: readEnum(tab, RATINGS_TABS),
            rating: undefined,
            categoryId: undefined,
          })
        }
        className="gap-6"
      >
        <TabsList variant="line">
          <TabsTrigger value="reviews">{t('reports:ratings.tabs.reviews')}</TabsTrigger>
          <TabsTrigger value="sellers">{t('reports:ratings.tabs.sellers')}</TabsTrigger>
        </TabsList>

        <TableFiltersShell
          meta={
            activeMeta
              ? t(`reports:ratings.meta_${search.tab}`, { count: activeMeta.total })
              : undefined
          }
        >
          <SearchInput
            value={search.sellerName ?? ''}
            onChange={(v) => setFilter('sellerName', v || undefined)}
            placeholder={t('reports:ratings.filters.seller')}
            className="w-full min-w-[min(100%,220px)] sm:w-80"
          />
          {search.tab === 'reviews' && (
            <>
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
            </>
          )}
          <ReportDateRangeFilter
            from={search.startDate}
            to={search.endDate}
            onChange={(next) => setFilters({ startDate: next.from, endDate: next.to })}
          />
        </TableFiltersShell>

        <TabsContent value="reviews" className="space-y-6">
          {reviewsResponse?.meta.summary && <RatingsSummary summary={reviewsResponse.meta.summary} />}

          <DataTable
            columns={reviewsColumns}
            data={reviewRows}
            {...reviewsTableProps}
            pageSizeOptions={[20, 50, 100]}
            getRowId={(row) => row.ratingId}
            emptyKeyPrefix="reports:ratings.empty_reviews"
          />
        </TabsContent>

        <TabsContent value="sellers">
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
