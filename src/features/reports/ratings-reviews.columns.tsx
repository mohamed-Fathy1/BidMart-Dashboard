import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Star } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { RatingsReviewRow } from '@/types/api'
import { format } from '@/lib/format'
import { localizedPair } from '@/lib/localized-name'

export function useRatingsReviewsColumns(): ColumnDef<RatingsReviewRow>[] {
  const { t, i18n } = useTranslation()

  return useMemo(
    () => [
      {
        id: 'reviewer',
        header: t('reports:ratings.columns.reviewer'),
        cell: ({ row }) => {
          const { reviewerFullName, reviewerUsername } = row.original
          const displayName = reviewerFullName ?? reviewerUsername
          return (
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">{displayName}</span>
              <span className="text-xs text-muted-foreground">@{reviewerUsername}</span>
            </div>
          )
        },
      },
      {
        accessorKey: 'sellerName',
        header: t('reports:ratings.columns.seller'),
        cell: ({ getValue }) => {
          const name = getValue<string>()
          return (
            <span className="max-w-52 truncate text-sm text-foreground" title={name}>
              {name}
            </span>
          )
        },
      },
      {
        id: 'product',
        header: t('reports:ratings.columns.product'),
        cell: ({ row }) => {
          const title = row.original.productTitle
          if (!title) {
            return (
              <span className="max-w-72 truncate text-sm text-muted-foreground">
                {t('reports:common.none')}
              </span>
            )
          }
          return (
            <span className="max-w-72 truncate text-sm text-foreground" title={title}>
              {title}
            </span>
          )
        },
      },
      {
        id: 'category',
        header: t('reports:ratings.columns.category'),
        cell: ({ row }) => {
          const { categoryNameEn, categoryNameAr } = row.original
          const label = localizedPair(categoryNameEn, categoryNameAr, i18n)
          if (!label) {
            return <span className="text-sm text-muted-foreground">{t('reports:common.none')}</span>
          }
          return (
            <span className="max-w-52 truncate text-sm text-foreground" title={label}>
              {label}
            </span>
          )
        },
      },
      {
        accessorKey: 'rating',
        header: t('reports:ratings.columns.rating'),
        cell: ({ getValue }) => {
          const rating = getValue<number>()
          return (
            <span
              className="inline-flex items-center gap-1 text-sm text-foreground"
              aria-label={t('reports:ratings.filters.stars', { count: rating })}
            >
              <Star className="size-3.5 fill-current text-amber-500" />
              <span className="font-mono tabular-nums">{format.number(rating)}</span>
            </span>
          )
        },
      },
      {
        id: 'review',
        header: t('reports:ratings.columns.review'),
        cell: ({ row }) => {
          const review = row.original.review
          if (!review) {
            return <span className="text-sm text-muted-foreground">{t('reports:common.none')}</span>
          }
          return (
            <span className="max-w-72 truncate text-sm text-foreground" title={review}>
              {review}
            </span>
          )
        },
      },
      {
        accessorKey: 'createdAt',
        header: t('reports:ratings.columns.date'),
        cell: ({ getValue }) => (
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {format.date(getValue<string>())}
          </span>
        ),
      },
    ],
    [t, i18n.language],
  )
}
