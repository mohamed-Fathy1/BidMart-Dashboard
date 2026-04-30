import { type ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import type { Country } from '@/types/api'
import { StatusBadge } from '@/components/shared/status-badge'
import { ImagePreview } from '@/components/shared/image-preview'
import { format } from '@/lib/format'

export function useCountryColumns(): ColumnDef<Country>[] {
  const { t } = useTranslation()

  return [
    {
      accessorKey: 'image_url',
      header: t('countries:columns.flag'),
      cell: ({ row }) => (
        <ImagePreview src={row.original.image_url} alt={row.original.name_en} size="sm" />
      ),
      size: 60,
      enableSorting: false,
    },
    {
      accessorKey: 'name_en',
      header: t('countries:columns.name_en'),
      size: 180,
    },
    {
      accessorKey: 'name_ar',
      header: t('countries:columns.name_ar'),
      size: 180,
    },
    {
      accessorKey: 'iso_code',
      header: t('countries:columns.iso_code'),
      cell: ({ getValue }) => (
        <span className="font-mono tabular-nums">{getValue<string>()}</span>
      ),
      size: 100,
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
        <span className="font-mono tabular-nums">{getValue<number>()}</span>
      ),
      size: 100,
    },
    {
      accessorKey: 'created_at',
      header: t('countries:columns.created_at'),
      cell: ({ getValue }) => (
        <span className="font-mono tabular-nums">{format.date(getValue<string>())}</span>
      ),
      size: 140,
    },
  ]
}
