import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { DataTable } from '@/components/data-table/data-table'
import { Can } from '@/components/permissions/can'
import { Button } from '@/components/ui/button'
import { format } from '@/lib/format'

export const Route = createFileRoute('/_authed/overview')({
  component: OverviewPage,
})

function OverviewPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t('shell:nav.overview')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('common:states.no_data')}
        </p>
      </div>

      <DataTable columns={[]} data={[]} />

      <Can permission="users.read">
        <Button variant="outline">
          {t('shell:nav.users')} — {t('common:buttons.edit')}
        </Button>
      </Can>

      <div className="rounded-lg border border-border bg-card p-4">
        <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Debug Strip</p>
        <div className="grid grid-cols-2 gap-4 font-mono text-sm tabular-nums">
          <div>
            <p className="text-xs text-muted-foreground">AR locale</p>
            <p>{new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(1234.5)}</p>
            <p>{new Intl.DateTimeFormat('ar-SA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date())}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">EN locale</p>
            <p>{new Intl.NumberFormat('en-SA', { style: 'currency', currency: 'SAR' }).format(1234.5)}</p>
            <p>{new Intl.DateTimeFormat('en-SA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date())}</p>
          </div>
        </div>
        <div className="mt-3 border-t border-border pt-3">
          <p className="text-xs text-muted-foreground mb-1">Current locale output (format.ts)</p>
          <p className="font-mono text-sm tabular-nums">{format.currency(1234.5)}</p>
          <p className="font-mono text-sm tabular-nums">{format.dateTime(new Date())}</p>
        </div>
      </div>

      <Button
        variant="secondary"
        onClick={() => toast.success('Toast works!')}
      >
        Dev: Test Toast
      </Button>
    </div>
  )
}
