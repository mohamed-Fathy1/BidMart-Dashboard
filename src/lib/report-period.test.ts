import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/i18n', () => ({ i18n: { language: 'en' } }))

import {
  isFutureIso,
  parseIsoDateUtc,
  resolvedRangeLabel,
  shiftAnchor,
  todayIso,
} from './report-period'

describe('todayIso', () => {
  it('uses the UTC calendar day', () => {
    expect(todayIso(new Date('2026-09-16T23:30:00.000Z'))).toBe('2026-09-16')
    expect(todayIso(new Date('2026-09-16T00:10:00.000Z'))).toBe('2026-09-16')
  })
})

describe('parseIsoDateUtc', () => {
  it('rejects malformed and impossible dates', () => {
    expect(parseIsoDateUtc('2026-9-1')).toBeUndefined()
    expect(parseIsoDateUtc('2026-02-30')).toBeUndefined()
    expect(parseIsoDateUtc('2026-13-01')).toBeUndefined()
  })
  it('parses a valid date at UTC midnight', () => {
    expect(parseIsoDateUtc('2026-02-28')?.toISOString()).toBe('2026-02-28T00:00:00.000Z')
  })
})

describe('isFutureIso', () => {
  it('compares against the given today', () => {
    expect(isFutureIso('2026-09-17', '2026-09-16')).toBe(true)
    expect(isFutureIso('2026-09-16', '2026-09-16')).toBe(false)
    expect(isFutureIso('2026-09-15', '2026-09-16')).toBe(false)
  })
  it('does not treat malformed input as future', () => {
    expect(isFutureIso('9999', '2026-09-16')).toBe(false)
  })
})

describe('shiftAnchor', () => {
  it('moves one calendar unit per period', () => {
    expect(shiftAnchor('DAILY', '2026-09-16', 1)).toBe('2026-09-17')
    expect(shiftAnchor('DAILY', '2026-01-01', -1)).toBe('2025-12-31')
    expect(shiftAnchor('WEEKLY', '2026-09-16', -1)).toBe('2026-09-09')
    expect(shiftAnchor('MONTHLY', '2026-09-16', 1)).toBe('2026-10-16')
    expect(shiftAnchor('QUARTERLY', '2026-09-16', -1)).toBe('2026-06-16')
    expect(shiftAnchor('YEARLY', '2026-09-16', 1)).toBe('2027-09-16')
  })
  it('clamps the day when the target month is shorter', () => {
    expect(shiftAnchor('MONTHLY', '2026-01-31', 1)).toBe('2026-02-28')
    expect(shiftAnchor('MONTHLY', '2024-01-31', 1)).toBe('2024-02-29')
    expect(shiftAnchor('YEARLY', '2024-02-29', 1)).toBe('2025-02-28')
  })
  it('returns malformed input unchanged', () => {
    expect(shiftAnchor('MONTHLY', 'nope', 1)).toBe('nope')
  })
})

describe('resolvedRangeLabel', () => {
  it('formats the window as one localized range', () => {
    const label = resolvedRangeLabel({ startDate: '2026-09-01', endDate: '2026-09-30' })
    expect(label).toContain('Sep')
    expect(label).toContain('2026')
    expect(label).toMatch(/1/)
    expect(label).toMatch(/30/)
  })
  it('collapses a one-day window to a single date', () => {
    const label = resolvedRangeLabel({ startDate: '2026-09-08', endDate: '2026-09-08' })
    expect(label).toBe('Sep 8, 2026')
  })
})
