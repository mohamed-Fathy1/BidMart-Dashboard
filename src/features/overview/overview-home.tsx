import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { useAuthStore } from '@/features/auth/auth.store'
import { usePermissionCheck } from '@/lib/permissions'
import { isNavLeafVisible, navLeaves } from '@/components/layout/nav-items'

/**
 * Neutral home for non-super admins. Statistics endpoints reject them with
 * 403 FORBIDDEN, so no statistics query mounts here — just a welcome and
 * shortcuts to the sections their permissions allow.
 */
export function OverviewHome() {
  const { t } = useTranslation()
  const check = usePermissionCheck()
  const isSuperAdmin = useAuthStore((s) => s.user?.isSuperAdmin)

  const shortcuts = navLeaves.filter((leaf) =>
    isNavLeafVisible(leaf, check, isSuperAdmin),
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('overview:home.title')}
        description={t('overview:home.description')}
      />

      {shortcuts.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shortcuts.map((leaf) => {
            const Icon = leaf.icon
            return (
              <li key={leaf.to}>
                <Link
                  to={leaf.to}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-rest transition-colors duration-(--duration-hover) ease-(--ease-default) hover:bg-muted/50"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-muted text-muted-foreground">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                    {t(leaf.labelKey)}
                  </span>
                  <ArrowRight
                    className="size-4 shrink-0 text-muted-foreground rtl:rotate-180"
                    aria-hidden
                  />
                </Link>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
