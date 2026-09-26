import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { createResourceKeys, type ResourceKeys } from '@/lib/query-keys'
import {
  getOrderDrilldown,
  listFinancialReport,
  listLivestreamsReport,
  listOrdersReport,
  listRatingsReviews,
  listRatingsSellers,
  type ListFinancialReportParams,
  type LivestreamsReportParams,
  type OrdersReportParams,
  type RatingsReviewsParams,
  type RatingsSellersParams,
} from '@/features/reports/reports.api'

const financialReportKeys = createResourceKeys<ListFinancialReportParams>('financial-report')
const orderDrilldownKeys = createResourceKeys('order-drilldown')
const ratingsReviewsKeys = createResourceKeys<RatingsReviewsParams>('ratings-reviews')
const ratingsSellersKeys = createResourceKeys<RatingsSellersParams>('ratings-sellers')
const ordersReportKeys = createResourceKeys<OrdersReportParams>('orders-report')
const livestreamsReportKeys = createResourceKeys<LivestreamsReportParams>('livestreams-report')

/*
 * Report lists keep TanStack defaults (stale immediately, refetch on focus),
 * which is what the livestreams contract asks for when the window includes
 * today. `keepPreviousData` holds the rows while a filter change loads.
 * Pages pass `enabled: false` while the range is invalid so no request is sent,
 * and ignore `data` when `isError`: a failed refetch keeps the last good
 * response, which must not read as the current report.
 */
function useReportListQuery<TParams, TData>(
  keys: ResourceKeys<TParams>,
  fetchList: (params: TParams) => Promise<TData>,
  params: TParams,
  enabled: boolean,
) {
  return useQuery({
    queryKey: keys.list(params),
    queryFn: () => fetchList(params),
    placeholderData: keepPreviousData,
    enabled,
  })
}

export function useFinancialReportQuery(params: ListFinancialReportParams, enabled: boolean) {
  return useReportListQuery(financialReportKeys, listFinancialReport, params, enabled)
}

export function useRatingsReviewsQuery(params: RatingsReviewsParams, enabled: boolean) {
  return useReportListQuery(ratingsReviewsKeys, listRatingsReviews, params, enabled)
}

export function useRatingsSellersQuery(params: RatingsSellersParams, enabled: boolean) {
  return useReportListQuery(ratingsSellersKeys, listRatingsSellers, params, enabled)
}

export function useOrdersReportQuery(params: OrdersReportParams, enabled: boolean) {
  return useReportListQuery(ordersReportKeys, listOrdersReport, params, enabled)
}

export function useLivestreamsReportQuery(params: LivestreamsReportParams, enabled: boolean) {
  return useReportListQuery(livestreamsReportKeys, listLivestreamsReport, params, enabled)
}

/** Live detail: never served from cache, fetched whenever a sheet opens. */
export function useOrderDrilldownQuery(orderId: string | undefined) {
  return useQuery({
    queryKey: orderDrilldownKeys.detail(orderId ?? ''),
    queryFn: () => getOrderDrilldown(orderId!),
    enabled: !!orderId,
    staleTime: 0,
    gcTime: 0,
  })
}
