import { describe, it, expect } from 'vitest'
import { localizedPair } from './localized-name'

describe('localizedPair', () => {
  it('prefers the current language', () => {
    expect(localizedPair('Electronics', 'إلكترونيات', { language: 'ar' })).toBe('إلكترونيات')
    expect(localizedPair('Electronics', 'إلكترونيات', { language: 'en' })).toBe('Electronics')
  })
  it('falls back to the other language when the preferred one is empty', () => {
    expect(localizedPair('Electronics', null, { language: 'ar' })).toBe('Electronics')
    expect(localizedPair('', 'إلكترونيات', { language: 'en' })).toBe('إلكترونيات')
  })
  it('returns an empty string when both are missing', () => {
    expect(localizedPair(null, undefined, { language: 'en' })).toBe('')
  })
})
