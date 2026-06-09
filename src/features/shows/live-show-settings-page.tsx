import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { ShieldAlert } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { format } from '@/lib/format'
import { onFormEnterKeyDown } from '@/lib/form-enter-submit'
import {
  useLiveShowSettingsQuery,
  useUpdateLiveShowSettingsMutation,
} from '@/features/shows/shows.queries'

const MIN_MINUTES = 5
const MAX_MINUTES = 1440

const PRESETS = [
  { minutes: 30, key: '30m' },
  { minutes: 60, key: '1h' },
  { minutes: 120, key: '2h' },
  { minutes: 240, key: '4h' },
  { minutes: 480, key: '8h' },
  { minutes: 1440, key: '24h' },
] as const

const schema = z.object({
  maxDurationMinutes: z
    .number({ message: 'shows:validation.integer' })
    .int({ message: 'shows:validation.integer' })
    .min(MIN_MINUTES, { message: 'shows:validation.min' })
    .max(MAX_MINUTES, { message: 'shows:validation.max' }),
})

type FormValues = z.infer<typeof schema>

export function LiveShowSettingsPage() {
  const { t } = useTranslation()
  const canUpdate = usePermission(PERMISSIONS.shows.update)

  const query = useLiveShowSettingsQuery()
  const update = useUpdateLiveShowSettingsMutation()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isDirty, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { maxDurationMinutes: 120 },
  })

  useEffect(() => {
    if (query.data) {
      reset({ maxDurationMinutes: query.data.maxDurationMinutes })
    }
  }, [query.data, reset])

  const current = useWatch({ control, name: 'maxDurationMinutes' })
  const hoursLabel =
    typeof current === 'number' && Number.isFinite(current) && current > 0
      ? t('shows:fields.hours_label', {
          hours: Math.floor(current / 60),
          minutes: current % 60,
        })
      : ''

  function onSubmit(values: FormValues) {
    update.mutate({ maxDurationMinutes: values.maxDurationMinutes })
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <PageHeader
        title={t('shows:title')}
        description={t('shows:description')}
      />

      <Card className="shadow-rest">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-base">
            {t('shows:sections.duration')}
          </CardTitle>
          <CardDescription className="text-pretty">
            {t('shows:sections.duration_hint')}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {query.isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-4 w-72" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : query.isError ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
              <ShieldAlert className="h-10 w-10" />
              <p className="text-sm">{t('shows:errors.load_failed')}</p>
            </div>
          ) : (
            <form
              className="space-y-6"
              noValidate
              onSubmit={handleSubmit(onSubmit)}
              onKeyDown={onFormEnterKeyDown}
            >
              <div className="space-y-2">
                <Label htmlFor="shows-maxDuration">
                  {t('shows:fields.max_duration_minutes')}
                </Label>
                <div className="flex flex-wrap items-center gap-3">
                  <Input
                    id="shows-maxDuration"
                    type="number"
                    inputMode="numeric"
                    min={MIN_MINUTES}
                    max={MAX_MINUTES}
                    step={1}
                    aria-invalid={!!errors.maxDurationMinutes}
                    disabled={!canUpdate}
                    className="w-32 font-mono tabular-nums"
                    {...register('maxDurationMinutes', { valueAsNumber: true })}
                  />
                  {hoursLabel && (
                    <span className="text-sm text-muted-foreground tabular-nums">
                      = {hoursLabel}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('shows:fields.max_duration_hint')}
                </p>
                {errors.maxDurationMinutes?.message && (
                  <p className="text-xs text-destructive">
                    {t(errors.maxDurationMinutes.message, {
                      min: MIN_MINUTES,
                      max: MAX_MINUTES,
                    })}
                  </p>
                )}
              </div>

              {canUpdate && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="me-1 text-xs uppercase tracking-wide text-muted-foreground">
                    {t('shows:presets.label')}
                  </span>
                  {PRESETS.map(({ minutes, key }) => (
                    <Button
                      key={minutes}
                      type="button"
                      size="sm"
                      variant={current === minutes ? 'secondary' : 'outline'}
                      onClick={() =>
                        setValue('maxDurationMinutes', minutes, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      className="rounded-full"
                    >
                      {t(`shows:presets.${key}`)}
                    </Button>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
                <p className="text-xs text-muted-foreground">
                  {query.data?.updatedAt
                    ? t('shows:meta.updated_at', {
                        value: format.dateTime(query.data.updatedAt),
                      })
                    : null}
                </p>
                {canUpdate ? (
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!isDirty || update.isPending}
                      onClick={() =>
                        query.data &&
                        reset({
                          maxDurationMinutes: query.data.maxDurationMinutes,
                        })
                      }
                    >
                      {t('common:buttons.cancel')}
                    </Button>
                    <Button
                      type="submit"
                      disabled={!isDirty || !isValid || update.isPending}
                      className="min-w-30"
                    >
                      {t('shows:actions.save')}
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {t('shows:read_only_hint')}
                  </p>
                )}
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
