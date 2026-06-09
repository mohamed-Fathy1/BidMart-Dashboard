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
import { cn } from '@/lib/utils'
import { onFormEnterKeyDown } from '@/lib/form-enter-submit'

const SIZE_CLASSES = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-xl',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-3xl',
} as const

type FormDialogSize = keyof typeof SIZE_CLASSES

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
  /** Width preset. Defaults to `lg` (max-w-2xl) — the typical create/edit form. */
  size?: FormDialogSize
  contentClassName?: string
  /** Override styling on the scrollable body wrapper (padding, max-height). */
  bodyClassName?: string
  /**
   * When true, the dialog does not move focus to the first focusable control on open,
   * so the primary focus ring does not appear on one field only before the user interacts.
   */
  suppressInitialFocus?: boolean
  /**
   * Optional inline error rendered between the form body and the footer (e.g. server
   * validation failure). Use this instead of building per-form alert chrome.
   */
  errorMessage?: ReactNode
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
  size = 'lg',
  contentClassName,
  bodyClassName,
  suppressInitialFocus = false,
  errorMessage,
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
        className={cn('gap-0 p-0', SIZE_CLASSES[size], contentClassName)}
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
        <DialogHeader className="border-b border-border/60 px-6 py-5 pe-12">
          <DialogTitle className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-card">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="leading-relaxed">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit(e)
          }}
          onKeyDown={onFormEnterKeyDown}
          className="grid min-h-0"
        >
          {errorMessage && (
            <div
              role="alert"
              className="border-b border-destructive/30 bg-destructive/5 px-6 py-3 text-sm text-destructive"
            >
              {errorMessage}
            </div>
          )}
          <div
            className={cn(
              'max-h-[min(70vh,580px)] overflow-y-auto px-6 py-5 [scrollbar-gutter:stable]',
              bodyClassName,
            )}
          >
            {children}
          </div>
          <DialogFooter className="border-t border-border bg-muted/60 px-6 py-4">
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
