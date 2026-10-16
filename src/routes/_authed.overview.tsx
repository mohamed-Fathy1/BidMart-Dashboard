import { Outlet, createFileRoute, useRouterState } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/features/auth/auth.store'
import { readEnum, readIsoDate } from '@/lib/list-search'
import { DEFAULT_STATISTICS_PERIOD, STATISTICS_PERIODS } from '@/lib/report-period'
import { PageHeader } from '@/components/shared/page-header'
import { PeriodFilter } from '@/components/shared/period-filter'
import { SectionTabs } from '@/components/shared/section-tabs'
import { OverviewHome } from '@/features/overview/overview-home'
import { useStatisticsWindow } from '@/features/overview/use-statistics-window'
import type { StatisticsPeriod } from '@/types/api'

/**
 * Contract A filter, shared by the three statistics tabs. It lives on the
 * layout so switching tabs, reloading and back/forward keep the window.
 */
interface StatisticsSearch {
  /** Absent means `DEFAULT_STATISTICS_PERIOD`; the default is not written to the URL. */
  period?: StatisticsPeriod
  /** `YYYY-MM-DD` anchor; absent means today (UTC). */
  date?: string
}

export const Route = createFileRoute('/_authed/overview')({
  validateSearch: (search: Record<string, unknown>): StatisticsSearch => {
    const period = readEnum(search.period, STATISTICS_PERIODS)
    return {
      period: period === DEFAULT_STATISTICS_PERIOD ? undefined : period,
      date: readIsoDate(search.date),
    }
  },
  component: StatisticsLayoutRoute,
})

function StatisticsLayoutRoute() {
  const { t } = useTranslation()
  // Statistics endpoints are super-admin only (any other admin gets 403
  // FORBIDDEN). Non-super admins get a neutral home — never an error page —
  // and no statistics query mounts.
  const isSuperAdmin = useAuthStore((s) => s.user?.isSuperAdmin)
  const navigate = Route.useNavigate()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const { params, anchorError } = useStatisticsWindow()

  if (!isSuperAdmin) return <OverviewHome />

  const isGeneral = pathname === '/overview' || pathname === '/overview/'

  return (
    <div className="space-y-6">
      <PageHeader title={t('overview:title')} description={t('overview:description')} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionTabs
          ariaLabel={t('overview:title')}
          tabs={[
            {
              to: '/overview',
              label: t('overview:tabs.general'),
              active: isGeneral,
              search: true,
            },
            {
              to: '/overview/business-activity',
              label: t('overview:tabs.business_activity'),
              active: pathname.startsWith('/overview/business-activity'),
              search: true,
            },
            {
              to: '/overview/financial-overview',
              label: t('overview:tabs.financial_overview'),
              active: pathname.startsWith('/overview/financial-overview'),
              search: true,
            },
          ]}
        />

        <PeriodFilter
          value={params}
          error={anchorError}
          onChange={(next) => {
            const search = {
              period: next.period === DEFAULT_STATISTICS_PERIOD ? undefined : next.period,
              date: next.date,
            }
            // `Route.useNavigate()` defaults to the layout path, so pass `to`
            // explicitly to keep the active tab when the window changes.
            if (pathname.startsWith('/overview/business-activity')) {
              navigate({ to: '/overview/business-activity', search })
            } else if (pathname.startsWith('/overview/financial-overview')) {
              navigate({ to: '/overview/financial-overview', search })
            } else {
              navigate({ to: '/overview', search })
            }
          }}
        />
      </div>

      {!anchorError && <Outlet />}
    </div>
  )
}
