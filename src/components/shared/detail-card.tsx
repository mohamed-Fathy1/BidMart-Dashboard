import { type ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface DetailCardProps {
  title: string
  actions?: ReactNode
  children: ReactNode
  columns?: 1 | 2 | 3 | 4
  className?: string
}

const columnClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
} as const

export function DetailCard({ title, actions, children, columns = 3, className }: DetailCardProps) {
  return (
    <Card data-slot="detail-card" className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-[length:var(--type-h3-size)] font-[number:var(--type-h3-weight)]">
          {title}
        </CardTitle>
        {actions && <CardAction>{actions}</CardAction>}
      </CardHeader>
      <CardContent>
        <dl className={cn('grid gap-4', columnClasses[columns])}>
          {children}
        </dl>
      </CardContent>
    </Card>
  )
}
