import { describe, it, expect, vi } from 'vitest'

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
