import { api } from '@/lib/axios'
import {
  unwrap,
  type ApiEnvelope,
  type StatisticsBusinessActivity,
  type StatisticsFinancialOverview,
  type StatisticsOverview,
  type StatisticsPeriod,
} from '@/types/api'

/**
 * Contract A: one `{ period, date }` object shared by all three statistics
 * tabs. `date` is the optional `YYYY-MM-DD` anchor (defaults to today, UTC).
 */
export interface StatisticsQuery {
  period: StatisticsPeriod
  date?: string
}

export async function getStatisticsOverview(params: StatisticsQuery): Promise<StatisticsOverview> {
  const res = await api.get<ApiEnvelope<StatisticsOverview> | StatisticsOverview>(
    '/admin/statistics/overview',
    { params },
  )
  return unwrap(res.data)
}

export async function getBusinessActivity(
  params: StatisticsQuery,
): Promise<StatisticsBusinessActivity> {
  const res = await api.get<ApiEnvelope<StatisticsBusinessActivity> | StatisticsBusinessActivity>(
    '/admin/statistics/business-activity',
    { params },
  )
  return unwrap(res.data)
}

export async function getFinancialOverview(
  params: StatisticsQuery,
): Promise<StatisticsFinancialOverview> {
  const res = await api.get<
    ApiEnvelope<StatisticsFinancialOverview> | StatisticsFinancialOverview
  >('/admin/statistics/financial-overview', { params })
  return unwrap(res.data)
}
