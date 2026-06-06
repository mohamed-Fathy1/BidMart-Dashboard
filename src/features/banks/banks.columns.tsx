import { type ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { Landmark } from 'lucide-react'
import type { Bank } from '@/types/api'
import { StatusBadge } from '@/components/shared/status-badge'
import { format } from '@/lib/format'

export function useBankColumns(): ColumnDef<Bank>[] {
  const { t, i18n } = useTranslation()
  const isAr = i18n.language === 'ar'

  return [
    {
      id: 'bank',
      accessorFn: (row) => row.nameEn,
      header: t('banks:columns.bank'),
      cell: ({ row }) => {
        const b = row.original
        return (
          <div className="flex max-w-[min(100%,320px)] items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted/60 text-muted-foreground">
              <Landmark className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-foreground">{b.nameEn}</p>
              <p className="truncate text-sm text-muted-foreground" dir="rtl">
                {b.nameAr}
              </p>
            </div>
          </div>
        )
      },
      size: 320,
      enableSorting: false,
    },
    {
      id: 'country',
      header: t('banks:columns.country'),
      cell: ({ row }) => {
        const b = row.original
        const label = isAr ? b.countryNameAr : b.countryNameEn
        return (
          <span className="text-sm text-foreground">
            {label ?? <span className="text-muted-foreground">—</span>}
          </span>
        )
      },
      size: 200,
      enableSorting: false,
    },
    {
      accessorKey: 'isActive',
      header: t('banks:columns.status'),
      cell: ({ getValue }) => (
        <StatusBadge type="boolean" status={getValue<boolean>() ? 'true' : 'false'} />
      ),
      size: 120,
    },
    {
      accessorKey: 'createdAt',
      header: t('banks:columns.created_at'),
      cell: ({ getValue }) => (
        <span className="font-mono text-sm tabular-nums text-muted-foreground">
          {format.date(getValue<string>())}
        </span>
      ),
      size: 140,
    },
  ]
}
