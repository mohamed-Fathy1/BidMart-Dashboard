import { Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { PhoneEntry } from '@/types/api'
import { cn } from '@/lib/utils'

interface PhoneNumberListFieldProps {
  value: PhoneEntry[]
  onChange: (next: PhoneEntry[]) => void
  /** Per-row validation errors (parallel to `value`). */
  errors?: Array<{ country_code?: string; number?: string } | undefined>
  /** Form-level error (e.g. "add at least one"). */
  formError?: string
  className?: string
  disabled?: boolean
}

const EMPTY_ENTRY: PhoneEntry = { country_code: '+966', number: '' }

export function PhoneNumberListField({
  value,
  onChange,
  errors,
  formError,
  className,
  disabled,
}: PhoneNumberListFieldProps) {
  const { t } = useTranslation()

  function update(index: number, patch: Partial<PhoneEntry>) {
    const next = value.map((entry, i) => (i === index ? { ...entry, ...patch } : entry))
    onChange(next)
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  function add() {
    onChange([...value, { ...EMPTY_ENTRY }])
  }

  return (
    <div className={cn('space-y-2', className)}>
      {value.length === 0 ? (
        <p className="rounded-md border border-dashed border-border px-3 py-3 text-xs text-muted-foreground">
          {t('settings:system.phone_field.empty')}
        </p>
      ) : (
        <ul className="space-y-2">
          {value.map((entry, index) => {
            const rowErrors = errors?.[index]
            return (
              <li key={index} className="flex items-start gap-2">
                <div className="w-[110px] shrink-0">
                  <Input
                    inputMode="tel"
                    value={entry.country_code}
                    onChange={(e) =>
                      update(index, { country_code: e.target.value.trim() })
                    }
                    placeholder={t('settings:system.phone_field.country_code_placeholder')}
                    aria-invalid={!!rowErrors?.country_code || undefined}
                    className="font-mono tabular-nums"
                    disabled={disabled}
                  />
                  {rowErrors?.country_code && (
                    <p className="mt-1 text-[11px] text-destructive">{rowErrors.country_code}</p>
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    inputMode="tel"
                    value={entry.number}
                    onChange={(e) =>
                      update(index, { number: e.target.value.replace(/\s+/g, '') })
                    }
                    placeholder={t('settings:system.phone_field.number_placeholder')}
                    aria-invalid={!!rowErrors?.number || undefined}
                    className="font-mono tabular-nums"
                    disabled={disabled}
                  />
                  {rowErrors?.number && (
                    <p className="mt-1 text-[11px] text-destructive">{rowErrors.number}</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => remove(index)}
                  aria-label={t('settings:system.phone_field.remove')}
                  className="mt-0.5 text-muted-foreground hover:text-destructive"
                  disabled={disabled}
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </li>
            )
          })}
        </ul>
      )}
      {formError && <p className="text-xs text-destructive">{formError}</p>}
      <Button type="button" variant="outline" size="sm" onClick={add} disabled={disabled}>
        <Plus className="size-4" aria-hidden />
        {t('settings:system.phone_field.add')}
      </Button>
    </div>
  )
}
