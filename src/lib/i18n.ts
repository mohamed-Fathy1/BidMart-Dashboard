import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import arCommon from '@/locales/ar/common.json'
import arShell from '@/locales/ar/shell.json'
import enCommon from '@/locales/en/common.json'
import enShell from '@/locales/en/shell.json'

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
    ar: { common: arCommon, shell: arShell },
    en: { common: enCommon, shell: enShell },
  },
  lng: getStoredLanguage(),
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common', 'shell'],
  interpolation: { escapeValue: false },
})

setDocumentDirection(i18n.language)

i18n.on('languageChanged', (lng) => {
  localStorage.setItem(STORAGE_KEY, lng)
  setDocumentDirection(lng)
})

export { i18n }
