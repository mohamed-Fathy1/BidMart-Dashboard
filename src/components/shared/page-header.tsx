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
}

export function PageHeader({ title, description, actions, onBack, className }: PageHeaderProps) {
  const { t } = useTranslation()

  return (
    <div data-slot="page-header" className={cn('space-y-2', className)}>
      {onBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="-ms-2 text-muted-foreground"
        >
          <ArrowLeftIcon className="size-4 rtl:rotate-180" />
          {t('components:page_header.back')}
        </Button>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-[length:var(--type-h1-size)] font-[number:var(--type-h1-weight)] leading-[var(--type-h1-leading)] tracking-[var(--type-h1-tracking)] text-foreground">
            {title}
          </h1>
          {description != null && description !== '' && (
            <div className="mt-2 max-w-[min(100%,42rem)] text-muted-foreground">
              {description}
            </div>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-start justify-end gap-2">{actions}</div>
        )}
      </div>
    </div>
  )
}
