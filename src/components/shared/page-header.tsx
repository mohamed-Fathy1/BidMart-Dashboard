import { type ReactNode } from 'react'
import { ArrowLeftIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: ReactNode
  actions?: ReactNode
  onBack?: () => void
  className?: string
  /** Inline slot beside the title (e.g. a StatusBadge on detail pages). */
  badge?: ReactNode
}

export function PageHeader({ title, description, actions, onBack, className, badge }: PageHeaderProps) {
  const { t } = useTranslation()

  return (
    <div data-slot="page-header" className={cn('space-y-3', className)}>
      {onBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="-ms-2 h-7 px-2 text-xs text-muted-foreground"
        >
          <ArrowLeftIcon className="size-3.5 rtl:rotate-180" />
          {t('components:page_header.back')}
        </Button>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="text-[length:var(--type-h1-size)] font-[number:var(--type-h1-weight)] leading-[var(--type-h1-leading)] tracking-[var(--type-h1-tracking)] text-foreground">
              {title}
            </h1>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>
          {description != null && description !== '' && (
            <div className="mt-1.5 max-w-[min(100%,42rem)] text-sm text-muted-foreground">
              {description}
            </div>
          )}
        </div>
        {actions && (
          <div
            className={cn(
              '-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1',
              '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
              'sm:mx-0 sm:shrink-0 sm:flex-wrap sm:overflow-visible sm:justify-end sm:px-0 sm:pb-0',
            )}
          >
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
