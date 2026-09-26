import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FilterSelect } from './filter-select'

const options = [{ value: 'completed', label: 'Completed' }]

describe('FilterSelect', () => {
  it('keeps its name after a value is chosen', () => {
    render(<FilterSelect value="completed" onChange={vi.fn()} options={options} placeholder="Status" />)
    const trigger = screen.getByRole('combobox', { name: 'Status' })
    expect(trigger.textContent).toBe('Completed')
  })
})
