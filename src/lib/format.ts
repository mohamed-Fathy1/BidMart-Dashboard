import { i18n } from '@/lib/i18n'
import { dateLocale, numberLocale } from '@/lib/locale'

function getLocale(): string {
  return numberLocale(i18n.language)
}

function getDateLocale(): string {
  return dateLocale(i18n.language)
}

export const format = {
  currency(value: number, options?: { currency?: string }): string {
    return new Intl.NumberFormat(getLocale(), {
      style: 'currency',
      currency: options?.currency ?? 'SAR',
      minimumFractionDigits: 2,
    }).format(value)
  },

  /**
   * `currency()` split into the code and the amount, so a headline figure can
   * set the code smaller than the digits. `symbolFirst` follows the locale:
   * "SAR 1,504.80" in English, "١٬٥٠٤٫٨٠ ر.س." in Arabic.
   */
  currencyParts(
    value: number,
    options?: { currency?: string },
  ): { symbol: string; amount: string; symbolFirst: boolean } {
    const parts = new Intl.NumberFormat(getLocale(), {
      style: 'currency',
      currency: options?.currency ?? 'SAR',
      minimumFractionDigits: 2,
    }).formatToParts(value)
    const symbolIndex = parts.findIndex((part) => part.type === 'currency')
    const firstDigit = parts.findIndex((part) => part.type === 'integer')
    const amount = parts
      .filter((part) => part.type !== 'currency' && !(part.type === 'literal' && /^[\s\u200e\u200f\u061c]*$/.test(part.value)))
      .map((part) => part.value)
      .join('')
    return { symbol: parts[symbolIndex]?.value ?? '', amount, symbolFirst: symbolIndex < firstDigit }
  },

  /** Short axis figures: 1.2K, 3.4M. */
  compactNumber(value: number): string {
    return new Intl.NumberFormat(getLocale(), {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value)
  },

  number(value: number): string {
    return new Intl.NumberFormat(getLocale()).format(value)
  },

  percent(value: number): string {
    return new Intl.NumberFormat(getLocale(), {
      style: 'percent',
      minimumFractionDigits: 1,
    }).format(value)
  },

  /**
   * Format a value that is already a percentage (28.9 means 28.9%), one
   * decimal. `percent()` expects a ratio; the reporting API sends percentages.
   */
  percentValue(value: number): string {
    return new Intl.NumberFormat(getLocale(), {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100)
  },

  /** Whole minutes as "1 hr 18 min" (or just "42 min" under an hour). */
  duration(minutes: number): string {
    const total = Math.max(0, Math.round(minutes))
    const hours = Math.floor(total / 60)
    const mins = total % 60
    const locale = getLocale()
    const fmtHours = new Intl.NumberFormat(locale, {
      style: 'unit',
      unit: 'hour',
      unitDisplay: 'short',
    })
    const fmtMinutes = new Intl.NumberFormat(locale, {
      style: 'unit',
      unit: 'minute',
      unitDisplay: 'short',
    })
    if (hours === 0) return fmtMinutes.format(mins)
    if (mins === 0) return fmtHours.format(hours)
    return `${fmtHours.format(hours)} ${fmtMinutes.format(mins)}`
  },

  date(iso: string | Date): string {
    const d = typeof iso === 'string' ? new Date(iso) : iso
    return new Intl.DateTimeFormat(getDateLocale(), {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d)
  },

  /**
   * A `YYYY-MM` month key as a short month name. The key is built at UTC
   * midnight, so it is formatted in UTC or it prints the previous month west of
   * Greenwich. Malformed keys are returned unchanged.
   */
  month(yyyyMm: string, opts?: { withYear?: boolean }): string {
    const match = /^(\d{4})-(\d{2})$/.exec(yyyyMm)
    if (!match) return yyyyMm
    const d = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1))
    return new Intl.DateTimeFormat(getDateLocale(), {
      month: 'short',
      year: opts?.withYear ? 'numeric' : undefined,
      timeZone: 'UTC',
    }).format(d)
  },

  dateTime(iso: string | Date): string {
    const d = typeof iso === 'string' ? new Date(iso) : iso
    return new Intl.DateTimeFormat(getDateLocale(), {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  },

  time(iso: string | Date): string {
    const d = typeof iso === 'string' ? new Date(iso) : iso
    return new Intl.DateTimeFormat(getDateLocale(), {
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  },

  dateRange(from: string | Date, to: string | Date): string {
    const f = typeof from === 'string' ? new Date(from) : from
    const t = typeof to === 'string' ? new Date(to) : to
    const fmt = new Intl.DateTimeFormat(getDateLocale(), {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    return fmt.formatRange(f, t)
  },

  /**
   * Parse a pre-formatted signed money string from the wallet ledger
   * (`amount` field). Server uses a leading `+` for credits and the
   * typographic minus `−` (U+2212) for debits — NOT the ASCII hyphen.
   * `parseFloat("−150.00")` returns `NaN`, so callers must not parse the
   * raw string. Use this helper to split sign from absolute value for
   * coloring/formatting.
   */
  /**
   * Short relative time ("2m", "14m", "1h", "3d", "in 5m" for future dates).
   * Picks the largest non-zero unit. Locale-aware via `Intl.RelativeTimeFormat`
   * with `style: 'narrow'`.
   */
  relative(iso: string | Date): string {
    const d = typeof iso === 'string' ? new Date(iso) : iso
    const diffMs = d.getTime() - Date.now()
    const abs = Math.abs(diffMs)
    const minute = 60_000
    const hour = 60 * minute
    const day = 24 * hour
    const rtf = new Intl.RelativeTimeFormat(getLocale(), { numeric: 'auto', style: 'narrow' })
    if (abs < minute) {
      return rtf.format(Math.round(diffMs / 1000), 'second')
    }
    if (abs < hour) {
      return rtf.format(Math.round(diffMs / minute), 'minute')
    }
    if (abs < day) {
      return rtf.format(Math.round(diffMs / hour), 'hour')
    }
    return rtf.format(Math.round(diffMs / day), 'day')
  },

  signedMoney(raw: string): { sign: '+' | '−'; absolute: string } {
    if (!raw) return { sign: '+', absolute: '0.00' }
    const first = raw.charAt(0)
    if (first === '+' || first === '−' || first === '-') {
      return { sign: first === '+' ? '+' : '−', absolute: raw.slice(1) }
    }
    return { sign: '+', absolute: raw }
  },
}
