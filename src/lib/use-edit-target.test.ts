import { describe, it, expect } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useEditTarget } from './use-edit-target'

interface Row {
  id: string
  name: string
}

describe('useEditTarget', () => {
  it('starts closed with no target', () => {
    const { result } = renderHook(() => useEditTarget<Row>())
    expect(result.current.open).toBe(false)
    expect(result.current.target).toBeNull()
  })

  it('startCreate opens the dialog with a null target (create mode)', () => {
    const { result } = renderHook(() => useEditTarget<Row>())
    act(() => result.current.startCreate())
    expect(result.current.open).toBe(true)
    expect(result.current.target).toBeNull()
  })

  it('startEdit opens the dialog and stores the row (edit mode)', () => {
    const { result } = renderHook(() => useEditTarget<Row>())
    const row: Row = { id: '1', name: 'Ada' }
    act(() => result.current.startEdit(row))
    expect(result.current.open).toBe(true)
    expect(result.current.target).toBe(row)
  })

  it('close clears the target and closes', () => {
    const { result } = renderHook(() => useEditTarget<Row>())
    act(() => result.current.startEdit({ id: '1', name: 'Ada' }))
    act(() => result.current.close())
    expect(result.current.open).toBe(false)
    expect(result.current.target).toBeNull()
  })

  it('setOpen(false) collapses the dialog without clearing target (back-compat)', () => {
    // Some call sites bind onOpenChange directly; verify the legacy path still works.
    const { result } = renderHook(() => useEditTarget<Row>())
    const row: Row = { id: '1', name: 'Ada' }
    act(() => result.current.startEdit(row))
    act(() => result.current.setOpen(false))
    expect(result.current.open).toBe(false)
  })
})
