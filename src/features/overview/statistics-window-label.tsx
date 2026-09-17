import { Trans, useTranslation } from 'react-i18next'
import { resolvedRangeLabel } from '@/lib/report-period'
import type { ReportDateRange } from '@/types/api'

interface StatisticsWindowLabelProps {
  range: ReportDateRange | undefined
  isPending: boolean
}

/**
 * The window the server actually resolved, shown under the controls on every
 * tab. The period control says what was asked for; this says what came back.
 */
export function StatisticsWindowLabel({ range, isPending }: StatisticsWindowLabelProps) {
  const { t } = useTranslation()

  if (isPending || !range) {
    return <p className="text-sm text-muted-foreground">{t('overview:window.loading')}</p>
  }

  return (
    <p className="text-sm text-muted-foreground">
      <Trans
        i18nKey="overview:window.showing"
        values={{ range: resolvedRangeLabel(range) }}
        components={{ range: <span className="font-medium text-foreground" /> }}
      />
    </p>
  )
}
