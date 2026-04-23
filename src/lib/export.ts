import { i18n } from '@/lib/i18n'

interface Column {
  header: string
  key: string
}

export function exportToXlsx(
  rows: Record<string, unknown>[],
  columns: Column[],
  filename: string,
): void {
  import('xlsx').then(({ utils, writeFile }) => {
    const headers = columns.map((c) => c.header)
    const data = rows.map((row) => columns.map((col) => row[col.key]))
    const ws = utils.aoa_to_sheet([headers, ...data])
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, 'Sheet1')
    writeFile(wb, `${filename}.xlsx`)
  })
}

export function exportToPdf(
  rows: Record<string, unknown>[],
  columns: Column[],
  filename: string,
  meta?: { title?: string },
): void {
  import('jspdf').then(({ jsPDF }) => {
    import('jspdf-autotable').then(() => {
      const isRtl = i18n.language === 'ar'
      const doc = new jsPDF({ orientation: 'landscape', putOnlyUsedFonts: true })

      if (meta?.title) {
        doc.text(meta.title, isRtl ? doc.internal.pageSize.getWidth() - 14 : 14, 20, {
          align: isRtl ? 'right' : 'left',
        })
      }

      const head = [columns.map((c) => c.header)]
      const body = rows.map((row) => columns.map((col) => String(row[col.key] ?? '')))

      ;(doc as unknown as { autoTable: (opts: unknown) => void }).autoTable({
        head,
        body,
        startY: meta?.title ? 30 : 14,
        styles: { halign: isRtl ? 'right' : 'left' },
      })

      doc.save(`${filename}.pdf`)
    })
  })
}
