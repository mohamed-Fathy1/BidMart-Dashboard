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
