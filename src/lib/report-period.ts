import type { ReportDateRange, StatisticsPeriod } from '@/types/api'
import { format } from '@/lib/format'

/**
 * Helpers for the statistics calendar-period filter (`period` + `date`
 * anchor). Every date here is a `YYYY-MM-DD` string resolved in UTC, because
 * that is the calendar the server buckets by.
 */

export const STATISTICS_PERIODS: readonly StatisticsPeriod[] = [
  'DAILY',
  'WEEKLY',
  'MONTHLY',
  'QUARTERLY',
  'YEARLY',
]

export const DEFAULT_STATISTICS_PERIOD: StatisticsPeriod = 'MONTHLY'

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/** Format a `Date` as `YYYY-MM-DD` using its UTC fields. */
export function toIsoDateUtc(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
}

/** Parse `YYYY-MM-DD` into UTC midnight. Returns `undefined` for malformed input. */
export function parseIsoDateUtc(iso: string): Date | undefined {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return undefined
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const date = new Date(Date.UTC(y, mo - 1, d))
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d) {
    return undefined
  }
  return date
}

/**
 * Parse `YYYY-MM-DD` into local midnight, for display only. Feeding a
 * date-only string to `Date` parses it as UTC and can print the previous day
 * west of Greenwich.
 */
function parseIsoDateLocal(iso: string): Date | undefined {
  const utc = parseIsoDateUtc(iso)
  if (!utc) return undefined
  return new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate())
}

/** Today's date in UTC, the calendar the server checks "in the future" against. */
export function todayIso(now: Date = new Date()): string {
  return toIsoDateUtc(now)
}

/** True when `iso` is after today (UTC). Malformed input is not "future". */
export function isFutureIso(iso: string, today: string = todayIso()): boolean {
  return parseIsoDateUtc(iso) !== undefined && iso > today
}

/**
 * Move the anchor by `delta` calendar units of `period`. Month-based moves
 * clamp the day to the target month's length (Jan 31 + 1 month = Feb 28/29).
 * Returns the input unchanged when it is malformed.
 */
export function shiftAnchor(period: StatisticsPeriod, iso: string, delta: number): string {
  const date = parseIsoDateUtc(iso)
  if (!date) return iso
  const y = date.getUTCFullYear()
  const m = date.getUTCMonth()
  const d = date.getUTCDate()
  switch (period) {
    case 'DAILY':
      return toIsoDateUtc(new Date(Date.UTC(y, m, d + delta)))
    case 'WEEKLY':
      return toIsoDateUtc(new Date(Date.UTC(y, m, d + 7 * delta)))
    case 'MONTHLY':
      return toIsoDateUtc(addMonthsUtc(y, m, d, delta))
    case 'QUARTERLY':
      return toIsoDateUtc(addMonthsUtc(y, m, d, 3 * delta))
    case 'YEARLY':
      return toIsoDateUtc(addMonthsUtc(y, m, d, 12 * delta))
  }
}

function addMonthsUtc(y: number, m: number, d: number, months: number): Date {
  const first = new Date(Date.UTC(y, m + months, 1))
  const daysInTarget = new Date(
    Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0),
  ).getUTCDate()
  return new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), Math.min(d, daysInTarget)))
}

/** The window the server resolved, as one localized label ("Sep 1 – Sep 30, 2026"). */
export function resolvedRangeLabel(range: ReportDateRange): string {
  const from = parseIsoDateLocal(range.startDate)
  const to = parseIsoDateLocal(range.endDate)
  if (!from || !to) return `${range.startDate} – ${range.endDate}`
  return format.dateRange(from, to)
}
