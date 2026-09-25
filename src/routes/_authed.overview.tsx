import { Outlet, createFileRoute, useRouterState } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { readEnum, readIsoDate } from '@/lib/list-search'
import { DEFAULT_STATISTICS_PERIOD, STATISTICS_PERIODS } from '@/lib/report-period'
import { PageHeader } from '@/components/shared/page-header'
import { PeriodFilter } from '@/components/shared/period-filter'
import { SectionTabs } from '@/components/shared/section-tabs'
import { useStatisticsWindow } from '@/features/overview/use-statistics-window'
import { PermissionDenied } from '@/routes/_authed'
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
  const allowed = usePermission(PERMISSIONS.reports.view)
  const navigate = Route.useNavigate()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const { period, date, anchorError } = useStatisticsWindow()

  if (!allowed) return <PermissionDenied />

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
          period={period}
          date={date}
          error={anchorError}
          onChange={(next) =>
            navigate({
              search: {
                period: next.period === DEFAULT_STATISTICS_PERIOD ? undefined : next.period,
                date: next.date,
              },
            })
          }
        />
      </div>

      {!anchorError && <Outlet />}
    </div>
  )
}
