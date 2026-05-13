import { useTranslation } from 'react-i18next'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { ReasonDialog } from '@/components/shared/reason-dialog'
import type { ConfirmTargetController } from '@/lib/use-confirm-target'

interface SharedTargetedProps<T> {
  /** State controller from `useConfirmTarget<T>()`. */
  flow: ConfirmTargetController<T>
  /**
   * i18n prefix for the dialog copy — `.title` and `.description` are read.
   * Both keys receive `{ name }` interpolated from `getName(target)`.
   */
  i18nPrefix: string
  /** Extracts the human-readable label for the row (used for `{{name}}`). */
  getName: (target: T) => string
  isLoading?: boolean
  /** Override the confirm button copy. Defaults to `components:confirm_dialog.confirm`. */
  confirmLabel?: string
}

interface TargetedConfirmDialogProps<T> extends SharedTargetedProps<T> {
  /** Called when the user confirms — receives the resolved target. */
  onConfirm: (target: T) => void
  variant?: 'default' | 'destructive'
}

/**
 * `ConfirmDialog` bound to a `useConfirmTarget<T>()` flow with name-aware copy.
 * Replaces the eight-line interpolation boilerplate at every callsite.
 */
export function TargetedConfirmDialog<T>({
  flow,
  i18nPrefix,
  getName,
  onConfirm,
  isLoading = false,
  confirmLabel,
  variant = 'default',
}: TargetedConfirmDialogProps<T>) {
  const { t } = useTranslation()
  const name = flow.target ? getName(flow.target) : ''
  return (
    <ConfirmDialog
      open={flow.isOpen}
      onOpenChange={(open) => !open && flow.close()}
      title={t(`${i18nPrefix}.title`, { name })}
      description={t(`${i18nPrefix}.description`, { name })}
      confirmLabel={confirmLabel}
      onConfirm={() => {
        if (!flow.target) return
        onConfirm(flow.target)
      }}
      isLoading={isLoading}
      variant={variant}
    />
  )
}

interface TargetedReasonDialogProps<T> extends SharedTargetedProps<T> {
  /** Called when the user confirms — receives target + the typed reason. */
  onConfirm: (target: T, reason: string) => void
  variant?: 'default' | 'destructive'
}

/**
 * `ReasonDialog` bound to a `useConfirmTarget<T>()` flow with name-aware copy.
 */
export function TargetedReasonDialog<T>({
  flow,
  i18nPrefix,
  getName,
  onConfirm,
  isLoading = false,
  confirmLabel,
  variant = 'destructive',
}: TargetedReasonDialogProps<T>) {
  const { t } = useTranslation()
  const name = flow.target ? getName(flow.target) : ''
  return (
    <ReasonDialog
      open={flow.isOpen}
      onOpenChange={(open) => !open && flow.close()}
      title={t(`${i18nPrefix}.title`, { name })}
      description={t(`${i18nPrefix}.description`, { name })}
      confirmLabel={confirmLabel}
      onConfirm={(reason) => {
        if (!flow.target) return
        onConfirm(flow.target, reason)
      }}
      isLoading={isLoading}
      variant={variant}
    />
  )
}
