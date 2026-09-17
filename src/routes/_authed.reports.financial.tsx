import { createFileRoute } from '@tanstack/react-router'
import { readEnum, readIsoDate, readString, parseListSearchBase } from '@/lib/list-search'
import { readRangeSearch } from '@/lib/report-range'
import { FINANCIAL_REPORT_STATUSES } from '@/features/reports/financial-report-status'
import { FinancialReportPage } from '@/features/reports/financial-report-page'
import type { FinancialReportStatus } from '@/types/api'

/** No `q`: this report has two named searches instead of one free-text box. */
export interface FinancialReportSearch {
  page?: number
  limit?: number
  storeName?: string
  customerName?: string
  status?: FinancialReportStatus
  startDate?: string
  endDate?: string
  /** Order id whose drill-down sheet is open. */
  order?: string
}

export const Route = createFileRoute('/_authed/reports/financial')({
  validateSearch: (search: Record<string, unknown>): FinancialReportSearch => {
    const { page, limit } = parseListSearchBase(search)
    return {
      page,
      limit,
      storeName: readString(search.storeName),
      customerName: readString(search.customerName),
      status: readEnum(search.status, FINANCIAL_REPORT_STATUSES),
      ...readRangeSearch(readIsoDate(search.startDate), readIsoDate(search.endDate)),
      order: readString(search.order),
    }
  },
  component: FinancialReportPage,
})
