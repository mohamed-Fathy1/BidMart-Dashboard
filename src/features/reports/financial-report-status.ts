import type { FinancialReportStatus, OrderStatus } from '@/types/api'

/**
 * The Financial Report's three fulfilment buckets, mirroring the server's
 * `FINANCIAL_REPORT_STATUS_BUCKETS`. The report lists paid orders only, so
 * `AWAITING_PAYMENT`, `CANCELLED` and `REFUNDED_FULL` never appear in it.
 */
export const FINANCIAL_STATUS_BUCKETS: Record<FinancialReportStatus, readonly OrderStatus[]> = {
  COMPLETED: [
    'DELIVERED',
    'REFUND_REQUESTED',
    'REFUNDED_PARTIAL',
    'REFUND_REJECTED',
    'PAYOUT_COMPLETE',
  ],
  IN_DELIVERY: ['SHIPPED'],
  IN_PROGRESS: ['PENDING_CONFIRMATION', 'PREPARING_PACKAGE'],
}

export const FINANCIAL_REPORT_STATUSES: readonly FinancialReportStatus[] = [
  'COMPLETED',
  'IN_DELIVERY',
  'IN_PROGRESS',
]

/** Statuses the report excludes before bucketing. */
export const EXCLUDED_FROM_FINANCIAL_REPORT: readonly OrderStatus[] = [
  'AWAITING_PAYMENT',
  'CANCELLED',
  'REFUNDED_FULL',
]

/** The bucket a row's `status` falls in, or `undefined` for an excluded status. */
export function financialBucketFor(status: OrderStatus): FinancialReportStatus | undefined {
  for (const bucket of FINANCIAL_REPORT_STATUSES) {
    if (FINANCIAL_STATUS_BUCKETS[bucket].includes(status)) return bucket
  }
  return undefined
}
