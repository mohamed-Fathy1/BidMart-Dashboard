import { useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  length?: number
  disabled?: boolean
  className?: string
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  className,
}: OtpInputProps) {
  const { t } = useTranslation()
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  const digits = value.split('').concat(Array(length).fill('')).slice(0, length)

  const focusIndex = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(i, length - 1))
      inputsRef.current[clamped]?.focus()
    },
    [length],
  )

  function handleChange(i: number, char: string) {
    if (!/^\d?$/.test(char)) return

    const next = digits.slice()
    next[i] = char
    onChange(next.join(''))

    if (char && i < length - 1) {
      focusIndex(i + 1)
    }
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      focusIndex(i - 1)
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      focusIndex(i - 1)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      focusIndex(i + 1)
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (pasted) {
      onChange(pasted.padEnd(length, '').slice(0, length).replace(/ /g, ''))
      focusIndex(Math.min(pasted.length, length - 1))
    }
  }

  return (
    <div
      data-slot="otp-input"
      className={cn('flex gap-2', className)}
      role="group"
      aria-label={t('components:otp_input.label')}
      dir="ltr"
    >
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            'size-11 rounded-md border border-input bg-transparent text-center text-lg font-semibold shadow-xs outline-none transition-[color,box-shadow]',
            'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
          )}
          aria-label={`${t('components:otp_input.label')} ${i + 1}`}
        />
      ))}
    </div>
  )
}
