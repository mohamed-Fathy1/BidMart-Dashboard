import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/i18n', () => ({ i18n: { language: 'en' } }))

import {
  isCompleteRange,
  presetForRange,
  presetToRange,
  rangeParamsFor,
  rangeValidationError,
  readRangeSearch,
} from './report-range'

const TODAY = '2026-09-16'

describe('presetToRange', () => {
  it('counts the last N days including today', () => {
    expect(presetToRange('last_7_days', TODAY)).toEqual({ from: '2026-09-10', to: TODAY })
    expect(presetToRange('last_30_days', TODAY)).toEqual({ from: '2026-08-18', to: TODAY })
    expect(presetToRange('last_90_days', TODAY)).toEqual({ from: '2026-06-19', to: TODAY })
  })
  it('resolves calendar months', () => {
    expect(presetToRange('this_month', TODAY)).toEqual({ from: '2026-09-01', to: TODAY })
    expect(presetToRange('last_month', TODAY)).toEqual({ from: '2026-08-01', to: '2026-08-31' })
    expect(presetToRange('last_month', '2026-03-05')).toEqual({
      from: '2026-02-01',
      to: '2026-02-28',
    })
    expect(presetToRange('last_month', '2026-01-15')).toEqual({
      from: '2025-12-01',
      to: '2025-12-31',
    })
  })
})

describe('presetForRange', () => {
  it('reads an empty URL range as the server default of the last 30 days', () => {
    expect(presetForRange(undefined, undefined, TODAY)).toBe('last_30_days')
  })
  it('names the preset whose dates match exactly', () => {
    expect(presetForRange('2026-09-10', TODAY, TODAY)).toBe('last_7_days')
    expect(presetForRange('2026-08-01', '2026-08-31', TODAY)).toBe('last_month')
  })
  it('leaves a custom range unnamed', () => {
    expect(presetForRange('2026-09-02', TODAY, TODAY)).toBeUndefined()
  })
})

describe('rangeValidationError', () => {
  it('flags from after to', () => {
    expect(rangeValidationError('2026-09-10', '2026-09-01', TODAY)).toBe('from_after_to')
  })
  it('flags a future end date', () => {
    expect(rangeValidationError('2026-09-01', '2026-09-17', TODAY)).toBe('to_in_future')
  })
  it('accepts a valid pair and ignores incomplete pairs', () => {
    expect(rangeValidationError('2026-09-01', '2026-09-16', TODAY)).toBeUndefined()
    expect(rangeValidationError('2026-09-01', '2026-09-01', TODAY)).toBeUndefined()
    expect(rangeValidationError('2026-09-01', undefined, TODAY)).toBeUndefined()
    expect(rangeValidationError(undefined, undefined, TODAY)).toBeUndefined()
  })
})

describe('rangeParamsFor', () => {
  it('sends both or nothing', () => {
    expect(rangeParamsFor('2026-09-01', '2026-09-16', TODAY)).toEqual({
      startDate: '2026-09-01',
      endDate: '2026-09-16',
    })
    expect(rangeParamsFor('2026-09-01', undefined, TODAY)).toEqual({})
    expect(rangeParamsFor(undefined, '2026-09-16', TODAY)).toEqual({})
    expect(rangeParamsFor(undefined, undefined, TODAY)).toEqual({})
  })
  it('sends nothing while the pair is invalid', () => {
    expect(rangeParamsFor('2026-09-10', '2026-09-01', TODAY)).toEqual({})
    expect(rangeParamsFor('2026-09-01', '2026-09-30', TODAY)).toEqual({})
  })
})

describe('readRangeSearch', () => {
  it('drops a half pair at the URL boundary', () => {
    expect(readRangeSearch('2026-09-01', undefined)).toEqual({})
    expect(readRangeSearch('2026-09-01', '2026-09-16')).toEqual({
      startDate: '2026-09-01',
      endDate: '2026-09-16',
    })
  })
})

describe('isCompleteRange', () => {
  it('needs both ends', () => {
    expect(isCompleteRange('a', 'b')).toBe(true)
    expect(isCompleteRange('a', '')).toBe(false)
    expect(isCompleteRange(undefined, 'b')).toBe(false)
  })
})
