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

function compactCurrency(value: number, lang: string): string {
  const locale = lang === 'ar' ? 'ar-SA' : 'en-SA'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'SAR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

export function TopProviders() {
  const { t, i18n } = useTranslation()

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle>{t('shell:overview.top_providers.title')}</CardTitle>
        <CardDescription>
          {t('shell:overview.top_providers.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border">
          {TOP_PROVIDERS.map((p) => (
            <li
              key={p.rank}
              className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
            >
              <span className="w-5 shrink-0 text-center font-mono text-xs tabular-nums text-muted-foreground">
                {format.number(p.rank)}
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
              <Sparkline data={p.trend} width={60} height={20} className="hidden sm:block" />
              <span className="w-20 text-end font-mono text-xs font-medium tabular-nums">
                {compactCurrency(p.gmv, i18n.language)}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
