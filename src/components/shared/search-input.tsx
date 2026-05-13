import { useEffect, useRef, useState } from 'react'
import { SearchIcon, XIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
  className?: string
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  debounceMs = 300,
  className,
}: SearchInputProps) {
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

  function handleChange(next: string) {
    setInternal(next)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onChange(next), debounceMs)
  }

  function handleClear() {
    if (timerRef.current) clearTimeout(timerRef.current)
    setInternal('')
    onChange('')
  }

  return (
    <div className={cn('relative', className)}>
      <SearchIcon className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted-foreground" />
      <input
        data-slot="search-input"
        type="text"
        value={internal}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder ?? t('components:search.placeholder')}
        className={cn(
          'h-9 w-full rounded-md border border-input bg-transparent ps-9 placeholder-shown:pe-3 pe-9 text-sm shadow-xs outline-none transition-[color,border-color,box-shadow] duration-(--duration-hover) ease-(--ease-default)',
          'placeholder:text-muted-foreground',
          'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        )}
      />
      {internal && (
        <Button
          variant="ghost"
          size="icon-xs"
          className="absolute inset-y-0 end-1.5 my-auto"
          onClick={handleClear}
          aria-label={t('components:search.clear')}
        >
          <XIcon className="size-3.5" />
        </Button>
      )}
    </div>
  )
}
