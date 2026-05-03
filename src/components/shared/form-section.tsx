import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FormSectionProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <section
      className={cn(
        'space-y-4 border-t border-border/60 pt-6 first:border-t-0 first:pt-0',
        className,
      )}
    >
      <header className="space-y-1">
        <h3 className="text-sm font-semibold leading-tight text-foreground">
          {title}
        </h3>
        {description ? (
          <p className="text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </header>
      {children}
    </section>
  )
}
