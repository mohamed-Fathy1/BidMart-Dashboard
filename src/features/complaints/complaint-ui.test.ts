import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  formatWaitDuration,
  getInitials,
  shortComplaintId,
  waitTone,
} from './complaint-ui'

// Stub `t` so the wait-duration helper returns deterministic strings without
// pulling in i18next during a unit test.
const fakeT = ((key: string, vars?: Record<string, unknown>) => {
  if (!vars) return key
  return Object.entries(vars).reduce(
    (acc, [k, v]) => acc.replace(`{{${k}}}`, String(v)),
    key,
  )
}) as unknown as Parameters<typeof formatWaitDuration>[1]

describe('getInitials', () => {
  it('returns two letters for two-word names', () => {
    expect(getInitials('Sara Al-Otaibi')).toBe('SA')
  })

  it('uppercases single-word names', () => {
    expect(getInitials('omar')).toBe('O')
  })

  it('handles whitespace + falsy input', () => {
    expect(getInitials('   ')).toBe('#')
    expect(getInitials('')).toBe('#')
    expect(getInitials(null)).toBe('#')
    expect(getInitials(undefined)).toBe('#')
  })

  it('uses only the first two words even when more are present', () => {
    expect(getInitials('Omar Bin Abdullah Al-Rashidi')).toBe('OB')
  })
})

describe('shortComplaintId', () => {
  it('prefixes # and trims to 8 chars', () => {
    expect(shortComplaintId('aaaa1111-2222-3333-4444-555566667777')).toBe(
      '#aaaa1111',
    )
  })
})

describe('formatWaitDuration', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-14T12:00:00Z'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "just_now" when under one minute', () => {
    const iso = new Date('2026-05-14T11:59:30Z').toISOString()
    expect(formatWaitDuration(iso, fakeT)).toBe('complaints:wait.just_now')
  })

  it('returns minute count under an hour', () => {
    const iso = new Date('2026-05-14T11:45:00Z').toISOString()
    expect(formatWaitDuration(iso, fakeT)).toBe('complaints:wait.minutes')
  })

  it('returns hour count under a day', () => {
    const iso = new Date('2026-05-14T05:00:00Z').toISOString()
    expect(formatWaitDuration(iso, fakeT)).toBe('complaints:wait.hours')
  })

  it('returns "days_hours" when there is a remainder', () => {
    const iso = new Date('2026-05-12T08:00:00Z').toISOString() // 2d 4h ago
    expect(formatWaitDuration(iso, fakeT)).toBe('complaints:wait.days_hours')
  })

  it('returns just "days" when the remainder is zero', () => {
    const iso = new Date('2026-05-11T12:00:00Z').toISOString() // exactly 3d
    expect(formatWaitDuration(iso, fakeT)).toBe('complaints:wait.days')
  })

  it('returns empty string for invalid input', () => {
    expect(formatWaitDuration('not-a-date', fakeT)).toBe('')
  })
})

describe('waitTone', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-14T12:00:00Z'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('is cool when under 24 hours', () => {
    expect(waitTone(new Date('2026-05-14T01:00:00Z').toISOString())).toBe('cool')
  })

  it('escalates to warm at 24–72 hours', () => {
    expect(waitTone(new Date('2026-05-13T00:00:00Z').toISOString())).toBe('warm') // 36h
    expect(waitTone(new Date('2026-05-12T13:00:00Z').toISOString())).toBe('warm') // 47h
  })

  it('escalates to hot past 72 hours', () => {
    expect(waitTone(new Date('2026-05-10T11:00:00Z').toISOString())).toBe('hot') // ~97h
  })

  it('treats invalid timestamps as cool (safe default)', () => {
    expect(waitTone('not-a-date')).toBe('cool')
  })
})
