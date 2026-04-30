import { type ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import type { Category } from '@/types/api'
import { StatusBadge } from '@/components/shared/status-badge'
import { ImagePreview } from '@/components/shared/image-preview'
import { format } from '@/lib/format'

export function useCategoryColumns(): ColumnDef<Category>[] {
  const { t } = useTranslation()

  return [
    {
      accessorKey: 'image_url',
      header: t('categories:columns.image'),
      cell: ({ row }) => (
        <ImagePreview src={row.original.image_url} alt={row.original.name_en} size="sm" />
      ),
      size: 60,
      enableSorting: false,
    },
    {
      accessorKey: 'name_en',
      header: t('categories:columns.name_en'),
      size: 200,
    },
    {
      accessorKey: 'name_ar',
      header: t('categories:columns.name_ar'),
      size: 200,
    },
    {
      accessorKey: 'display_order',
      header: t('categories:columns.display_order'),
      cell: ({ getValue }) => (
        <span className="font-mono tabular-nums">{getValue<number>()}</span>
      ),
      size: 120,
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
        <span className="font-mono tabular-nums">{format.date(getValue<string>())}</span>
      ),
      size: 140,
    },
  ]
}
