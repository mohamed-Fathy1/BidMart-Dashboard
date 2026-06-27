import { i18n } from '@/lib/i18n'

function getLocale(): string {
  return i18n.language === 'ar' ? 'ar-SA' : 'en-SA'
}

/**
 * Locale for date/time formatting. `ar-SA` defaults to the Islamic
 * (Umm al-Qura) calendar, which renders dates as Hijri (e.g. "٧ ذو الحجة
 * ١٤٤٧ هـ"). We force the Gregorian calendar via the `-u-ca-gregory`
 * extension so Arabic dates show Gregorian months in Arabic ("٧ فبراير
 * ٢٠٢٦") — same calendar as English, just localized names/digits.
 * The extension is ignored by `Intl.NumberFormat`, so number formatting
 * keeps using `getLocale()`.
 */
function getDateLocale(): string {
  return i18n.language === 'ar' ? 'ar-SA-u-ca-gregory' : 'en-SA'
}

export const format = {
  currency(value: number, options?: { currency?: string }): string {
    return new Intl.NumberFormat(getLocale(), {
      style: 'currency',
      currency: options?.currency ?? 'SAR',
      minimumFractionDigits: 2,
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

  date(iso: string | Date): string {
    const d = typeof iso === 'string' ? new Date(iso) : iso
    return new Intl.DateTimeFormat(getDateLocale(), {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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
