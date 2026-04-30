import { type ElementType } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon?: ElementType
  message?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({ icon: Icon, message, actionLabel, onAction, className }: EmptyStateProps) {
  const { t } = useTranslation()

  return (
    <div
      data-slot="empty-state"
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-12 text-center',
        className,
      )}
    >
      {Icon && (
        <Icon className="size-8 text-muted-foreground/60" />
      )}
      <p className="text-sm text-muted-foreground">
        {message ?? t('components:empty.title')}
      </p>
      {onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel ?? t('components:empty.action')}
        </Button>
      )}
    </div>
  )
}
