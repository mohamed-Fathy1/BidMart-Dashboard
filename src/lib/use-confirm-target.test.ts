import { describe, it, expect } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useConfirmTarget } from './use-confirm-target'

interface Row {
  id: string
}

describe('useConfirmTarget', () => {
  it('starts closed', () => {
    const { result } = renderHook(() => useConfirmTarget<Row>())
    expect(result.current.isOpen).toBe(false)
    expect(result.current.target).toBeNull()
  })

  it('ask(row) queues the row and opens the dialog', () => {
    const { result } = renderHook(() => useConfirmTarget<Row>())
    act(() => result.current.ask({ id: 'a' }))
    expect(result.current.target).toEqual({ id: 'a' })
    expect(result.current.isOpen).toBe(true)
  })

  it('close() clears both target and open state', () => {
    const { result } = renderHook(() => useConfirmTarget<Row>())
    act(() => result.current.ask({ id: 'a' }))
    act(() => result.current.close())
    expect(result.current.target).toBeNull()
    expect(result.current.isOpen).toBe(false)
  })

  it('ask twice replaces the target (a second action overrides the first)', () => {
    const { result } = renderHook(() => useConfirmTarget<Row>())
    act(() => result.current.ask({ id: 'a' }))
    act(() => result.current.ask({ id: 'b' }))
    expect(result.current.target).toEqual({ id: 'b' })
  })

  it('returns stable function identities so ConfirmDialog props do not churn', () => {
    const { result, rerender } = renderHook(() => useConfirmTarget<Row>())
    const ask1 = result.current.ask
    const close1 = result.current.close
    rerender()
    expect(result.current.ask).toBe(ask1)
    expect(result.current.close).toBe(close1)
  })
})
