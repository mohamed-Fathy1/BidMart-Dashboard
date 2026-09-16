import { describe, it, expect } from 'vitest'
import { parseContentDispositionFilename } from './download'

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
