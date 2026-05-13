import { useCallback, useState } from 'react'

export interface EditTargetController<T> {
  target: T | null
  open: boolean
  setOpen: (next: boolean) => void
  startCreate: () => void
  startEdit: (row: T) => void
  close: () => void
}

/**
 * Standard dialog state for a CRUD list page: tracks the currently edited row
 * (or `null` for a new record) plus the dialog's open flag. Use to drop the
 * `[editTarget, setEditTarget] + [formOpen, setFormOpen]` boilerplate from
 * every list page.
 */
export function useEditTarget<T>(): EditTargetController<T> {
  const [target, setTarget] = useState<T | null>(null)
  const [open, setOpen] = useState(false)

  const startCreate = useCallback(() => {
    setTarget(null)
    setOpen(true)
  }, [])

  const startEdit = useCallback((row: T) => {
    setTarget(row)
    setOpen(true)
  }, [])

  const close = useCallback(() => {
    setOpen(false)
    setTarget(null)
  }, [])

  return { target, open, setOpen, startCreate, startEdit, close }
}
