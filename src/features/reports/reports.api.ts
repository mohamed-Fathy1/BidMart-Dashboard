import { api, fileApi } from '@/lib/axios'
import { parseContentDispositionFilename, reportExportFilename } from '@/lib/download'
import {
  unwrap,
  unwrapPaginatedWithMeta,
  type ApiEnvelope,
  type FinancialReportMeta,
  type FinancialReportRow,
  type FinancialReportStatus,
  type LivestreamReportRow,
  type LivestreamSortBy,
  type LivestreamsReportMeta,
  type OrderDrilldown,
  type OrderReportGroup,
  type OrderReportRow,
  type OrdersReportMeta,
  type PaginatedWithMeta,
  type RatingsReportMeta,
  type RatingsReviewRow,
  type RatingsSellerRow,
  type ReportDateRange,
  type ReportMeta,
} from '@/types/api'

/*
 * Contract B: `startDate` + `endDate` travel together (both or neither), and
 * every endpoint rejects unknown query fields with a 400. Each endpoint gets
 * its own params interface so a filter from one screen cannot leak into another.
 */

export interface ReportRangeParams {
  startDate?: string
  endDate?: string
}

export interface ReportPagingParams {
  page?: number
  limit?: number
}

export interface FinancialReportFilters extends ReportRangeParams {
  storeName?: string
  customerName?: string
  status?: FinancialReportStatus
}

export interface ListFinancialReportParams extends FinancialReportFilters, ReportPagingParams {}

export type FinancialExportFormat = 'xlsx' | 'pdf'

export interface RatingsReviewsParams extends ReportRangeParams, ReportPagingParams {
  sellerName?: string
  /** Exact star level, 1 to 5. */
  rating?: number
  categoryId?: string
}

export interface RatingsSellersParams extends ReportRangeParams, ReportPagingParams {
  sellerName?: string
}

export interface OrdersReportParams extends ReportRangeParams, ReportPagingParams {
  /** Filters the list only; `meta.summary` always describes the whole window. */
  group?: OrderReportGroup
}

export interface LivestreamsReportParams extends ReportRangeParams, ReportPagingParams {
  sortBy?: LivestreamSortBy
}

export async function listFinancialReport(
  params: ListFinancialReportParams,
): Promise<PaginatedWithMeta<FinancialReportRow, FinancialReportMeta>> {
  const res = await api.get<ApiEnvelope<FinancialReportRow[]> & { meta?: FinancialReportMeta }>(
    '/admin/reports/financial',
    { params },
  )
  return unwrapPaginatedWithMeta(res.data)
}

export interface ExportedFile {
  blob: Blob
  filename: string
}

/**
 * The export takes the table's filters (never `page` / `limit`) and answers
 * with the file body. Errors arrive as a Blob and are decoded by `fileApi`,
 * so `REPORT_EXPORT_TOO_LARGE` surfaces as `error.code`. `resolvedWindow` is the
 * resolved window the page shows; it names the file when the server's name
 * is unreadable.
 */
export async function exportFinancialReport(
  filters: FinancialReportFilters,
  format: FinancialExportFormat,
  resolvedWindow: ReportDateRange | undefined,
): Promise<ExportedFile> {
  const res = await fileApi.get<Blob>('/admin/reports/financial/export', {
    params: { ...filters, format },
    responseType: 'blob',
  })
  const fallback = reportExportFilename('financial-report', format, resolvedWindow)
  const disposition = res.headers['content-disposition'] as string | undefined
  return { blob: res.data, filename: parseContentDispositionFilename(disposition, fallback) }
}

/** Live on every call; shared by the Financial and Orders & Sales reports. */
export async function getOrderDrilldown(orderId: string): Promise<OrderDrilldown> {
  const res = await api.get<ApiEnvelope<OrderDrilldown> | OrderDrilldown>(
    `/admin/reports/financial/orders/${orderId}`,
  )
  return unwrap(res.data)
}

export async function listRatingsReviews(
  params: RatingsReviewsParams,
): Promise<PaginatedWithMeta<RatingsReviewRow, RatingsReportMeta>> {
  const res = await api.get<ApiEnvelope<RatingsReviewRow[]> & { meta?: RatingsReportMeta }>(
    '/admin/reports/ratings',
    { params },
  )
  return unwrapPaginatedWithMeta(res.data)
}

export async function listRatingsSellers(
  params: RatingsSellersParams,
): Promise<PaginatedWithMeta<RatingsSellerRow, ReportMeta>> {
  const res = await api.get<ApiEnvelope<RatingsSellerRow[]> & { meta?: ReportMeta }>(
    '/admin/reports/ratings/sellers',
    { params },
  )
  return unwrapPaginatedWithMeta(res.data)
}

export async function listOrdersReport(
  params: OrdersReportParams,
): Promise<PaginatedWithMeta<OrderReportRow, OrdersReportMeta>> {
  const res = await api.get<ApiEnvelope<OrderReportRow[]> & { meta?: OrdersReportMeta }>(
    '/admin/reports/orders',
    { params },
  )
  return unwrapPaginatedWithMeta(res.data)
}

export async function listLivestreamsReport(
  params: LivestreamsReportParams,
): Promise<PaginatedWithMeta<LivestreamReportRow, LivestreamsReportMeta>> {
  const res = await api.get<
    ApiEnvelope<LivestreamReportRow[]> & { meta?: LivestreamsReportMeta }
  >('/admin/reports/livestreams', { params })
  return unwrapPaginatedWithMeta(res.data)
}
