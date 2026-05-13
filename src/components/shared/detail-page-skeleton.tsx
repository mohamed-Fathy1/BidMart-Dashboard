import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface DetailPageSkeletonProps {
  /** Number of secondary cards in the lower grid. Defaults to 2. */
  cards?: number
  /** Render a hero card with image + content. Defaults to true. */
  hero?: boolean
  /** Show the back-button bar above the title. Defaults to true. */
  showBack?: boolean
  /** Render action buttons next to the title. Defaults to true. */
  showActions?: boolean
  className?: string
}

/**
 * Standard skeleton for a single-record detail page. Composed from:
 * 1. Back button + title + subtitle + actions row.
 * 2. Optional hero card with image + status pills.
 * 3. Grid of secondary detail cards.
 *
 * Replaces per-page hand-rolled skeletons (user-detail, provider-detail) so the
 * loading state stays consistent as new detail surfaces ship.
 */
export function DetailPageSkeleton({
  cards = 2,
  hero = true,
  showBack = true,
  showActions = true,
  className,
}: DetailPageSkeletonProps) {
  return (
    <div className={cn('space-y-8', className)} aria-busy="true" aria-live="polite">
      <div className="space-y-3">
        {showBack && <Skeleton className="h-7 w-20 rounded-md" />}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-8 w-[min(100%,320px)]" />
            <Skeleton className="h-4 w-[min(100%,440px)]" />
          </div>
          {showActions && (
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-9 w-28 rounded-md" />
              <Skeleton className="h-9 w-24 rounded-md" />
            </div>
          )}
        </div>
      </div>

      {hero && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-rest sm:p-8">
          <div className="flex flex-col gap-8 sm:flex-row">
            <Skeleton className="size-24 shrink-0 rounded-xl" />
            <div className="grid min-w-0 flex-1 gap-5">
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-28 rounded-full" />
                <Skeleton className="h-6 w-32 rounded-full" />
                <Skeleton className="h-6 w-36 rounded-full" />
              </div>
              <Skeleton className="h-20 max-w-xl rounded-lg" />
            </div>
          </div>
        </div>
      )}

      {cards > 0 && (
        <div
          className={cn(
            'grid gap-6',
            cards === 1
              ? 'grid-cols-1'
              : cards === 2
                ? 'lg:grid-cols-2'
                : 'lg:grid-cols-2 xl:grid-cols-3',
          )}
        >
          {Array.from({ length: cards }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      )}
    </div>
  )
}
