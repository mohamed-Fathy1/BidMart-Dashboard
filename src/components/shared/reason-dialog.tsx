import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LoaderIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
interface ReasonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  reasonLabel?: string
  reasonPlaceholder?: string
  confirmLabel?: string
  onConfirm: (reason: string) => void
  variant?: 'default' | 'destructive'
  isLoading?: boolean
  maxLength?: number
}

export function ReasonDialog({
  open,
  onOpenChange,
  title,
  description,
  reasonLabel,
  reasonPlaceholder,
  confirmLabel,
  onConfirm,
  variant = 'destructive',
  isLoading = false,
  maxLength = 200,
}: ReasonDialogProps) {
  const { t } = useTranslation()
  const [reason, setReason] = useState('')
  const [error, setError] = useState(false)

  function handleOpenChange(next: boolean) {
    if (!next && isLoading) return
    if (!next) {
      setReason('')
      setError(false)
    }
    onOpenChange(next)
  }

  function handleConfirm() {
    const trimmed = reason.trim()
    if (!trimmed) {
      setError(true)
      return
    }
    setError(false)
    onConfirm(trimmed)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="reason-input">
            {reasonLabel ?? t('components:reason_dialog.reason_label')}
          </Label>
          <Textarea
            id="reason-input"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value)
              if (error && e.target.value.trim()) setError(false)
            }}
            placeholder={reasonPlaceholder ?? t('components:reason_dialog.reason_placeholder')}
            maxLength={maxLength}
            aria-invalid={error}
            disabled={isLoading}
          />
          <div className="flex items-start justify-between gap-3">
            {error ? (
              <p className="text-sm text-destructive">
                {t('components:reason_dialog.reason_required')}
              </p>
            ) : (
              <span aria-hidden className="text-xs text-muted-foreground" />
            )}
            <span
              className="font-mono tabular-nums text-xs text-muted-foreground"
              aria-live="polite"
            >
              {t('components:reason_dialog.counter', {
                current: reason.length,
                max: maxLength,
              })}
            </span>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            {t('components:confirm_dialog.cancel')}
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            disabled={isLoading || !reason.trim()}
          >
            {isLoading && <LoaderIcon className="size-4 animate-spin" />}
            {confirmLabel ?? t('components:confirm_dialog.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
