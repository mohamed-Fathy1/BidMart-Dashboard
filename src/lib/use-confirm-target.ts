import { useCallback, useState } from 'react'

export interface ConfirmTargetController<T> {
  /** The row queued for confirmation, or `null` when the dialog is closed. */
  target: T | null
  /** `true` when a target is set — bind to `<ConfirmDialog open=…>`. */
  isOpen: boolean
  /** Queue a row for confirmation (opens the dialog). */
  ask: (row: T) => void
  /** Close the dialog and clear the target. Safe to call from `onSettled`. */
  close: () => void
}

/**
 * Dialog state for a single confirmation flow (delete, block, ban, …). Every
 * list page typically has 2–4 of these; using this hook keeps the boilerplate
 * down to one line per action instead of a `useState` + an `onOpenChange`
 * lambda + an `onSettled` cleanup.
 *
 * Bind to a ConfirmDialog like:
 * ```tsx
 * const del = useConfirmTarget<Row>()
 * // …
 * <ConfirmDialog
 *   open={del.isOpen}
 *   onOpenChange={(o) => !o && del.close()}
 *   onConfirm={() => del.target && mutation.mutate(del.target.id, { onSettled: del.close })}
 * />
 * ```
 */
export function useConfirmTarget<T>(): ConfirmTargetController<T> {
  const [target, setTarget] = useState<T | null>(null)

  const ask = useCallback((row: T) => setTarget(row), [])
  const close = useCallback(() => setTarget(null), [])

  return { target, isOpen: target !== null, ask, close }
}
