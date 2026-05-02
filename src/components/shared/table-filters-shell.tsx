import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TableFiltersShellProps {
  children: ReactNode
  /** Optional trailing line (e.g. total count with `format.number`) */
  meta?: ReactNode
  className?: string
}

/** Card-style shell for filters above server-paginated `DataTable`s — aligns with admins/providers pattern. */
export function TableFiltersShell({ children, meta, className }: TableFiltersShellProps) {
  return (
    <div
      data-slot="table-filters-shell"
      className={cn(
        'rounded-xl border border-border bg-card p-4 shadow-rest',
        'transition-[background-color] duration-(--duration-hover) ease-(--ease-default)',
        className,
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-3">{children}</div>
        {meta != null && (
          <p className="text-sm text-muted-foreground lg:text-end">{meta}</p>
        )}
      </div>
    </div>
  )
}
