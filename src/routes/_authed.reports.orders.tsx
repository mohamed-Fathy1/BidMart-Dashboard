import { createFileRoute } from '@tanstack/react-router'
import { parseListSearchBase, readEnum, readIsoDate, readString } from '@/lib/list-search'
import { readRangeSearch } from '@/lib/report-range'
import type { OrderReportGroup } from '@/types/api'
import { OrdersReportPage } from '@/features/reports/orders-report-page'

export const ORDER_REPORT_GROUPS: readonly OrderReportGroup[] = [
  'COMPLETED',
  'CANCELLED',
  'IN_PROGRESS',
  'REFUNDED',
]

export interface OrdersReportSearch {
  page?: number
  limit?: number
  group?: OrderReportGroup
  startDate?: string
  endDate?: string
  /** Order id whose drill-down sheet is open. */
  order?: string
}

export const Route = createFileRoute('/_authed/reports/orders')({
  validateSearch: (search: Record<string, unknown>): OrdersReportSearch => {
    const { page, limit } = parseListSearchBase(search)
    return {
      page,
      limit,
      group: readEnum(search.group, ORDER_REPORT_GROUPS),
      ...readRangeSearch(readIsoDate(search.startDate), readIsoDate(search.endDate)),
      order: readString(search.order),
    }
  },
  component: OrdersReportPage,
})
