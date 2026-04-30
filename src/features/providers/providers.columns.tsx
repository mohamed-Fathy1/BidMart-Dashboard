import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { ColumnDef } from '@tanstack/react-table'
import type { ProviderSummary } from '@/types/api'
import { StatusBadge } from '@/components/shared/status-badge'
import { format } from '@/lib/format'

export function useProviderColumns(): ColumnDef<ProviderSummary>[] {
  const { t } = useTranslation()

  return useMemo(
    () => [
      {
        accessorKey: 'nameEn',
        header: t('providers:columns.name_en'),
      },
      {
        accessorKey: 'nameAr',
        header: t('providers:columns.name_ar'),
      },
      {
        accessorKey: 'user.fullName',
        header: t('providers:columns.owner'),
      },
      {
        accessorKey: 'user.email',
        header: t('providers:columns.email'),
        cell: ({ getValue }) => (
          <span className="font-mono text-xs">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: t('providers:columns.status'),
        cell: ({ getValue }) => (
          <StatusBadge type="seller" status={getValue<string>()} />
        ),
      },
      {
        accessorKey: 'isVerified',
        header: t('providers:columns.verified'),
        cell: ({ getValue }) => (
          <StatusBadge
            type="boolean"
            status={getValue<boolean>() ? 'true' : 'false'}
          />
        ),
      },
      {
        accessorKey: 'createdAt',
        header: t('providers:columns.created_at'),
        cell: ({ getValue }) => (
          <span className="font-mono text-xs tabular-nums">
            {format.dateTime(getValue<string>())}
          </span>
        ),
      },
    ],
    [t],
  )
}
