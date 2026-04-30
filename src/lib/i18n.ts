import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import arCommon from '@/locales/ar/common.json'
import arComponents from '@/locales/ar/components.json'
import arShell from '@/locales/ar/shell.json'
import arUsers from '@/locales/ar/users.json'
import arCountries from '@/locales/ar/countries.json'
import arCategories from '@/locales/ar/categories.json'
import arProviders from '@/locales/ar/providers.json'
import enCommon from '@/locales/en/common.json'
import enComponents from '@/locales/en/components.json'
import enShell from '@/locales/en/shell.json'
import enUsers from '@/locales/en/users.json'
import enCountries from '@/locales/en/countries.json'
import enCategories from '@/locales/en/categories.json'
import enProviders from '@/locales/en/providers.json'

const STORAGE_KEY = 'bidmart-lang'

function getStoredLanguage(): string {
  return localStorage.getItem(STORAGE_KEY) ?? 'ar'
}

function setDocumentDirection(lng: string) {
  const dir = lng === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.setAttribute('dir', dir)
  document.documentElement.setAttribute('lang', lng)
}

i18n.use(initReactI18next).init({
  resources: {
    ar: { common: arCommon, components: arComponents, shell: arShell, users: arUsers, countries: arCountries, categories: arCategories, providers: arProviders },
    en: { common: enCommon, components: enComponents, shell: enShell, users: enUsers, countries: enCountries, categories: enCategories, providers: enProviders },
  },
  lng: getStoredLanguage(),
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common', 'components', 'shell', 'users', 'countries', 'categories', 'providers'],
  interpolation: { escapeValue: false },
})

setDocumentDirection(i18n.language)

i18n.on('languageChanged', (lng) => {
  localStorage.setItem(STORAGE_KEY, lng)
  setDocumentDirection(lng)
})

export { i18n }
