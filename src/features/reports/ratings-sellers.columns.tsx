import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Star } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { RatingsSellerRow } from '@/types/api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format } from '@/lib/format'

export function useRatingsSellersColumns(): ColumnDef<RatingsSellerRow>[] {
  const { t } = useTranslation()

  return useMemo(
    () => [
      {
        id: 'seller',
        header: t('reports:ratings.columns.seller'),
        cell: ({ row }) => {
          const { sellerName, username, profilePicture } = row.original
          const fallback = sellerName.charAt(0).toUpperCase()
          return (
            <div className="flex items-center gap-3">
              <Avatar className="size-8">
                <AvatarImage src={profilePicture ?? undefined} alt={sellerName} />
                <AvatarFallback>{fallback}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="max-w-52 truncate text-sm font-medium text-foreground" title={sellerName}>
                  {sellerName}
                </span>
                <span className="text-xs text-muted-foreground">@{username}</span>
              </div>
            </div>
          )
        },
      },
      {
        id: 'average',
        header: t('reports:ratings.columns.average'),
        cell: ({ row }) => {
          const { averageRating } = row.original
          if (averageRating === null) {
            return (
              <span className="text-sm text-muted-foreground">{t('reports:ratings.summary.no_ratings')}</span>
            )
          }
          const value = format.number(Number(averageRating.toFixed(1)))
          return (
            <span className="inline-flex items-center gap-1 text-sm text-foreground">
              <Star className="size-3.5 fill-current text-amber-500" />
              <span className="font-mono tabular-nums">{value}</span>
            </span>
          )
        },
      },
      {
        accessorKey: 'reviewCount',
        header: t('reports:ratings.columns.reviews'),
        cell: ({ getValue }) => (
          <span className="block text-end font-mono text-sm tabular-nums text-foreground">
            {format.number(getValue<number>())}
          </span>
        ),
      },
    ],
    [t],
  )
}
