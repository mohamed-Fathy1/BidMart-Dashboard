import type { KeyboardEvent } from 'react'

const SUBMIT_ON_ENTER_INPUT_TYPES = new Set([
  '',
  'text',
  'email',
  'password',
  'search',
  'tel',
  'url',
  'number',
])

/**
 * Ensures Enter in a single-line field submits the parent form.
 * Attach to `<form onKeyDown={onFormEnterKeyDown}>`.
 */
export function onFormEnterKeyDown(e: KeyboardEvent<HTMLFormElement>) {
  if (e.key !== 'Enter' || e.nativeEvent.isComposing) return

  const target = e.target
  if (!(target instanceof HTMLElement)) return
  if (target.tagName === 'TEXTAREA') return
  if (target.tagName === 'BUTTON') return
  if (target.getAttribute('role') === 'combobox') return

  if (!(target instanceof HTMLInputElement)) return
  if (!SUBMIT_ON_ENTER_INPUT_TYPES.has(target.type)) return

  e.preventDefault()
  e.currentTarget.requestSubmit()
}
