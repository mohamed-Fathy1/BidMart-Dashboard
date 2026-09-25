import { api } from '@/lib/axios'
import type { StatisticsQuery } from '@/lib/report-period'
import {
  unwrap,
  type ApiEnvelope,
  type StatisticsBusinessActivity,
  type StatisticsFinancialOverview,
  type StatisticsOverview,
} from '@/types/api'

/** Each statistics tab's endpoint under `/admin/statistics/` and the payload it returns. */
interface StatisticsResponses {
  overview: StatisticsOverview
  'business-activity': StatisticsBusinessActivity
  'financial-overview': StatisticsFinancialOverview
}

export type StatisticsEndpoint = keyof StatisticsResponses

export async function getStatistics<E extends StatisticsEndpoint>(
  endpoint: E,
  params: StatisticsQuery,
): Promise<StatisticsResponses[E]> {
  const res = await api.get<ApiEnvelope<StatisticsResponses[E]> | StatisticsResponses[E]>(
    `/admin/statistics/${endpoint}`,
    { params },
  )
  return unwrap(res.data)
}
