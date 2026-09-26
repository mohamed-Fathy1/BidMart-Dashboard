import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { ColumnDef } from '@tanstack/react-table'
import type { LivestreamReportRow, ShowStatus } from '@/types/api'
import { StatusBadge } from '@/components/shared/status-badge'
import { format } from '@/lib/format'
import { DateCell, TruncatedTextCell } from '@/features/reports/report-cells'

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
            <TruncatedTextCell text={row.original.title} className="max-w-64 font-medium" />
            <TruncatedTextCell
              text={row.original.hostName}
              className="max-w-64 text-xs text-muted-foreground"
            />
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
        cell: ({ getValue }) => <DateCell iso={getValue<string>()} withTime />,
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
