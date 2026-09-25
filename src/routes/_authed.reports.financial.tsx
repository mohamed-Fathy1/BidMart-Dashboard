import { createFileRoute } from '@tanstack/react-router'
import { readEnum, readString } from '@/lib/list-search'
import { parseReportSearchBase, type ReportSearchBase } from '@/lib/report-range'
import { FINANCIAL_REPORT_STATUSES } from '@/features/reports/financial-report-status'
import { FinancialReportPage } from '@/features/reports/financial-report-page'
import type { FinancialReportStatus } from '@/types/api'

/** No `q`: this report has two named searches instead of one free-text box. */
export interface FinancialReportSearch extends ReportSearchBase {
  storeName?: string
  customerName?: string
  status?: FinancialReportStatus
  /** Order id whose drill-down sheet is open. */
  order?: string
}

export const Route = createFileRoute('/_authed/reports/financial')({
  validateSearch: (search: Record<string, unknown>): FinancialReportSearch => ({
    ...parseReportSearchBase(search),
    storeName: readString(search.storeName),
    customerName: readString(search.customerName),
    status: readEnum(search.status, FINANCIAL_REPORT_STATUSES),
    order: readString(search.order),
  }),
  component: FinancialReportPage,
})
