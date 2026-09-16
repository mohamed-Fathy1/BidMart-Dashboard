import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { createResourceKeys } from '@/lib/query-keys'
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

/*
 * Report lists keep TanStack defaults (stale immediately, refetch on focus),
 * which is what the livestreams contract asks for when the window includes
 * today. `keepPreviousData` holds the rows while a filter change loads.
 */

export const financialReportKeys = createResourceKeys<ListFinancialReportParams>('financial-report')
export const orderDrilldownKeys = createResourceKeys('order-drilldown')
export const ratingsReviewsKeys = createResourceKeys<RatingsReviewsParams>('ratings-reviews')
export const ratingsSellersKeys = createResourceKeys<RatingsSellersParams>('ratings-sellers')
export const ordersReportKeys = createResourceKeys<OrdersReportParams>('orders-report')
export const livestreamsReportKeys = createResourceKeys<LivestreamsReportParams>('livestreams-report')

interface ReportQueryOptions {
  /** Pass `false` while the range is invalid so no request is sent. */
  enabled?: boolean
}

export function useFinancialReportQuery(
  params: ListFinancialReportParams,
  options: ReportQueryOptions = {},
) {
  return useQuery({
    queryKey: financialReportKeys.list(params),
    queryFn: () => listFinancialReport(params),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  })
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

export function useRatingsReviewsQuery(
  params: RatingsReviewsParams,
  options: ReportQueryOptions = {},
) {
  return useQuery({
    queryKey: ratingsReviewsKeys.list(params),
    queryFn: () => listRatingsReviews(params),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  })
}

export function useRatingsSellersQuery(
  params: RatingsSellersParams,
  options: ReportQueryOptions = {},
) {
  return useQuery({
    queryKey: ratingsSellersKeys.list(params),
    queryFn: () => listRatingsSellers(params),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  })
}

export function useOrdersReportQuery(params: OrdersReportParams, options: ReportQueryOptions = {}) {
  return useQuery({
    queryKey: ordersReportKeys.list(params),
    queryFn: () => listOrdersReport(params),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  })
}

export function useLivestreamsReportQuery(
  params: LivestreamsReportParams,
  options: ReportQueryOptions = {},
) {
  return useQuery({
    queryKey: livestreamsReportKeys.list(params),
    queryFn: () => listLivestreamsReport(params),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  })
}
