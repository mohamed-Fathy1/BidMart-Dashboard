import { useId, useState } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  presetForRange,
  presetToRange,
  rangeValidationError,
  RANGE_PRESETS,
  type RangePreset,
} from '@/lib/report-range'
import { todayIso } from '@/lib/report-period'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DateRangeField } from '@/components/shared/date-range-field'
import { cn } from '@/lib/utils'

export interface ReportDateRangeValue {
  from?: string
  to?: string
}

interface ReportDateRangeFilterProps {
  from?: string
  to?: string
  onChange(next: ReportDateRangeValue): void
  className?: string
}

const CUSTOM_VALUE = 'custom'

export function ReportDateRangeFilter({
  from,
  to,
  onChange,
  className,
}: ReportDateRangeFilterProps) {
  const { t } = useTranslation()
  const errorId = useId()
  const [draft, setDraft] = useState<{ from: string; to: string }>({
    from: from ?? '',
    to: to ?? '',
  })
  const [synced, setSynced] = useState<{ from?: string; to?: string }>({ from, to })

  if (from !== synced.from || to !== synced.to) {
    setSynced({ from, to })
    setDraft({ from: from ?? '', to: to ?? '' })
  }

  const today = todayIso()
  const matchedPreset = presetForRange(from, to, today)
  const rangeError = rangeValidationError(from, to, today)
  const error = rangeError ? t(`components:date_range.errors.${rangeError}`) : undefined

  function commit(next: { from: string; to: string }) {
    if (!next.from && !next.to) onChange({})
    else if (next.from && next.to) onChange({ from: next.from, to: next.to })
  }

  function setDraftFrom(value: string) {
    const next = { ...draft, from: value }
    setDraft(next)
    commit(next)
  }

  function setDraftTo(value: string) {
    const next = { ...draft, to: value }
    setDraft(next)
    commit(next)
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <Select
        value={matchedPreset ?? CUSTOM_VALUE}
        onValueChange={(value) => {
          if (value === CUSTOM_VALUE) return
          onChange(presetToRange(value as RangePreset, today))
        }}
      >
        <SelectTrigger
          size="sm"
          aria-label={t('components:date_range.preset')}
          className="min-w-[140px]"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={CUSTOM_VALUE}>{t('components:date_range.custom')}</SelectItem>
          {RANGE_PRESETS.map((preset) => (
            <SelectItem key={preset} value={preset}>
              {t(`components:date_range.presets.${preset}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <DateRangeField
        from={draft.from}
        to={draft.to}
        onFromChange={setDraftFrom}
        onToChange={setDraftTo}
        fromLabel={t('components:date_range.from')}
        toLabel={t('components:date_range.to')}
        max={today}
        invalid={!!error}
        describedBy={error ? errorId : undefined}
      />

      {(from || to) && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={t('common:buttons.reset')}
          onClick={() => onChange({})}
        >
          <X />
        </Button>
      )}

      {error && (
        <p id={errorId} role="alert" className="w-full text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
