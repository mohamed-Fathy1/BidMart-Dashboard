import { describe, it, expect } from 'vitest'
import { parseListSearchBase, readEnum, readBoolean } from './list-search'

describe('parseListSearchBase', () => {
  it('reads q / page / limit from an object map', () => {
    expect(parseListSearchBase({ q: 'foo', page: 2, limit: 25 })).toEqual({
      q: 'foo',
      page: 2,
      limit: 25,
    })
  })

  it('coerces numeric strings (URL state arrives as strings before parse)', () => {
    expect(parseListSearchBase({ page: '3', limit: '50' })).toEqual({
      q: undefined,
      page: 3,
      limit: 50,
    })
  })

  it('drops empty strings + non-positive numbers so the URL stays clean', () => {
    expect(parseListSearchBase({ q: '   ', page: 0, limit: -1 })).toEqual({
      q: undefined,
      page: undefined,
      limit: undefined,
    })
  })

  it('ignores garbage values', () => {
    expect(parseListSearchBase({ q: 42, page: 'abc', limit: NaN })).toEqual({
      q: undefined,
      page: undefined,
      limit: undefined,
    })
  })
})

describe('readEnum', () => {
  const ALLOWED = ['pending', 'approved', 'rejected'] as const

  it('returns the value when it is in the allow-list', () => {
    expect(readEnum('approved', ALLOWED)).toBe('approved')
  })

  it('returns undefined for unknown values (URL tampering protection)', () => {
    expect(readEnum('hacker', ALLOWED)).toBeUndefined()
    expect(readEnum(123, ALLOWED)).toBeUndefined()
    expect(readEnum(undefined, ALLOWED)).toBeUndefined()
  })
})

describe('readBoolean', () => {
  it('parses boolean primitives + their string forms', () => {
    expect(readBoolean(true)).toBe(true)
    expect(readBoolean('true')).toBe(true)
    expect(readBoolean(false)).toBe(false)
    expect(readBoolean('false')).toBe(false)
  })

  it('returns undefined for anything else (a present-but-missing flag stays absent)', () => {
    expect(readBoolean('')).toBeUndefined()
    expect(readBoolean('1')).toBeUndefined()
    expect(readBoolean(null)).toBeUndefined()
    expect(readBoolean(undefined)).toBeUndefined()
  })
})
