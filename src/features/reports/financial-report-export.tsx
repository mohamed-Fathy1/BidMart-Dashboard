import { useMutation } from '@tanstack/react-query'
import { Download, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  exportFinancialReport,
  type ExportedFile,
  type FinancialExportFormat,
  type FinancialReportFilters,
} from '@/features/reports/reports.api'
import type { ReportDateRange } from '@/types/api'
import type { ApiRejection } from '@/lib/axios'
import { saveBlob } from '@/lib/download'

interface FinancialReportExportProps {
  filters: FinancialReportFilters
  resolvedWindow: ReportDateRange | undefined
  disabled?: boolean
}

/**
 * Exports the whole filtered set, not the page, so it stays enabled on an
 * empty table. The server refuses above 10,000 rows with
 * `REPORT_EXPORT_TOO_LARGE`, which gets its own message.
 */
export function FinancialReportExport({
  filters,
  resolvedWindow,
  disabled = false,
}: FinancialReportExportProps) {
  const { t } = useTranslation()

  const exportMutation = useMutation<ExportedFile, ApiRejection, FinancialExportFormat>({
    mutationFn: (format) => exportFinancialReport(filters, format, resolvedWindow),
    onSuccess: ({ blob, filename }) => {
      saveBlob(blob, filename)
      toast.success(t('reports:financial.export.started'))
    },
    onError: (error) =>
      toast.error(
        error.code === 'REPORT_EXPORT_TOO_LARGE'
          ? t('reports:errors.REPORT_EXPORT_TOO_LARGE')
          : t('reports:financial.export.failed'),
      ),
  })

  const isExporting = exportMutation.isPending

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled || isExporting}>
          {isExporting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          {isExporting ? t('reports:financial.export.busy') : t('reports:financial.export.button')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => exportMutation.mutate('xlsx')}>
          {t('reports:financial.export.xlsx')}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => exportMutation.mutate('pdf')}>
          {t('reports:financial.export.pdf')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
