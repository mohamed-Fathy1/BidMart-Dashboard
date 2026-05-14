import { useTranslation } from 'react-i18next'
import { FileText } from 'lucide-react'
import type { ComplaintDetail } from '@/types/api'
import { Card, CardContent } from '@/components/ui/card'

interface ComplaintInfoCardProps {
  complaint: ComplaintDetail
}

export function ComplaintInfoCard({ complaint }: ComplaintInfoCardProps) {
  const { t } = useTranslation()
  const attachments = complaint.attachment_urls

  return (
    <div className="space-y-3">
      <Card className="gap-0 rounded-xl border-border py-0">
        <CardContent className="space-y-2 px-4 py-3.5">
          <h2 className="text-sm font-semibold text-foreground">
            {t('complaints:info.description')}
          </h2>
          <p className="text-pretty text-sm leading-relaxed text-foreground">
            {complaint.description}
          </p>
        </CardContent>
      </Card>

      <Card className="gap-0 rounded-xl border-border py-0">
        <CardContent className="space-y-2 px-4 py-3.5">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold text-foreground">
              {t('complaints:info.attachments')}
            </h2>
            {attachments.length > 0 && (
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                {attachments.length}
              </span>
            )}
          </div>
          {attachments.length === 0 ? (
            <div className="flex items-center gap-2.5 rounded-lg border border-dashed border-border px-3 py-3 text-xs text-muted-foreground">
              <FileText className="size-4 opacity-70" aria-hidden />
              <span>{t('complaints:info.no_attachments')}</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {attachments.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square overflow-hidden rounded-md border border-border bg-muted/30"
                  aria-label={t('complaints:info.attachments')}
                >
                  <img
                    src={url}
                    alt=""
                    loading="lazy"
                    width={200}
                    height={200}
                    className="absolute inset-0 size-full object-cover transition-transform duration-(--duration-layout) ease-(--ease-default) group-hover:scale-[1.04]"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
