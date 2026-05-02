import { type ColumnDef } from '@tanstack/react-table'
import { Shield } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { AdminAccountListItem } from '@/types/api'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { format } from '@/lib/format'

export function useAdminColumns(): ColumnDef<AdminAccountListItem>[] {
  const { t, i18n } = useTranslation()

  return [
    {
      accessorKey: 'fullName',
      header: t('admins:columns.full_name'),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.fullName}</span>
      ),
      size: 180,
    },
    {
      accessorKey: 'email',
      header: t('admins:columns.email'),
      cell: ({ getValue }) => {
        const v = getValue<string>()
        return (
          <span className="min-w-0 truncate text-sm text-muted-foreground" title={v}>
            {v}
          </span>
        )
      },
      size: 220,
    },
    {
      accessorKey: 'phone',
      header: t('admins:columns.phone'),
      cell: ({ row }) =>
        row.original.phone ? (
          <span className="font-mono text-sm tabular-nums text-foreground/90" dir="ltr">
            {row.original.phone}
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
      size: 150,
    },
    {
      id: 'role',
      accessorFn: (row) => (i18n.language === 'ar' ? row.role.name_ar : row.role.name_en),
      header: t('admins:columns.role'),
      cell: ({ row }) => {
        const label =
          i18n.language === 'ar' ? row.original.role.name_ar : row.original.role.name_en
        return (
          <Badge
            variant="outline"
            title={label}
            className="max-w-44 justify-start truncate border-border font-normal shadow-none"
          >
            <span className="truncate">{label}</span>
          </Badge>
        )
      },
      size: 148,
    },
    {
      accessorKey: 'isActive',
      header: t('admins:columns.status'),
      cell: ({ row }) => (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
            'transition-[color,background-color,border-color] duration-(--duration-hover) ease-(--ease-default)',
            row.original.isActive
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-border bg-muted/80 text-muted-foreground',
          )}
        >
          <span
            className={cn(
              'size-1.5 shrink-0 rounded-full',
              row.original.isActive ? 'bg-emerald-500' : 'bg-muted-foreground/50',
            )}
          />
          {row.original.isActive ? t('admins:status.active') : t('admins:status.blocked')}
        </span>
      ),
      size: 120,
    },
    {
      accessorKey: 'isSuperAdmin',
      header: t('admins:columns.account_type'),
      cell: ({ row }) =>
        row.original.isSuperAdmin ? (
          <Badge
            variant="outline"
            className="gap-1 border-border font-normal shadow-none"
          >
            <Shield className="size-3.5 shrink-0" aria-hidden />
            <span>{t('admins:badges.super_admin')}</span>
          </Badge>
        ) : (
          <Badge variant="outline" className="border-transparent bg-muted/50 font-normal text-muted-foreground shadow-none">
            {t('admins:badges.standard')}
          </Badge>
        ),
      size: 148,
    },
    {
      accessorKey: 'lastLoginAt',
      header: t('admins:columns.last_login'),
      cell: ({ getValue }) => {
        const v = getValue<string | null>()
        return v ? (
          <span className="font-mono text-sm tabular-nums text-foreground/90">
            {format.dateTime(v)}
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      },
      size: 168,
    },
    {
      accessorKey: 'createdAt',
      header: t('admins:columns.created_at'),
      cell: ({ getValue }) => (
        <span className="font-mono text-sm tabular-nums text-muted-foreground">
          {format.date(getValue<string>())}
        </span>
      ),
      size: 128,
    },
  ]
}
