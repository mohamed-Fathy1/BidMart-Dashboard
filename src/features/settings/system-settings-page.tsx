import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Clock, Globe, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { PhoneNumberListField } from '@/components/shared/phone-number-list-field'
import { PageHeader } from '@/components/shared/page-header'
import { Can } from '@/components/permissions/can'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { format } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  useSystemSettingsQuery,
  useUpdateSystemSettingsMutation,
} from '@/features/settings/settings.queries'
import type {
  PhoneEntry,
  SocialMediaLinks,
  SystemSettings,
} from '@/types/api'
import type { UpdateSystemSettingsPatch } from '@/features/settings/settings.api'

const COUNTRY_CODE_REGEX = /^\+\d{1,4}$/
const DIGITS_REGEX = /^\d+$/

const phoneEntrySchema = z.object({
  country_code: z
    .string()
    .trim()
    .regex(COUNTRY_CODE_REGEX, { message: 'settings:validation.country_code_invalid' }),
  number: z
    .string()
    .trim()
    .min(1, { message: 'settings:validation.phone_digits_only' })
    .regex(DIGITS_REGEX, { message: 'settings:validation.phone_digits_only' }),
})

const urlOrEmpty = z
  .string()
  .trim()
  .refine((v) => v === '' || /^https?:\/\/\S+$/i.test(v), {
    message: 'settings:validation.url_invalid',
  })

const schema = z.object({
  dollar_to_riyal_rate: z
    .number({ message: 'settings:validation.rate_min' })
    .min(1, { message: 'settings:validation.rate_min' }),
  order_commission_percentage: z
    .number({ message: 'settings:validation.commission_range' })
    .min(0, { message: 'settings:validation.commission_range' })
    .max(100, { message: 'settings:validation.commission_range' }),
  referral_amount_sar: z
    .number({ message: 'settings:validation.min_positive' })
    .min(1, { message: 'settings:validation.min_positive' }),
  min_liquidation_amount_sar: z
    .number({ message: 'settings:validation.min_positive' })
    .min(1, { message: 'settings:validation.min_positive' }),
  email: z
    .string()
    .trim()
    .email({ message: 'settings:validation.email_invalid' }),
  phone_numbers: z.array(phoneEntrySchema).min(1, { message: 'settings:validation.phone_required' }),
  whatsapp_numbers: z.array(phoneEntrySchema).min(1, { message: 'settings:validation.phone_required' }),
  social_media: z.object({
    twitter: urlOrEmpty,
    tiktok: urlOrEmpty,
    snapchat: urlOrEmpty,
    youtube: urlOrEmpty,
    instagram: urlOrEmpty,
    facebook: urlOrEmpty,
  }),
})

type SettingsForm = z.infer<typeof schema>

const NUMBER_REGISTER = { valueAsNumber: true }

const SOCIAL_FIELDS: Array<keyof SocialMediaLinks> = [
  'twitter',
  'tiktok',
  'snapchat',
  'youtube',
  'instagram',
  'facebook',
]

function toDefaults(settings: SystemSettings): SettingsForm {
  return {
    dollar_to_riyal_rate: settings.dollar_to_riyal_rate,
    order_commission_percentage: settings.order_commission_percentage,
    referral_amount_sar: settings.referral_amount_sar,
    min_liquidation_amount_sar: settings.min_liquidation_amount_sar,
    email: settings.email,
    phone_numbers: settings.phone_numbers.map((p) => ({ ...p })),
    whatsapp_numbers: settings.whatsapp_numbers.map((p) => ({ ...p })),
    social_media: {
      twitter: settings.social_media.twitter ?? '',
      tiktok: settings.social_media.tiktok ?? '',
      snapchat: settings.social_media.snapchat ?? '',
      youtube: settings.social_media.youtube ?? '',
      instagram: settings.social_media.instagram ?? '',
      facebook: settings.social_media.facebook ?? '',
    },
  }
}

function buildPatch(
  values: SettingsForm,
  dirty: Record<string, unknown>,
): UpdateSystemSettingsPatch {
  const patch: UpdateSystemSettingsPatch = {}
  if (dirty.dollar_to_riyal_rate) patch.dollar_to_riyal_rate = values.dollar_to_riyal_rate
  if (dirty.order_commission_percentage)
    patch.order_commission_percentage = values.order_commission_percentage
  if (dirty.referral_amount_sar) patch.referral_amount_sar = values.referral_amount_sar
  if (dirty.min_liquidation_amount_sar)
    patch.min_liquidation_amount_sar = values.min_liquidation_amount_sar
  if (dirty.email) patch.email = values.email.trim()
  if (dirty.phone_numbers) patch.phone_numbers = values.phone_numbers
  if (dirty.whatsapp_numbers) patch.whatsapp_numbers = values.whatsapp_numbers
  if (dirty.social_media) {
    const cleaned: SocialMediaLinks = {}
    for (const key of SOCIAL_FIELDS) {
      const v = values.social_media[key]
      if (v && v.length > 0) cleaned[key] = v
    }
    patch.social_media = cleaned
  }
  return patch
}

