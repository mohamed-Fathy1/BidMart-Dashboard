import { Link, useRouterState } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { PERMISSIONS, usePermission } from '@/lib/permissions'

function segmentClasses(active: boolean) {
  return cn(
    'relative z-10 inline-flex min-h-9 shrink-0 items-center justify-center overflow-hidden rounded-md px-4 py-2 text-sm font-medium transition-[color,opacity] duration-(--duration-hover) ease-(--ease-default)',
    active ? 'text-primary' : 'text-muted-foreground',
  )
}

export function CategoriesSectionTabs() {
  const { t } = useTranslation()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const canViewSubs = usePermission(PERMISSIONS.subCategories.view)

  const isCategoriesIndex = pathname === '/categories' || pathname === '/categories/'
  const isSubArea =
    pathname === '/categories/sub-categories' ||
    /^\/categories\/[^/]+\/sub-categories\/?$/.test(pathname)

  if (!canViewSubs) return null

  return (
    <div
      className="inline-flex rounded-lg border border-border bg-muted/30 p-1"
      role="tablist"
      aria-label={t('categories:tabs.aria')}
    >
      <div className="relative flex flex-wrap gap-1">
        <Link
          to="/categories"
          className={segmentClasses(isCategoriesIndex)}
          role="tab"
          aria-selected={isCategoriesIndex}
        >
          <span
            className={cn(
              'pointer-events-none absolute inset-0 rounded-md transition-[opacity,transform] duration-(--duration-layout) ease-(--ease-sidebar)',
              isCategoriesIndex
                ? 'bg-primary/10 opacity-100'
                : 'bg-transparent opacity-0',
            )}
            aria-hidden
          />
          <span className="relative">{t('categories:tabs.categories')}</span>
        </Link>
        <Link
          to="/categories/sub-categories"
          className={segmentClasses(isSubArea)}
          role="tab"
          aria-selected={isSubArea}
        >
          <span
            className={cn(
              'pointer-events-none absolute inset-0 rounded-md transition-[opacity,transform] duration-(--duration-layout) ease-(--ease-sidebar)',
              isSubArea ? 'bg-primary/10 opacity-100' : 'bg-transparent opacity-0',
            )}
            aria-hidden
          />
          <span className="relative">{t('categories:tabs.sub_categories')}</span>
        </Link>
      </div>
    </div>
  )
}
