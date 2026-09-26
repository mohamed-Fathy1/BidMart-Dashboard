import { describe, it, expect } from 'vitest'
import { parseContentDispositionFilename, reportExportFilename } from './download'

describe('parseContentDispositionFilename', () => {
  it('reads a quoted filename', () => {
    expect(
      parseContentDispositionFilename(
        'attachment; filename="financial-report_2026-08-10_2026-09-08.xlsx"',
        'fallback.xlsx',
      ),
    ).toBe('financial-report_2026-08-10_2026-09-08.xlsx')
  })

  it('reads a bare filename', () => {
    expect(parseContentDispositionFilename('attachment; filename=report.pdf', 'x')).toBe(
      'report.pdf',
    )
  })

  it('prefers the RFC 6266 extended form and decodes it', () => {
    expect(
      parseContentDispositionFilename(
        `attachment; filename="fallback.pdf"; filename*=UTF-8''r%C3%A9port.pdf`,
        'x',
      ),
    ).toBe('réport.pdf')
  })

  it('falls back when the header is missing or has no filename', () => {
    expect(parseContentDispositionFilename(undefined, 'fallback.xlsx')).toBe('fallback.xlsx')
    expect(parseContentDispositionFilename('inline', 'fallback.xlsx')).toBe('fallback.xlsx')
  })
})

describe('reportExportFilename', () => {
  it('names the file after the resolved window like the server does', () => {
    expect(
      reportExportFilename('financial-report', 'xlsx', {
        startDate: '2026-08-10',
        endDate: '2026-09-08',
      }),
    ).toBe('financial-report_2026-08-10_2026-09-08.xlsx')
    expect(
      reportExportFilename('financial-report', 'pdf', {
        startDate: '2026-09-01',
        endDate: '2026-09-01',
      }),
    ).toBe('financial-report_2026-09-01_2026-09-01.pdf')
  })

  it('drops the dates when the window is not known yet', () => {
    expect(reportExportFilename('financial-report', 'xlsx', undefined)).toBe(
      'financial-report.xlsx',
    )
  })
})
