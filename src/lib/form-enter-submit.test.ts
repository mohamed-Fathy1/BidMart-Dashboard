import type { KeyboardEvent } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { onFormEnterKeyDown } from './form-enter-submit'

function keyDown(
  target: EventTarget,
  form: HTMLFormElement,
  key = 'Enter',
) {
  const preventDefault = vi.fn()
  const event = {
    key,
    target,
    currentTarget: form,
    nativeEvent: { isComposing: false },
    preventDefault,
  } as unknown as KeyboardEvent<HTMLFormElement>
  onFormEnterKeyDown(event)
  return { preventDefault, form }
}

describe('onFormEnterKeyDown', () => {
  it('submits when Enter is pressed in a text input', () => {
    const form = document.createElement('form')
    const input = document.createElement('input')
    form.appendChild(input)
    const requestSubmit = vi.fn()
    form.requestSubmit = requestSubmit

    const { preventDefault } = keyDown(input, form)

    expect(preventDefault).toHaveBeenCalled()
    expect(requestSubmit).toHaveBeenCalled()
  })

  it('does not submit when Enter is pressed in a textarea', () => {
    const form = document.createElement('form')
    const textarea = document.createElement('textarea')
    form.appendChild(textarea)
    const requestSubmit = vi.fn()
    form.requestSubmit = requestSubmit

    const { preventDefault } = keyDown(textarea, form)

    expect(preventDefault).not.toHaveBeenCalled()
    expect(requestSubmit).not.toHaveBeenCalled()
  })

  it('does not submit when Enter is pressed in a button', () => {
    const form = document.createElement('form')
    const button = document.createElement('button')
    form.appendChild(button)
    const requestSubmit = vi.fn()
    form.requestSubmit = requestSubmit

    const { preventDefault } = keyDown(button, form)

    expect(preventDefault).not.toHaveBeenCalled()
    expect(requestSubmit).not.toHaveBeenCalled()
  })
})
