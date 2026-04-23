import { useTranslation } from 'react-i18next'
import { Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LangSwitcher() {
  const { i18n } = useTranslation()
  const currentLang = i18n.language

  function toggle() {
    const next = currentLang === 'ar' ? 'en' : 'ar'
    i18n.changeLanguage(next)
  }

  return (
    <Button variant="ghost" size="sm" onClick={toggle} className="gap-1.5">
      <Languages className="h-4 w-4" />
      <span className="text-xs font-medium uppercase">{currentLang === 'ar' ? 'EN' : 'AR'}</span>
    </Button>
  )
}
