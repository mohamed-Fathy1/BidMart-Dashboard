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
  isEdit?: boolean
  contentClassName?: string
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
  isEdit = false,
  contentClassName,
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
      <DialogContent className={contentClassName}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit(e)
          }}
          className="grid gap-4"
        >
          {children}
          <DialogFooter>
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
              disabled={isLoading}
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
