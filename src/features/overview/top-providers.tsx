import { useTranslation } from 'react-i18next'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Sparkline } from '@/components/shared/sparkline'
import { format } from '@/lib/format'
import { TOP_PROVIDERS } from './overview.mock'

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function TopProviders() {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('shell:overview.top_providers.title')}</CardTitle>
        <CardDescription>
          {t('shell:overview.top_providers.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="-my-2 divide-y divide-border">
          {TOP_PROVIDERS.map((p) => (
            <li key={p.rank} className="flex items-center gap-3 py-2.5">
              <span className="w-4 shrink-0 text-center font-mono text-xs tabular-nums text-muted-foreground">
                {p.rank}
              </span>
              <Avatar className="size-7">
                <AvatarFallback className="text-[10px] font-semibold">
                  {initials(p.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">
                  {p.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t(`shell:overview.top_providers.categories.${p.categoryKey}`)} ·{' '}
                  {format.percent(p.share / 100)}
                </div>
              </div>
              <Sparkline data={p.trend} width={60} height={20} />
              <span className="w-20 text-end font-mono text-xs font-medium tabular-nums">
                {format.currency(p.gmv)}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
