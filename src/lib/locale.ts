/**
 * The Intl locale each language maps to. Lives in its own module so both
 * `format.ts` and the i18next interpolation formatter can use one rule without
 * importing each other (`format.ts` already imports the i18n singleton).
 */

/** Locale for number and currency formatting. Arabic renders Arabic-Indic digits. */
export function numberLocale(language: string): string {
  return language === 'ar' ? 'ar-SA' : 'en-SA'
}

/**
 * Locale for date/time formatting. `ar-SA` defaults to the Islamic
 * (Umm al-Qura) calendar, which renders dates as Hijri (e.g. "٧ ذو الحجة
 * ١٤٤٧ هـ"). We force the Gregorian calendar via the `-u-ca-gregory`
 * extension so Arabic dates show Gregorian months in Arabic ("٧ فبراير
 * ٢٠٢٦") — same calendar as English, just localized names/digits.
 * The extension is ignored by `Intl.NumberFormat`, so number formatting
 * keeps using `numberLocale()`.
 */
export function dateLocale(language: string): string {
  return language === 'ar' ? 'ar-SA-u-ca-gregory' : 'en-SA'
}
