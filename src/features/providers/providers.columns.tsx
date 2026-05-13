import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { ColumnDef } from '@tanstack/react-table'
import type { ProviderSummary, ProviderVerificationStatus } from '@/types/api'
import { StatusBadge } from '@/components/shared/status-badge'
import { format } from '@/lib/format'
import { localizedName } from '@/lib/localized-name'
import { providerAccountStatusForSellerBadge } from '@/features/providers/providers.api'

export function useProviderColumns(): ColumnDef<ProviderSummary>[] {
  const { t, i18n } = useTranslation()

  return useMemo(
    () => [
      {
        accessorKey: 'accountName',
        header: t('providers:columns.account_name'),
        cell: ({ getValue }) => {
          const name = getValue<string>()
          return (
            <span className="max-w-52 truncate font-medium text-foreground" title={name}>
              {name}
            </span>
          )
        },
      },
      {
        accessorKey: 'phoneNumber',
        header: t('providers:columns.phone'),
        cell: ({ getValue }) => {
          const phone = getValue<string>()
          return (
            <span className="font-mono text-xs tabular-nums text-muted-foreground" title={phone}>
              {phone}
            </span>
          )
        },
      },
      {
        id: 'country',
        header: t('providers:columns.country'),
        cell: ({ row }) => {
          const c = row.original.country
          if (!c) {
            return (
              <span className="text-sm text-muted-foreground">
                {t('components:detail.not_available')}
              </span>
            )
          }
          const label = localizedName(c, i18n)
          return (
            <span className="max-w-36 truncate text-sm text-muted-foreground" title={label}>
              {label}
            </span>
          )
        },
      },
      {
        accessorKey: 'commercialRegistrationNumber',
        header: t('providers:columns.commercial_registration'),
        cell: ({ getValue }) => {
          const cr = getValue<string>()
          return (
            <span className="max-w-28 truncate font-mono text-xs tabular-nums text-muted-foreground" title={cr}>
              {cr}
            </span>
          )
        },
      },
      {
        accessorKey: 'verificationStatus',
        header: t('providers:columns.documents'),
        cell: ({ getValue }) => (
          <StatusBadge
            type="providerVerification"
            status={getValue<ProviderVerificationStatus>()}
          />
        ),
      },
      {
        accessorKey: 'accountStatus',
        header: t('providers:columns.account_status'),
        cell: ({ getValue }) => (
          <StatusBadge
            type="seller"
            status={providerAccountStatusForSellerBadge(getValue<string>())}
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
    [t, i18n.language],
  )
}
