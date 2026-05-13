export interface OverviewKpi {
  id: 'total_users' | 'live_auctions' | 'pending_withdrawals' | 'gmv_30d'
  value: string
  delta: string
  positive: boolean
  detail: 'vs_prev_30d' | 'right_now' | 'awaiting_review'
  spark: number[]
}

export interface ActionQueueItem {
  id: 'withdrawals' | 'providers' | 'complaints' | 'streams'
  count: number
  tone: 'amber' | 'red' | 'neutral'
  to: string
  ready: boolean
}

export interface RecentActivityItem {
  id: string
  actor: string
  actionKey: 'approved_withdrawal' | 'verified_provider' | 'suspended_user' | 'flagged_withdrawal' | 'ended_stream'
  target: string
  amount?: string
  when: string
  tone: 'positive' | 'negative' | 'warning' | 'neutral'
}

export interface TopProvider {
  rank: number
  name: string
  categoryKey: 'jewelry' | 'antiques' | 'collectibles' | 'automotive' | 'watches'
  gmv: number
  share: number
  trend: number[]
}

export const KPIS: OverviewKpi[] = [
  {
    id: 'total_users',
    value: '12,847',
    delta: '+4.2%',
    positive: true,
    detail: 'vs_prev_30d',
    spark: [12, 14, 13, 16, 15, 18, 20, 22, 21, 24, 26, 28, 27, 30, 32],
  },
  {
    id: 'live_auctions',
    value: '342',
    delta: '+12',
    positive: true,
    detail: 'right_now',
    spark: [42, 38, 45, 52, 48, 55, 58, 62, 60, 68, 72, 70, 78, 82, 76],
  },
  {
    id: 'pending_withdrawals',
    value: '8',
    delta: 'SAR 9,021',
    positive: false,
    detail: 'awaiting_review',
    spark: [4, 6, 5, 7, 8, 7, 9, 8, 10, 9, 11, 9, 8, 9, 8],
  },
  {
    id: 'gmv_30d',
    value: 'SAR 1.24M',
    delta: '+8.1%',
    positive: true,
    detail: 'vs_prev_30d',
    spark: [80, 85, 82, 90, 95, 92, 98, 104, 100, 108, 112, 118, 115, 120, 124],
  },
]

export const ACTION_QUEUE: ActionQueueItem[] = [
  { id: 'withdrawals', count: 8, tone: 'amber', to: '/withdrawals', ready: false },
  { id: 'providers', count: 5, tone: 'amber', to: '/providers', ready: true },
  { id: 'complaints', count: 12, tone: 'red', to: '/complaints', ready: false },
  { id: 'streams', count: 3, tone: 'neutral', to: '/live-streams', ready: false },
]

export const RECENT_ACTIVITY: RecentActivityItem[] = [
  { id: '1', actor: 'Layla T.', actionKey: 'approved_withdrawal', target: 'W-2278', amount: 'SAR 1,200.00', when: '2m', tone: 'positive' },
  { id: '2', actor: 'Ali M.', actionKey: 'verified_provider', target: 'Pearl & Stone', when: '14m', tone: 'positive' },
  { id: '3', actor: 'Khalid B.', actionKey: 'suspended_user', target: 'U-10281', when: '1h', tone: 'negative' },
  { id: '4', actor: 'system', actionKey: 'flagged_withdrawal', target: 'W-2279', amount: 'SAR 8,200', when: '3h', tone: 'warning' },
  { id: '5', actor: 'Mariam K.', actionKey: 'ended_stream', target: 'LS-0047', when: '5h', tone: 'neutral' },
]

export const TOP_PROVIDERS: TopProvider[] = [
  { rank: 1, name: 'Pearl & Stone', categoryKey: 'jewelry', gmv: 218400, share: 17.6, trend: [10, 12, 11, 14, 16, 15, 18, 20] },
  { rank: 2, name: 'Riyadh Antiques Co.', categoryKey: 'antiques', gmv: 184200, share: 14.9, trend: [14, 13, 15, 12, 16, 18, 17, 20] },
  { rank: 3, name: 'Najd Coins & Currency', categoryKey: 'collectibles', gmv: 142800, share: 11.5, trend: [8, 10, 12, 11, 14, 13, 15, 18] },
  { rank: 4, name: 'Desert Luxe Auto', categoryKey: 'automotive', gmv: 124600, share: 10.0, trend: [20, 15, 18, 12, 14, 10, 12, 14] },
  { rank: 5, name: 'Jeddah Vintage Watches', categoryKey: 'watches', gmv: 92400, share: 7.4, trend: [5, 7, 6, 8, 9, 10, 12, 11] },
]

export const GMV_SERIES = [
  80, 85, 82, 90, 95, 92, 88, 98, 104, 100, 96, 108, 112, 118, 115, 108, 112,
  120, 124, 118, 122, 128, 132, 128, 135, 140, 138, 142, 148, 156,
]

export interface CategoryBreakdown {
  key: 'watches' | 'antiques' | 'jewelry' | 'other'
  value: string
  share: number
}

export const CATEGORY_BREAKDOWN: CategoryBreakdown[] = [
  { key: 'watches', value: 'SAR 412K', share: 33 },
  { key: 'antiques', value: 'SAR 318K', share: 26 },
  { key: 'jewelry', value: 'SAR 256K', share: 21 },
  { key: 'other', value: 'SAR 254K', share: 20 },
]
