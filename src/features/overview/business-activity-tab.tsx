import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RankedList } from '@/components/shared/ranked-list'
import { StatCard } from '@/components/shared/stat-card'
import { StatisticsErrorCard } from '@/features/overview/statistics-error-card'
import { StatisticsTileSkeleton } from '@/features/overview/statistics-tab-skeleton'
import { StatisticsWindowLabel } from '@/features/overview/statistics-window-label'
import { useStatisticsWindow } from '@/features/overview/use-statistics-window'
import { useBusinessActivityQuery } from '@/features/overview/overview.queries'
import { format } from '@/lib/format'
import { localizedPair } from '@/lib/localized-name'
import { cn } from '@/lib/utils'

export function BusinessActivityTab() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { params, anchorError } = useStatisticsWindow()
  const { data, isPending, isFetching, isError, error, refetch } = useBusinessActivityQuery(params, {
    enabled: !anchorError,
  })

  return (
    <div
      className={cn(
        'space-y-6 transition-opacity duration-(--duration-hover) ease-(--ease-default)',
        isFetching && !isPending && 'opacity-60',
      )}
      aria-busy={isFetching && !isPending}
    >
      <StatisticsWindowLabel range={data?.dateRange} isPending={isPending} />

      {isPending ? (
        <StatisticsTileSkeleton count={3} />
      ) : isError ? (
        <StatisticsErrorCard error={error} onRetry={() => void refetch()} />
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label={t('overview:business.live_shows')}
              value={format.number(data.liveShows)}
            />
            <StatCard
              label={t('overview:business.completed_deals')}
              value={format.number(data.completedDeals)}
            />
            <StatCard
              label={t('overview:business.total_sales')}
              value={format.currency(data.totalSales)}
            />
          </div>

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
                  secondary={(seller) => `@${seller.username}`}
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
      ) : null}
    </div>
  )
}
