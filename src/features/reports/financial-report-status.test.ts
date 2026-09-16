import { describe, it, expect } from 'vitest'
import type { OrderStatus } from '@/types/api'
import {
  EXCLUDED_FROM_FINANCIAL_REPORT,
  FINANCIAL_STATUS_BUCKETS,
  financialBucketFor,
} from './financial-report-status'

const ALL_ORDER_STATUSES: readonly OrderStatus[] = [
  'AWAITING_PAYMENT',
  'PENDING_CONFIRMATION',
  'PREPARING_PACKAGE',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUND_REQUESTED',
  'REFUNDED_FULL',
  'REFUNDED_PARTIAL',
  'REFUND_REJECTED',
  'PAYOUT_COMPLETE',
]

describe('financial report buckets', () => {
  it('maps every order status to exactly one bucket or the excluded list', () => {
    for (const status of ALL_ORDER_STATUSES) {
      const buckets = Object.values(FINANCIAL_STATUS_BUCKETS).filter((list) =>
        list.includes(status),
      )
      const excluded = EXCLUDED_FROM_FINANCIAL_REPORT.includes(status)
      expect(buckets.length + (excluded ? 1 : 0), status).toBe(1)
    }
  })

  it('mirrors the server table', () => {
    expect(financialBucketFor('SHIPPED')).toBe('IN_DELIVERY')
    expect(financialBucketFor('REFUNDED_PARTIAL')).toBe('COMPLETED')
    expect(financialBucketFor('PREPARING_PACKAGE')).toBe('IN_PROGRESS')
    expect(financialBucketFor('AWAITING_PAYMENT')).toBeUndefined()
    expect(financialBucketFor('REFUNDED_FULL')).toBeUndefined()
  })
})
