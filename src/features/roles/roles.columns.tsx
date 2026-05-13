import { type ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { Layers2, Shield } from 'lucide-react'
import type { RoleListItem } from '@/types/api'
import { Badge } from '@/components/ui/badge'
import { format } from '@/lib/format'
import { localizedName } from '@/lib/localized-name'
import { cn } from '@/lib/utils'

export function useRoleColumns(): ColumnDef<RoleListItem>[] {
  const { t, i18n } = useTranslation()
  const isAr = i18n.language === 'ar'

  return [
    {
      id: 'name_display',
      accessorFn: (row) => localizedName(row, i18n),
      header: t('roles:columns.name'),
      size: 220,
      cell: ({ row }) => {
        const primary = localizedName(row.original, i18n)
        const secondary = isAr ? row.original.name_en : row.original.name_ar
        return (
          <div className="flex min-w-40 flex-col gap-0.5 py-0.5">
            <span className="font-medium tracking-tight text-foreground">{primary}</span>
            <span
              className="line-clamp-2 text-xs leading-snug text-muted-foreground"
              dir={isAr ? 'ltr' : 'rtl'}
            >
              {secondary}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'adminCount',
      header: t('roles:columns.admin_count'),
      cell: ({ getValue }) => (
        <span className="inline-flex min-w-10 items-center justify-center rounded-md border border-border bg-muted/40 px-2 py-0.5 font-mono text-sm tabular-nums text-foreground">
          {getValue<number>()}
        </span>
      ),
      size: 100,
    },
    {
      accessorKey: 'isProtected',
      header: t('roles:columns.type'),
      cell: ({ getValue }) => {
        const system = getValue<boolean>()
        return (
          <span className="inline-flex items-center gap-1.5">
            {system ? (
              <Badge
                variant="outline"
                className={cn(
                  'gap-1 border-primary/25 bg-primary/5 font-medium text-primary',
                  'shadow-none',
                )}
              >
                <Shield className="size-3.5 shrink-0 opacity-90" aria-hidden />
                {t('roles:badges.system')}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="gap-1 border-border font-normal text-muted-foreground shadow-none"
              >
                <Layers2 className="size-3.5 shrink-0 opacity-80" aria-hidden />
                {t('roles:badges.custom')}
              </Badge>
            )}
          </span>
        )
      },
      size: 140,
      enableSorting: false,
    },
    {
      accessorKey: 'createdAt',
      header: t('roles:columns.created_at'),
      cell: ({ getValue }) => (
        <span className="font-mono text-sm tabular-nums text-muted-foreground">
          {format.date(getValue<string>())}
        </span>
      ),
      size: 128,
    },
  ]
}
