import { describe, it, expect } from 'vitest'
import { unwrap, type ApiEnvelope } from './api'

describe('unwrap', () => {
  it('returns `data` when the body is an `{ success, data }` envelope', () => {
    const env: ApiEnvelope<{ id: number }> = { success: true, data: { id: 7 } }
    expect(unwrap(env)).toEqual({ id: 7 })
  })

  it('preserves nested meta-bearing envelopes by returning the inner payload only', () => {
    const env: ApiEnvelope<number[]> = {
      success: true,
      data: [1, 2, 3],
      meta: {
        page: 1,
        limit: 10,
        total: 3,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    }
    expect(unwrap(env)).toEqual([1, 2, 3])
  })

  it('passes through bodies that are not envelopes (back-compat for unwrapped endpoints)', () => {
    const plain = { id: 9, name: 'Bare' }
    expect(unwrap(plain as unknown as { id: number; name: string })).toBe(plain)
  })

  it('passes through primitives and null without crashing', () => {
    expect(unwrap('hello' as unknown as string)).toBe('hello')
    expect(unwrap(null as unknown as null)).toBe(null)
    expect(unwrap(42 as unknown as number)).toBe(42)
  })
})

describe('unwrapPaginatedWithMeta', () => {
  it('keeps the report extras on meta', async () => {
    const { unwrapPaginatedWithMeta } = await import('./api')
    const body = {
      success: true,
      data: [{ id: 1 }],
      meta: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        dateRange: { startDate: '2026-08-10', endDate: '2026-09-08' },
        totals: { totalOrderValue: 10 },
      },
    }
    const out = unwrapPaginatedWithMeta(body)
    expect(out.data).toEqual([{ id: 1 }])
    expect(out.meta.dateRange.endDate).toBe('2026-09-08')
    expect(out.meta.totals.totalOrderValue).toBe(10)
  })

  it('throws when meta is missing', async () => {
    const { unwrapPaginatedWithMeta } = await import('./api')
    expect(() => unwrapPaginatedWithMeta({ success: true, data: [] })).toThrow(/meta/)
  })
})
