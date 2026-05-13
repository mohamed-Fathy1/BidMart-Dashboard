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

function readString(raw: unknown): string | undefined {
  return typeof raw === 'string' && raw.trim().length > 0 ? raw : undefined
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
