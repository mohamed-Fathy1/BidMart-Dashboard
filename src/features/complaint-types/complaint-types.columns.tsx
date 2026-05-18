import { type ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import type { ComplaintType } from '@/types/api'
import { StatusBadge } from '@/components/shared/status-badge'
import { format } from '@/lib/format'

export function useComplaintTypeColumns(): ColumnDef<ComplaintType>[] {
  const { t } = useTranslation()

  return [
    {
      id: 'name',
      accessorFn: (row) => row.name_en,
      header: t('complaint-types:columns.name'),
      cell: ({ row }) => {
        const ct = row.original
        return (
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{ct.name_en}</p>
            <p className="truncate text-sm text-muted-foreground" dir="rtl">
              {ct.name_ar}
            </p>
          </div>
        )
      },
      size: 320,
      enableSorting: false,
    },
    {
      accessorKey: 'is_active',
      header: t('complaint-types:columns.status'),
      cell: ({ getValue }) => (
        <StatusBadge type="boolean" status={getValue<boolean>() ? 'true' : 'false'} />
      ),
      size: 120,
    },
    {
      accessorKey: 'created_at',
      header: t('complaint-types:columns.created_at'),
      cell: ({ getValue }) => (
        <span className="font-mono text-sm tabular-nums text-muted-foreground">
          {format.date(getValue<string>())}
        </span>
      ),
      size: 132,
    },
  ]
}
