import type { ReactNode } from 'react'
import { Trans } from 'react-i18next'
import { resolvedRangeLabel } from '@/lib/report-period'
import type { ReportDateRange } from '@/types/api'

interface ResolvedRangeLabelProps {
  /** The window the server echoed back; absent until the first response. */
  range?: ReportDateRange
  fallback: ReactNode
}

export function ResolvedRangeLabel({ range, fallback }: ResolvedRangeLabelProps) {
  if (!range) return fallback
  return (
    <Trans
      i18nKey="components:range.showing"
      values={{ range: resolvedRangeLabel(range) }}
      components={{ range: <span className="font-medium text-foreground" /> }}
    />
  )
}
