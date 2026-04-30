import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface DetailFieldProps {
  label: string
  value: ReactNode
  mono?: boolean
  span?: 1 | 2 | 3 | 4
  className?: string
}

const spanClasses = {
  1: '',
  2: 'sm:col-span-2',
  3: 'sm:col-span-2 lg:col-span-3',
  4: 'sm:col-span-2 lg:col-span-4',
} as const

export function DetailField({ label, value, mono = false, span, className }: DetailFieldProps) {
  const { t } = useTranslation()

  const isEmpty = value === null || value === undefined || value === ''

  return (
    <div data-slot="detail-field" className={cn('grid gap-1', span && spanClasses[span], className)}>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          'text-sm text-foreground',
          mono && 'font-mono tabular-nums',
          isEmpty && 'text-muted-foreground',
        )}
      >
        {isEmpty ? t('components:detail.not_available') : value}
      </dd>
    </div>
  )
}
