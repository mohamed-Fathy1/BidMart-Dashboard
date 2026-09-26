import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RankedList } from '@/components/shared/ranked-list'
import { MetricBand } from '@/components/shared/metric-band'
import { MetricValue } from '@/components/shared/metric-value'
import { useStatisticsQuery } from '@/features/overview/overview.queries'
import { StatisticsTabFrame } from '@/features/overview/statistics-tab-frame'
import { format } from '@/lib/format'
import { localizedPair } from '@/lib/localized-name'

export function BusinessActivityTab() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const query = useStatisticsQuery('business-activity')

  return (
    <StatisticsTabFrame query={query} skeletonCount={3}>
      {(data) => (
        <>
          <MetricBand
            columns={3}
            items={[
              {
                key: 'live_shows',
                label: t('overview:business.live_shows'),
                value: <MetricValue value={data.liveShows} />,
              },
              {
                key: 'completed_deals',
                label: t('overview:business.completed_deals'),
                value: <MetricValue value={data.completedDeals} />,
              },
              {
                key: 'total_sales',
                label: t('overview:business.total_sales'),
                value: <MetricValue value={data.totalSales} currency />,
              },
            ]}
          />

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('overview:business.top_categories')}</CardTitle>
                <CardDescription>{t('overview:business.top_categories_hint')}</CardDescription>
              </CardHeader>
              <CardContent>
                <RankedList
                  items={data.topCategories}
                  getKey={(category) => category.categoryId}
                  metric={(category) => category.revenue}
                  primary={(category) => localizedPair(category.nameEn, category.nameAr, i18n)}
                  secondary={(category) =>
                    i18n.language === 'ar' ? category.nameEn : category.nameAr
                  }
                  value={(category) => format.currency(category.revenue)}
                  count={(category) =>
                    t('overview:business.orders_count', { count: category.orderCount })
                  }
                  onSelect={(category) =>
                    navigate({
                      to: '/categories/$categoryId/sub-categories',
                      params: { categoryId: category.categoryId },
                    })
                  }
                  emptyLabel={t('overview:business.empty')}
                  ariaLabel={t('overview:business.top_categories')}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('overview:business.top_sellers')}</CardTitle>
                <CardDescription>{t('overview:business.top_sellers_hint')}</CardDescription>
              </CardHeader>
              <CardContent>
                <RankedList
                  items={data.topSellers}
                  getKey={(seller) => seller.sellerId}
                  metric={(seller) => seller.revenue}
                  leading={(seller) => (
                    <Avatar className="size-8">
                      <AvatarImage
                        src={seller.profilePicture ?? undefined}
                        alt={seller.fullName ?? seller.username}
                      />
                      <AvatarFallback>
                        {(seller.fullName ?? seller.username).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  primary={(seller) => seller.fullName ?? seller.username}
                  secondary={(seller) => <bdi dir="ltr">@{seller.username}</bdi>}
                  value={(seller) => format.currency(seller.revenue)}
                  count={(seller) =>
                    t('overview:business.orders_count', { count: seller.orderCount })
                  }
                  onSelect={(seller) =>
                    navigate({ to: '/users/$userId', params: { userId: seller.sellerId } })
                  }
                  emptyLabel={t('overview:business.empty')}
                  ariaLabel={t('overview:business.top_sellers')}
                />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </StatisticsTabFrame>
  )
}
