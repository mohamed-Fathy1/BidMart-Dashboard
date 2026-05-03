import { type ReactNode } from 'react'
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
import { Button } from '@/components/ui/button'

interface FormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  submitLabel?: string
  isLoading?: boolean
  /** Keeps Cancel enabled; disables only the submit action (e.g. waiting for prerequisite data). */
  submitDisabled?: boolean
  isEdit?: boolean
  contentClassName?: string
  /**
   * When true, the dialog does not move focus to the first focusable control on open,
   * so the primary focus ring does not appear on one field only before the user interacts.
   */
  suppressInitialFocus?: boolean
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  submitLabel,
  isLoading = false,
  submitDisabled = false,
  isEdit = false,
  contentClassName,
  suppressInitialFocus = false,
}: FormDialogProps) {
  const { t } = useTranslation()

  const defaultLabel = isEdit
    ? t('components:form_dialog.save')
    : t('components:form_dialog.create')

  return (
    <Dialog open={open} onOpenChange={(next) => {
      if (!next && isLoading) return
      onOpenChange(next)
    }}>
      <DialogContent
        className={contentClassName}
        onOpenAutoFocus={(e) => {
          if (!suppressInitialFocus) return
          e.preventDefault()
          const root = e.currentTarget
          if (!(root instanceof HTMLElement)) return
          const heading = root.querySelector('[data-slot="dialog-title"]')
          if (heading instanceof HTMLElement) {
            heading.tabIndex = -1
            heading.focus()
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit(e)
          }}
          className="grid gap-5"
        >
          {children}
          <DialogFooter className="-mx-6 -mb-6 mt-2 border-t border-border/60 bg-muted/30 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t('components:form_dialog.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isLoading || submitDisabled}
            >
              {isLoading && <LoaderIcon className="size-4 animate-spin" />}
              {isLoading
                ? t('components:form_dialog.saving')
                : submitLabel ?? defaultLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
