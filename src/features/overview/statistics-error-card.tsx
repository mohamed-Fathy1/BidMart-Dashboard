import { AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { extractApiErrorCode } from '@/lib/axios'

interface StatisticsErrorCardProps {
  error: unknown
  onRetry: () => void
}

export function StatisticsErrorCard({ error, onRetry }: StatisticsErrorCardProps) {
  const { t } = useTranslation()
  const code = extractApiErrorCode(error)
  const message =
    code === 'REPORT_DATE_IN_FUTURE'
      ? t('overview:errors.REPORT_DATE_IN_FUTURE')
      : t('overview:errors.load_failed')

  return (
    <Card className="py-4">
      <CardContent className="flex flex-wrap items-center justify-between gap-3 px-5">
        <p className="flex items-center gap-2 text-sm text-foreground">
          <AlertCircle className="size-5 shrink-0 text-destructive" />
          {message}
        </p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          {t('overview:errors.retry')}
        </Button>
      </CardContent>
    </Card>
  )
}
