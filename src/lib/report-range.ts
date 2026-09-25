import { parseListSearchBase, readIsoDate } from '@/lib/list-search'
import { parseIsoDateUtc, todayIso, toIsoDateUtc } from '@/lib/report-period'

/**
 * Helpers for the report From–To range (`startDate` + `endDate`). The pair
 * travels together: the server rejects exactly one, and defaults to the last
 * 30 days including today when neither is sent.
 */

export const RANGE_PRESETS = [
  'last_7_days',
  'last_30_days',
  'last_90_days',
  'this_month',
  'last_month',
] as const

export type RangePreset = (typeof RANGE_PRESETS)[number]

/** The preset the server applies when neither date is sent. */
export const DEFAULT_RANGE_PRESET: RangePreset = 'last_30_days'

export interface DateRangeValue {
  from: string
  to: string
}

export type RangeValidationError = 'from_after_to' | 'to_in_future'

/** Resolve a preset to a concrete inclusive range ending today (UTC). */
export function presetToRange(preset: RangePreset, today: string = todayIso()): DateRangeValue {
  const end = parseIsoDateUtc(today) ?? new Date()
  const y = end.getUTCFullYear()
  const m = end.getUTCMonth()
  const d = end.getUTCDate()
  switch (preset) {
    case 'last_7_days':
      return { from: toIsoDateUtc(new Date(Date.UTC(y, m, d - 6))), to: today }
    case 'last_30_days':
      return { from: toIsoDateUtc(new Date(Date.UTC(y, m, d - 29))), to: today }
    case 'last_90_days':
      return { from: toIsoDateUtc(new Date(Date.UTC(y, m, d - 89))), to: today }
    case 'this_month':
      return { from: toIsoDateUtc(new Date(Date.UTC(y, m, 1))), to: today }
    case 'last_month':
      return {
        from: toIsoDateUtc(new Date(Date.UTC(y, m - 1, 1))),
        to: toIsoDateUtc(new Date(Date.UTC(y, m, 0))),
      }
  }
}

/**
 * The preset a URL range stands for: the default when neither date is set,
 * the preset whose dates match exactly, or `undefined` for a custom range.
 */
export function presetForRange(
  from: string | undefined,
  to: string | undefined,
  today: string = todayIso(),
): RangePreset | undefined {
  if (!from && !to) return DEFAULT_RANGE_PRESET
  return RANGE_PRESETS.find((preset) => {
    const range = presetToRange(preset, today)
    return range.from === from && range.to === to
  })
}

/** True when both ends are present. */
export function isCompleteRange(from: string | undefined, to: string | undefined): from is string {
  return !!from && !!to
}

/**
 * Validation for a complete pair. Returns `undefined` when the range is
 * acceptable, or when it is incomplete (an incomplete pair is simply not sent).
 */
export function rangeValidationError(
  from: string | undefined,
  to: string | undefined,
  today: string = todayIso(),
): RangeValidationError | undefined {
  if (!isCompleteRange(from, to) || !to) return undefined
  if (from > to) return 'from_after_to'
  if (to > today) return 'to_in_future'
  return undefined
}

/**
 * The query fragment to send: both dates, or nothing. Never one alone, and
 * nothing while the pair fails validation.
 */
export function rangeParamsFor(
  from: string | undefined,
  to: string | undefined,
  today: string = todayIso(),
): { startDate: string; endDate: string } | Record<string, never> {
  if (!isCompleteRange(from, to) || !to) return {}
  if (rangeValidationError(from, to, today)) return {}
  return { startDate: from, endDate: to }
}

/** The search params every report route shares. */
export interface ReportSearchBase {
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
}

/**
 * Parse the shared report search params. The date pair is enforced
 * both-or-neither at the URL boundary so a half pair never reaches a query.
 */
export function parseReportSearchBase(search: Record<string, unknown>): ReportSearchBase {
  const { page, limit } = parseListSearchBase(search)
  const startDate = readIsoDate(search.startDate)
  const endDate = readIsoDate(search.endDate)
  return {
    page,
    limit,
    ...(isCompleteRange(startDate, endDate) ? { startDate, endDate } : {}),
  }
}
