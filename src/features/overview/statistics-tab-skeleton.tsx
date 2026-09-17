import { Skeleton } from '@/components/ui/skeleton'

interface StatisticsTileSkeletonProps {
  count: number
}

export function StatisticsTileSkeleton({ count }: StatisticsTileSkeletonProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <Skeleton key={index} className="h-[92px] rounded-lg" />
      ))}
    </div>
  )
}
