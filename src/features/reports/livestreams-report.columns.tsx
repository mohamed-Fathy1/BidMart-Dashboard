import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { ColumnDef } from '@tanstack/react-table'
import type { LivestreamReportRow, ShowStatus } from '@/types/api'
import { StatusBadge } from '@/components/shared/status-badge'
import { format } from '@/lib/format'

export function useLivestreamsReportColumns(): ColumnDef<LivestreamReportRow>[] {
  const { t } = useTranslation()

  return useMemo(
    () => [
      {
        id: 'show',
        header: t('reports:livestreams.columns.show'),
        enableSorting: false,
        cell: ({ row }) => (
          <div className="min-w-0">
            <p
              className="text-sm font-medium truncate max-w-64"
              title={row.original.title}
            >
              {row.original.title}
            </p>
            <p className="text-xs text-muted-foreground">{row.original.hostName}</p>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: t('reports:livestreams.columns.status'),
        enableSorting: false,
        cell: ({ getValue }) => <StatusBadge type="show" status={getValue<ShowStatus>()} />,
      },
      {
        accessorKey: 'broadcastDate',
        header: t('reports:livestreams.columns.broadcast'),
        enableSorting: false,
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground">
            {format.dateTime(getValue<string>())}
          </span>
        ),
      },
      {
        accessorKey: 'durationMinutes',
        header: t('reports:livestreams.columns.duration'),
        enableSorting: false,
        cell: ({ getValue }) => (
          <span className="font-mono tabular-nums">{format.duration(getValue<number>())}</span>
        ),
      },
      {
        accessorKey: 'views',
        header: () => <div className="text-end">{t('reports:livestreams.columns.views')}</div>,
        enableSorting: false,
        cell: ({ getValue }) => (
          <div className="text-end font-mono tabular-nums">{format.number(getValue<number>())}</div>
        ),
      },
      {
        accessorKey: 'peakViewers',
        header: () => <div className="text-end">{t('reports:livestreams.columns.peak')}</div>,
        enableSorting: false,
        cell: ({ getValue }) => (
          <div className="text-end font-mono tabular-nums">{format.number(getValue<number>())}</div>
        ),
      },
      {
        accessorKey: 'comments',
        header: () => <div className="text-end">{t('reports:livestreams.columns.comments')}</div>,
        enableSorting: false,
        cell: ({ getValue }) => (
          <div className="text-end font-mono tabular-nums">{format.number(getValue<number>())}</div>
        ),
      },
      {
        accessorKey: 'ordersCount',
        header: () => <div className="text-end">{t('reports:livestreams.columns.orders')}</div>,
        enableSorting: false,
        cell: ({ getValue }) => (
          <div className="text-end font-mono tabular-nums">{format.number(getValue<number>())}</div>
        ),
      },
      {
        accessorKey: 'sales',
        header: () => <div className="text-end">{t('reports:livestreams.columns.sales')}</div>,
        enableSorting: false,
        cell: ({ getValue }) => (
          <div className="text-end font-mono tabular-nums font-medium">
            {format.currency(getValue<number>())}
          </div>
        ),
      },
    ],
    [t],
  )
}
