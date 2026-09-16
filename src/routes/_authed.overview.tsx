import { Outlet, createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { readEnum, readIsoDate } from '@/lib/list-search'
import { DEFAULT_STATISTICS_PERIOD, STATISTICS_PERIODS } from '@/lib/report-period'
import { PageHeader } from '@/components/shared/page-header'
import { PermissionDenied } from '@/routes/_authed'
import type { StatisticsPeriod } from '@/types/api'

/**
 * Contract A filter, shared by the three statistics tabs. It lives on the
 * layout so switching tabs, reloading and back/forward keep the window.
 */
export interface StatisticsSearch {
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
  if (!allowed) return <PermissionDenied />

  return (
    <div className="space-y-6">
      <PageHeader title={t('overview:title')} description={t('overview:description')} />
      <Outlet />
    </div>
  )
}
