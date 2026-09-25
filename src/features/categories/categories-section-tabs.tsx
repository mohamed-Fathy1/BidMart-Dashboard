import { useRouterState } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { SectionTabs, type SectionTabItem } from '@/components/shared/section-tabs'
import { PERMISSIONS, usePermission } from '@/lib/permissions'

export function CategoriesSectionTabs() {
  const { t } = useTranslation()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const canViewSubs = usePermission(PERMISSIONS.subCategories.view)

  if (!canViewSubs) return null

  const isCategoriesIndex = pathname === '/categories' || pathname === '/categories/'
  const isSubArea =
    pathname === '/categories/sub-categories' ||
    /^\/categories\/[^/]+\/sub-categories\/?$/.test(pathname)

  const tabs: SectionTabItem[] = [
    { to: '/categories', label: t('categories:tabs.categories'), active: isCategoriesIndex },
    {
      to: '/categories/sub-categories',
      label: t('categories:tabs.sub_categories'),
      active: isSubArea,
    },
  ]

  return <SectionTabs tabs={tabs} ariaLabel={t('categories:tabs.aria')} />
}
