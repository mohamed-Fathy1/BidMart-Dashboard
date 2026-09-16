/**
 * Shared helpers for list-page URL search params. Every admin list route uses
 * `?q=&page=&limit=&<filter>=` so search state survives refresh and back/forward.
 */

export interface ListSearchBase {
  q?: string
  page?: number
  limit?: number
}

export const DEFAULT_LIMIT = 10

/** Read a non-empty string search param; blank values are dropped from the URL. */
export function readString(raw: unknown): string | undefined {
  return typeof raw === 'string' && raw.trim().length > 0 ? raw : undefined
}

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

/** Read a `YYYY-MM-DD` search param; anything else is dropped. */
export function readIsoDate(raw: unknown): string | undefined {
  return typeof raw === 'string' && ISO_DATE_REGEX.test(raw) ? raw : undefined
}

/** Read an integer search param constrained to `[min, max]`. */
export function readIntInRange(raw: unknown, min: number, max: number): number | undefined {
  const n = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : NaN
  if (!Number.isInteger(n) || n < min || n > max) return undefined
  return n
}

function readNumber(raw: unknown): number | undefined {
  if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) return raw
  if (typeof raw === 'string' && raw.trim().length > 0) {
    const n = Number(raw)
    if (Number.isFinite(n) && n > 0) return n
  }
  return undefined
}

/**
 * Parse the base `{ q, page, limit }` search-param fields. Each list route
 * spreads this into its `validateSearch` return value and adds per-feature
 * filters on top.
 */
export function parseListSearchBase(search: Record<string, unknown>): ListSearchBase {
  return {
    q: readString(search.q),
    page: readNumber(search.page),
    limit: readNumber(search.limit),
  }
}

/** Read a string union with a fixed set of valid values; falls back to undefined. */
export function readEnum<T extends string>(
  raw: unknown,
  allowed: readonly T[],
): T | undefined {
  if (typeof raw !== 'string') return undefined
  return (allowed as readonly string[]).includes(raw) ? (raw as T) : undefined
}

/** Read an optional boolean from `?flag=true|false` style search params. */
export function readBoolean(raw: unknown): boolean | undefined {
  if (raw === true || raw === 'true') return true
  if (raw === false || raw === 'false') return false
  return undefined
}