export function SystemSettingsPage() {
  const { t } = useTranslation()
  const canUpdate = usePermission(PERMISSIONS.settings.update)
  const { data: settings, isLoading, isError } = useSystemSettingsQuery()
  const updateMutation = useUpdateSystemSettingsMutation()

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty, dirtyFields, isValid },
  } = useForm<SettingsForm>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      dollar_to_riyal_rate: 1,
      order_commission_percentage: 0,
      referral_amount_sar: 1,
      min_liquidation_amount_sar: 1,
      email: '',
      phone_numbers: [],
      whatsapp_numbers: [],
      social_media: {
        twitter: '',
        tiktok: '',
        snapchat: '',
        youtube: '',
        instagram: '',
        facebook: '',
      },
    },
  })

  useEffect(() => {
    if (settings) reset(toDefaults(settings))
  }, [settings, reset])

  const phoneNumbers = watch('phone_numbers')
  const whatsappNumbers = watch('whatsapp_numbers')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        <Loader2 className="me-2 size-4 motion-safe:animate-spin" aria-hidden />
        <span>{t('settings:title')}…</span>
      </div>
    )
  }

  if (isError || !settings) {
    return (
      <Card className="gap-0 py-0">
        <CardContent className="px-6 py-10 text-center text-sm text-muted-foreground">
          {t('settings:errors.load_failed')}
        </CardContent>
      </Card>
    )
  }

  function onSubmit(values: SettingsForm) {
    const patch = buildPatch(values, dirtyFields as Record<string, unknown>)
    if (Object.keys(patch).length === 0) return
    updateMutation.mutate(patch, {
      onSuccess: (updated) => reset(toDefaults(updated)),
    })
  }

  const isSaving = updateMutation.isPending

  const updatedAtDescription = settings.updated_at ? (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <Clock className="size-3.5 shrink-0" aria-hidden />
      {t('settings:system.last_updated', { date: format.dateTime(settings.updated_at) })}
    </span>
  ) : (
    t('settings:system.description')
  )

  return (
    <form className="space-y-6" noValidate onSubmit={handleSubmit(onSubmit)}>
      <PageHeader
        title={t('settings:system.title')}
        description={updatedAtDescription}
      />

      {/* Financial */}
      <Card className="gap-0 py-0">
        <CardContent className="space-y-5 px-5 py-5">
          <SectionHeading
            title={t('settings:system.sections.financial.title')}
            description={t('settings:system.sections.financial.description')}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              id="dollar_to_riyal_rate"
              label={t('settings:system.fields.dollar_to_riyal_rate')}
              hint={t('settings:system.fields.dollar_to_riyal_rate_hint')}
              error={errors.dollar_to_riyal_rate?.message}
              suffix="SAR"
              step="0.01"
              {...register('dollar_to_riyal_rate', NUMBER_REGISTER)}
            />
            <NumberField
              id="order_commission_percentage"
              label={t('settings:system.fields.order_commission_percentage')}
              hint={t('settings:system.fields.order_commission_percentage_hint')}
              error={errors.order_commission_percentage?.message}
              suffix="%"
              step="0.1"
              {...register('order_commission_percentage', NUMBER_REGISTER)}
            />
            <NumberField
              id="referral_amount_sar"
              label={t('settings:system.fields.referral_amount_sar')}
              hint={t('settings:system.fields.referral_amount_sar_hint')}
              error={errors.referral_amount_sar?.message}
              suffix="SAR"
              step="1"
              {...register('referral_amount_sar', NUMBER_REGISTER)}
            />
            <NumberField
              id="min_liquidation_amount_sar"
              label={t('settings:system.fields.min_liquidation_amount_sar')}
              hint={t('settings:system.fields.min_liquidation_amount_sar_hint')}
              error={errors.min_liquidation_amount_sar?.message}
              suffix="SAR"
              step="1"
              {...register('min_liquidation_amount_sar', NUMBER_REGISTER)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="gap-0 py-0">
        <CardContent className="space-y-5 px-5 py-5">
          <SectionHeading
            title={t('settings:system.sections.contact.title')}
            description={t('settings:system.sections.contact.description')}
          />
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">{t('settings:system.fields.email')}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email || undefined}
                className="font-mono tabular-nums sm:max-w-md"
                {...register('email')}
              />
              {errors.email?.message && (
                <p className="text-xs text-destructive">{t(errors.email.message)}</p>
              )}
            </div>

            <Controller
              control={control}
              name="phone_numbers"
              render={({ field, fieldState }) => (
                <div className="space-y-1.5">
                  <Label>{t('settings:system.fields.phone_numbers')}</Label>
                  <PhoneNumberListField
                    value={phoneNumbers}
                    onChange={(next: PhoneEntry[]) => {
                      field.onChange(next)
                      setValue('phone_numbers', next, { shouldDirty: true })
                    }}
                    formError={
                      fieldState.error?.message ? t(fieldState.error.message) : undefined
                    }
                    errors={mapArrayErrors(errors.phone_numbers, t)}
                    disabled={isSaving}
                  />
                </div>
              )}
            />

            <Controller
              control={control}
              name="whatsapp_numbers"
              render={({ field, fieldState }) => (
                <div className="space-y-1.5">
                  <Label>{t('settings:system.fields.whatsapp_numbers')}</Label>
                  <PhoneNumberListField
                    value={whatsappNumbers}
                    onChange={(next: PhoneEntry[]) => {
                      field.onChange(next)
                      setValue('whatsapp_numbers', next, { shouldDirty: true })
                    }}
                    formError={
                      fieldState.error?.message ? t(fieldState.error.message) : undefined
                    }
                    errors={mapArrayErrors(errors.whatsapp_numbers, t)}
                    disabled={isSaving}
                  />
                </div>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Social media */}
      <Card className="gap-0 py-0">
        <CardContent className="space-y-5 px-5 py-5">
          <SectionHeading
            title={t('settings:system.sections.social.title')}
            description={t('settings:system.sections.social.description')}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {SOCIAL_FIELDS.map((key) => {
              const error = errors.social_media?.[key]?.message
              return (
                <div key={key} className="space-y-1.5">
                  <Label htmlFor={`social_${key}`}>
                    {t(`settings:system.fields.${key}`)}
                  </Label>
                  <div className="relative">
                    <Globe
                      className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden
                    />
                    <Input
                      id={`social_${key}`}
                      type="url"
                      inputMode="url"
                      placeholder="https://…"
                      aria-invalid={!!error || undefined}
                      className="ps-9"
                      {...register(`social_media.${key}` as const)}
                    />
                  </div>
                  {error && (
                    <p className="text-xs text-destructive">{t(error)}</p>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Sticky footer */}
      <div className="sticky bottom-0 z-(--z-sticky) -mx-1 flex flex-wrap items-center justify-end gap-2 rounded-xl border border-border bg-card px-4 py-3 shadow-rest">
        {isDirty && (
          <span className="me-auto text-xs text-muted-foreground">
            {t('settings:system.actions.unsaved')}
          </span>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!isDirty || isSaving}
          onClick={() => settings && reset(toDefaults(settings))}
        >
          {t('settings:system.actions.reset')}
        </Button>
        <Can permission={PERMISSIONS.settings.update}>
          <Button type="submit" size="sm" disabled={!isDirty || !isValid || isSaving || !canUpdate}>
            {isSaving && <Loader2 className="size-4 motion-safe:animate-spin" aria-hidden />}
            {isSaving ? t('settings:system.actions.saving') : t('settings:system.actions.save')}
          </Button>
        </Can>
      </div>
    </form>
  )
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-b border-border pb-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
    </div>
  )
}

interface NumberFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  hint?: string
  error?: string
  suffix?: string
}

function NumberField({ id, label, hint, error, suffix, ...inputProps }: NumberFieldProps) {
  const { t } = useTranslation()
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          aria-invalid={!!error || undefined}
          className={cn('font-mono tabular-nums', suffix && 'pe-12')}
          {...inputProps}
        />
        {suffix && (
          <span
            className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground"
            aria-hidden
          >
            {suffix}
          </span>
        )}
      </div>
      {hint && !error && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{t(error)}</p>}
    </div>
  )
}

function hasMessage(v: unknown): v is { message: string } {
  return typeof v === 'object' && v !== null && typeof (v as Record<string, unknown>).message === 'string'
}

function mapArrayErrors(
  errs: unknown,
  t: (k: string) => string,
): Array<{ country_code?: string; number?: string } | undefined> | undefined {
  if (!Array.isArray(errs)) return undefined
  return errs.map((row) => {
    if (typeof row !== 'object' || row === null) return undefined
    const r = row as Record<string, unknown>
    const ccMsg = hasMessage(r.country_code) ? r.country_code.message : undefined
    const numMsg = hasMessage(r.number) ? r.number.message : undefined
    return {
      country_code: ccMsg ? t(ccMsg) : undefined,
      number: numMsg ? t(numMsg) : undefined,
    }
  })
}
