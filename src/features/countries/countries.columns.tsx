import { type ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import type { Country } from '@/types/api'
import { StatusBadge } from '@/components/shared/status-badge'
import { ImagePreview } from '@/components/shared/image-preview'
import { format } from '@/lib/format'
import { cn } from '@/lib/utils'

export function useCountryColumns(): ColumnDef<Country>[] {
  const { t } = useTranslation()

  return [
    {
      id: 'country',
      accessorFn: (row) => row.name_en,
      header: t('countries:columns.country'),
      cell: ({ row }) => {
        const c = row.original
        return (
          <div className="flex max-w-[min(100%,280px)] items-center gap-3">
            <ImagePreview
              src={c.image_url}
              alt={c.name_en}
              size="md"
              className="ring-1 ring-border/80"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-foreground">{c.name_en}</p>
              <p className="truncate text-sm text-muted-foreground" dir="rtl">
                {c.name_ar}
              </p>
            </div>
          </div>
        )
      },
      size: 280,
      enableSorting: false,
    },
    {
      accessorKey: 'iso_code',
      header: t('countries:columns.iso_code'),
      cell: ({ getValue }) => (
        <span
          className={cn(
            'inline-flex rounded-md border border-border bg-muted/60 px-2 py-0.5',
            'font-mono text-xs tabular-nums tracking-wide text-foreground',
          )}
        >
          {getValue<string>()}
        </span>
      ),
      size: 96,
    },
    {
      accessorKey: 'is_enabled',
      header: t('countries:columns.enabled'),
      cell: ({ getValue }) => (
        <StatusBadge type="boolean" status={getValue<boolean>() ? 'true' : 'false'} />
      ),
      size: 120,
    },
    {
      accessorKey: 'sort_order',
      header: t('countries:columns.sort_order'),
      cell: ({ getValue }) => (
        <span className="font-mono text-sm tabular-nums text-muted-foreground">
          {getValue<number>()}
        </span>
      ),
      size: 88,
    },
    {
      accessorKey: 'created_at',
      header: t('countries:columns.created_at'),
      cell: ({ getValue }) => (
        <span className="font-mono text-sm tabular-nums text-muted-foreground">
          {format.date(getValue<string>())}
        </span>
      ),
      size: 132,
    },
  ]
}
