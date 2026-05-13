import { type ElementType } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon?: ElementType
  title?: string
  message?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({ icon: Icon, title, message, actionLabel, onAction, className }: EmptyStateProps) {
  const { t } = useTranslation()

  return (
    <div
      data-slot="empty-state"
      className={cn(
        'mx-auto flex max-w-sm flex-col items-center justify-center gap-3 py-12 text-center',
        className,
      )}
    >
      {Icon && (
        <div className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground/70">
          <Icon className="size-[18px]" />
        </div>
      )}
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">
          {title ?? message ?? t('components:empty.title')}
        </p>
        {title && message && (
          <p className="text-xs text-muted-foreground">{message}</p>
        )}
      </div>
      {onAction && (
        <Button variant="outline" size="sm" onClick={onAction} className="mt-1">
          {actionLabel ?? t('components:empty.action')}
        </Button>
      )}
    </div>
  )
}
