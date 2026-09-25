import { createFileRoute } from '@tanstack/react-router'
import { readEnum, readString } from '@/lib/list-search'
import { parseReportSearchBase, type ReportSearchBase } from '@/lib/report-range'
import type { OrderReportGroup } from '@/types/api'
import { ORDER_REPORT_GROUPS } from '@/features/reports/report-options'
import { OrdersReportPage } from '@/features/reports/orders-report-page'

export interface OrdersReportSearch extends ReportSearchBase {
  group?: OrderReportGroup
  /** Order id whose drill-down sheet is open. */
  order?: string
}

export const Route = createFileRoute('/_authed/reports/orders')({
  validateSearch: (search: Record<string, unknown>): OrdersReportSearch => ({
    ...parseReportSearchBase(search),
    group: readEnum(search.group, ORDER_REPORT_GROUPS),
    order: readString(search.order),
  }),
  component: OrdersReportPage,
})
