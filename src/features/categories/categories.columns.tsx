import { type ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import type { Category } from '@/types/api'
import { StatusBadge } from '@/components/shared/status-badge'
import { ImagePreview } from '@/components/shared/image-preview'
import { format } from '@/lib/format'
import { cn } from '@/lib/utils'

export function useCategoryColumns(): ColumnDef<Category>[] {
  const { t } = useTranslation()

  return [
    {
      id: 'media',
      header: t('categories:columns.media'),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <ImagePreview
            src={row.original.image_url}
            alt={row.original.name_en}
            size="sm"
            className="ring-1 ring-border/80"
          />
          <ImagePreview
            src={row.original.icon_url}
            alt=""
            size="sm"
            className="ring-1 ring-border/80"
          />
        </div>
      ),
      size: 88,
      enableSorting: false,
    },
    {
      accessorKey: 'name_en',
      header: t('categories:columns.name_en'),
      cell: ({ getValue }) => (
        <span className="font-medium text-foreground">{getValue<string>()}</span>
      ),
      size: 200,
    },
    {
      accessorKey: 'name_ar',
      header: t('categories:columns.name_ar'),
      cell: ({ getValue }) => (
        <span className="font-medium text-foreground" dir="rtl">
          {getValue<string>()}
        </span>
      ),
      size: 200,
    },
    {
      accessorKey: 'subCategoriesCount',
      header: t('categories:columns.sub_count'),
      cell: ({ getValue }) => (
        <span
          className={cn(
            'inline-flex min-w-9 justify-center rounded-full bg-muted px-2.5 py-0.5',
            'text-center text-xs font-mono tabular-nums text-muted-foreground',
          )}
        >
          {format.number(getValue<number>())}
        </span>
      ),
      size: 120,
    },
    {
      accessorKey: 'display_order',
      header: t('categories:columns.display_order'),
      cell: ({ getValue }) => (
        <span className="font-mono tabular-nums text-muted-foreground">{getValue<number>()}</span>
      ),
      size: 100,
    },
    {
      accessorKey: 'is_active',
      header: t('categories:columns.active'),
      cell: ({ getValue }) => (
        <StatusBadge type="boolean" status={getValue<boolean>() ? 'true' : 'false'} />
      ),
      size: 100,
    },
    {
      accessorKey: 'created_at',
      header: t('categories:columns.created_at'),
      cell: ({ getValue }) => (
        <span className="font-mono tabular-nums text-sm text-muted-foreground">
          {format.date(getValue<string>())}
        </span>
      ),
      size: 140,
    },
  ]
}
