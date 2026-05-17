import { Link, useRouterState } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { PERMISSIONS, usePermission } from '@/lib/permissions'

function segmentClasses(active: boolean) {
  return cn(
    'group/tab relative z-10 inline-flex min-h-9 shrink-0 items-center justify-center overflow-hidden rounded-md px-4 py-2 text-sm font-medium transition-[color,opacity] duration-(--duration-hover) ease-(--ease-default)',
    active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
  )
}

function highlightClasses(active: boolean) {
  return cn(
    'pointer-events-none absolute inset-0 rounded-md ring-1 transition-[background-color,box-shadow,opacity] duration-(--duration-hover) ease-(--ease-default)',
    active
      ? 'bg-card opacity-100 shadow-rest ring-border'
      : 'bg-transparent opacity-100 ring-transparent group-hover/tab:bg-muted-foreground/10 group-hover/tab:ring-border',
  )
}

export function SettingsSectionTabs() {
  const { t } = useTranslation()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const canViewComplaints = usePermission(PERMISSIONS.complaints.view)

  const isSystem = pathname === '/settings' || pathname === '/settings/'
  const isComplaintTypes =
    pathname === '/settings/complaint-types' ||
    pathname === '/settings/complaint-types/'

  return (
    <div
      className="inline-flex rounded-lg border border-border bg-background p-1"
      role="tablist"
      aria-label={t('settings:tabs.aria')}
    >
      <div className="relative flex flex-wrap gap-1">
        <Link
          to="/settings"
          className={segmentClasses(isSystem)}
          role="tab"
          aria-selected={isSystem}
        >
          <span className={highlightClasses(isSystem)} aria-hidden />
          <span className="relative">{t('settings:tabs.system')}</span>
        </Link>
        {canViewComplaints && (
          <Link
            to="/settings/complaint-types"
            className={segmentClasses(isComplaintTypes)}
            role="tab"
            aria-selected={isComplaintTypes}
          >
            <span className={highlightClasses(isComplaintTypes)} aria-hidden />
            <span className="relative">{t('settings:tabs.complaint_types')}</span>
          </Link>
        )}
      </div>
    </div>
  )
}
