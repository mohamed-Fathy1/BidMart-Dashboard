import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface LoadingTableProps {
  rows?: number
  cols?: number
  className?: string
}

export function LoadingTable({ rows = 5, cols = 5, className }: LoadingTableProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-border bg-card shadow-rest',
        className,
      )}
    >
      <div className="h-10 border-b border-border bg-muted" />
      {Array.from({ length: rows }).map((_, ri) => (
        <div
          key={ri}
          className={cn(
            'flex h-(--table-row-height) items-center gap-4 px-4',
            ri < rows - 1 && 'border-b border-border',
          )}
          style={{ height: 'var(--table-row-height, 48px)' }}
        >
          {Array.from({ length: cols }).map((__, ci) => (
            <Skeleton
              key={ci}
              className={cn(
                'h-3.5',
                ci === 0 ? 'flex-[2]' : 'flex-1',
                ci === cols - 1 && 'max-w-20',
              )}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
