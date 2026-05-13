import type { i18n as I18nInstance } from 'i18next'
import { useTranslation } from 'react-i18next'

/**
 * Bilingual record with `name_en` and `name_ar` fields. Most reference records
 * (categories, countries, roles, permissions modules) carry both — this util
 * picks the locale-correct one without per-callsite ternaries.
 */
export interface BilingualName {
  name_en: string
  name_ar: string
}

/** Generic bilingual pair under any prefix (e.g. `module_en` / `module_ar`). */
export type BilingualFields<TPrefix extends string> = Record<`${TPrefix}_en`, string> &
  Record<`${TPrefix}_ar`, string>

/**
 * Returns the locale-appropriate name for a bilingual record.
 *
 * Falls back to the other locale if the primary is empty so the UI never shows
 * a blank label (e.g. a partially-translated record still renders).
 */
export function localizedName(
  record: BilingualName | null | undefined,
  i18n: Pick<I18nInstance, 'language'>,
): string {
  if (!record) return ''
  const ar = i18n.language === 'ar'
  return (ar ? record.name_ar : record.name_en) || (ar ? record.name_en : record.name_ar) || ''
}

/**
 * Variant for records using a custom prefix pair (e.g. `module_en` / `module_ar`,
 * `label_en` / `label_ar`).
 */
export function localizedField<TPrefix extends string>(
  record: BilingualFields<TPrefix> | null | undefined,
  prefix: TPrefix,
  i18n: Pick<I18nInstance, 'language'>,
): string {
  if (!record) return ''
  const ar = i18n.language === 'ar'
  const enKey = `${prefix}_en` as keyof typeof record
  const arKey = `${prefix}_ar` as keyof typeof record
  return (
    String((ar ? record[arKey] : record[enKey]) ?? '') ||
    String((ar ? record[enKey] : record[arKey]) ?? '') ||
    ''
  )
}

/**
 * Hook variant — returns a stable `(record) => string` function bound to the
 * current locale. Use in render-prop spots (column accessors, rowLabel, etc.)
 * where keeping a one-shot reference in scope is cleaner than threading `i18n`.
 */
export function useLocalizedName() {
  const { i18n } = useTranslation()
  return (record: BilingualName | null | undefined) => localizedName(record, i18n)
}
