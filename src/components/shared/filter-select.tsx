import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface FilterOption {
  value: string
  label: string
}

interface FilterSelectProps {
  value: string
  onChange: (value: string) => void
  options: FilterOption[]
  placeholder: string
  className?: string
  /** Coalesce rapid switches before notifying the parent. Defaults to 250ms. */
  debounceMs?: number
}

export function FilterSelect({
  value,
  onChange,
  options,
  placeholder,
  className,
  debounceMs = 250,
}: FilterSelectProps) {
  const { t } = useTranslation()
  const [internal, setInternal] = useState(value)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    setInternal(value)
  }, [value])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  function handleChange(raw: string) {
    const next = raw === '__all__' ? '' : raw
    setInternal(next)
    if (timerRef.current) clearTimeout(timerRef.current)
    if (debounceMs <= 0) {
      onChange(next)
      return
    }
    timerRef.current = setTimeout(() => onChange(next), debounceMs)
  }

  return (
    <Select
      value={internal}
      onValueChange={handleChange}
    >
      <SelectTrigger
        data-slot="filter-select"
        size="sm"
        className={cn('min-w-[120px]', className)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__all__">{t('common:labels.all')}</SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
