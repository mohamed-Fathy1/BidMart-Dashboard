import { type ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import type { SubCategoryListItem } from '@/types/api'
import { StatusBadge } from '@/components/shared/status-badge'
import { ImagePreview } from '@/components/shared/image-preview'
import { format } from '@/lib/format'

export function useSubCategoryColumns(options?: {
  showParent?: boolean
}): ColumnDef<SubCategoryListItem>[] {
  const { t } = useTranslation()
  const showParent = options?.showParent === true

  const cols: ColumnDef<SubCategoryListItem>[] = [
    {
      accessorKey: 'image_url',
      header: t('categories:sub.columns.image'),
      cell: ({ row }) => (
        <ImagePreview
          src={row.original.image_url}
          alt={row.original.name_en}
          size="sm"
          className="ring-1 ring-border/80"
        />
      ),
      size: 60,
      enableSorting: false,
    },
  ]

  if (showParent) {
    cols.push({
      id: 'parentCategory',
      header: t('categories:sub.columns.parent_category'),
      cell: ({ row }) => {
        const p = row.original.parentCategory
        if (!p) return <span className="text-muted-foreground">—</span>
        return (
          <div className="min-w-0 space-y-0.5">
            <p className="truncate font-medium text-foreground">{p.name_en}</p>
            <p className="truncate text-sm text-muted-foreground" dir="rtl">
              {p.name_ar}
            </p>
          </div>
        )
      },
      size: 200,
      enableSorting: false,
    })
  }

  cols.push(
    {
      accessorKey: 'name_en',
      header: t('categories:sub.columns.name_en'),
      cell: ({ getValue }) => (
        <span className="font-medium text-foreground">{getValue<string>()}</span>
      ),
      size: 200,
    },
    {
      accessorKey: 'name_ar',
      header: t('categories:sub.columns.name_ar'),
      cell: ({ getValue }) => (
        <span className="font-medium text-foreground" dir="rtl">
          {getValue<string>()}
        </span>
      ),
      size: 200,
    },
    {
      accessorKey: 'display_order',
      header: t('categories:sub.columns.display_order'),
      cell: ({ getValue }) => (
        <span className="font-mono tabular-nums text-muted-foreground">{getValue<number>()}</span>
      ),
      size: 120,
    },
    {
      accessorKey: 'is_active',
      header: t('categories:sub.columns.active'),
      cell: ({ getValue }) => (
        <StatusBadge type="boolean" status={getValue<boolean>() ? 'true' : 'false'} />
      ),
      size: 100,
    },
    {
      accessorKey: 'created_at',
      header: t('categories:sub.columns.created_at'),
      cell: ({ getValue }) => (
        <span className="font-mono tabular-nums text-sm text-muted-foreground">
          {format.date(getValue<string>())}
        </span>
      ),
      size: 140,
    },
  )

  return cols
}
