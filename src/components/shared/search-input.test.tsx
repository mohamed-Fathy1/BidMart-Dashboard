import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SearchInput } from './search-input'

describe('SearchInput', () => {
  it('is named by its placeholder, or by an explicit label', () => {
    render(<SearchInput value="" onChange={vi.fn()} placeholder="Store name…" />)
    render(<SearchInput value="" onChange={vi.fn()} placeholder="Name…" label="Search sellers" />)
    render(<SearchInput value="" onChange={vi.fn()} />)

    expect(screen.getByRole('textbox', { name: 'Store name…' })).toBeTruthy()
    expect(screen.getByRole('textbox', { name: 'Search sellers' })).toBeTruthy()
    expect(screen.getByRole('textbox', { name: 'components:search.placeholder' })).toBeTruthy()
  })
})
