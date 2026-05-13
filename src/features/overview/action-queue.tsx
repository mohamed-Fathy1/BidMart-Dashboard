import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ACTION_QUEUE, type ActionQueueItem } from './overview.mock'

const TONE_BG: Record<ActionQueueItem['tone'], string> = {
  amber: 'bg-amber-100 text-amber-800',
  red: 'bg-destructive/10 text-destructive',
  neutral: 'bg-muted text-foreground',
}

export function ActionQueue() {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('shell:overview.action_queue.title')}</CardTitle>
        <CardDescription>
          {t('shell:overview.action_queue.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {ACTION_QUEUE.map((a) => (
          <ActionRow key={a.id} item={a} />
        ))}
      </CardContent>
    </Card>
  )
}

function ActionRow({ item }: { item: ActionQueueItem }) {
  const { t } = useTranslation()
  const label = t(`shell:overview.action_queue.items.${item.id}.label`)
  const sub = t(`shell:overview.action_queue.items.${item.id}.sub`)

  const inner = (
    <>
      <span
        className={cn(
          'inline-flex size-9 shrink-0 items-center justify-center rounded-md font-mono text-sm font-semibold tabular-nums',
          TONE_BG[item.tone],
        )}
      >
        {item.count}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-foreground">{label}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>
      </div>
      <ChevronRight className="size-3.5 shrink-0 text-muted-foreground rtl:rotate-180" />
    </>
  )

  const base =
    'flex items-center gap-3 rounded-md border border-border bg-card p-3 text-start transition-colors duration-(--duration-hover) ease-(--ease-default)'

  if (item.ready) {
    return (
      <Link to={item.to} className={cn(base, 'hover:bg-muted/50')}>
        {inner}
      </Link>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          aria-disabled
          className={cn(base, 'cursor-not-allowed opacity-60')}
        >
          {inner}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        {t('shell:overview.action_queue.coming_soon')}
      </TooltipContent>
    </Tooltip>
  )
}
