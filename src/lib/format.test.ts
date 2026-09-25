import { afterAll, beforeAll, describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/i18n', () => ({ i18n: { language: 'en' } }))

import { format } from './format'

describe('format.percentValue', () => {
  it('treats the input as an existing percentage with one decimal', () => {
    expect(format.percentValue(28.9)).toBe('28.9%')
    expect(format.percentValue(0)).toBe('0.0%')
    expect(format.percentValue(100)).toBe('100.0%')
  })
})

describe('format.duration', () => {
  it('renders minutes only under an hour', () => {
    expect(format.duration(42)).toBe('42 min')
  })
  it('renders hours and minutes', () => {
    expect(format.duration(78)).toBe('1 hr 18 min')
  })
  it('drops the minutes part on exact hours', () => {
    expect(format.duration(120)).toBe('2 hr')
  })
  it('clamps negatives and rounds fractions', () => {
    expect(format.duration(-5)).toBe('0 min')
    expect(format.duration(59.6)).toBe('1 hr')
  })
})

describe('format.compactNumber', () => {
  it('uses compact notation', () => {
    expect(format.compactNumber(1234)).toBe('1.2K')
    expect(format.compactNumber(950)).toBe('950')
  })
})

describe('format.month', () => {
  const originalTz = process.env.TZ
  beforeAll(() => {
    process.env.TZ = 'America/New_York'
  })
  afterAll(() => {
    process.env.TZ = originalTz
  })

  it('keeps the month of the key west of UTC', () => {
    expect(format.month('2026-09')).toBe('Sep')
    expect(format.month('2026-01', { withYear: true })).toBe('Jan 2026')
  })
  it('returns a malformed key unchanged', () => {
    expect(format.month('2026-9')).toBe('2026-9')
  })
})
