import { api } from '@/lib/axios'
import {
  unwrap,
  type ApiEnvelope,
  type StatisticsBusinessActivity,
  type StatisticsFinancialOverview,
  type StatisticsOverview,
} from '@/types/api'
import type { StatisticsQuery } from '@/lib/report-period'

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
