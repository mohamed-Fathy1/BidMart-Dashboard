// Vitest setup — runs before every test file.
// Mock i18next so `useTranslation()` and `i18n.t()` return key paths instead
// of requiring locale JSON to be loaded.
import { vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: () => Promise.resolve() },
  }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}))

vi.mock('@/lib/i18n', () => ({
  i18n: {
    t: (key: string) => key,
    language: 'en',
    on: () => {},
  },
}))
