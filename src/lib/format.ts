import { i18n } from '@/lib/i18n'

function getLocale(): string {
  return i18n.language === 'ar' ? 'ar-SA' : 'en-SA'
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
    return new Intl.DateTimeFormat(getLocale(), {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d)
  },

  dateTime(iso: string | Date): string {
    const d = typeof iso === 'string' ? new Date(iso) : iso
    return new Intl.DateTimeFormat(getLocale(), {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  },

  time(iso: string | Date): string {
    const d = typeof iso === 'string' ? new Date(iso) : iso
    return new Intl.DateTimeFormat(getLocale(), {
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  },

  dateRange(from: string | Date, to: string | Date): string {
    const f = typeof from === 'string' ? new Date(from) : from
    const t = typeof to === 'string' ? new Date(to) : to
    const fmt = new Intl.DateTimeFormat(getLocale(), {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    return fmt.formatRange(f, t)
  },
}
