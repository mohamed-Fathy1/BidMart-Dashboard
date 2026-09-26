import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { RankedList } from './ranked-list'

interface Seller {
  id: string
  name: string
  sales: number
}

const sellers: Seller[] = [
  { id: 's-1', name: 'First store', sales: 10 },
  { id: 's-2', name: 'Second store', sales: 4 },
]

function renderInRouter(ui: ReactNode) {
  const router = createRouter({
    routeTree: createRootRoute({ component: () => ui }),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  render(<RouterProvider router={router} />)
}

const base = {
  items: sellers,
  getKey: (s: Seller) => s.id,
  metric: (s: Seller) => s.sales,
  primary: (s: Seller) => s.name,
  value: (s: Seller) => s.sales,
  emptyLabel: 'Nothing to rank yet.',
}

describe('RankedList', () => {
  it('renders rows as links when getLink is given', async () => {
    renderInRouter(
      <RankedList
        {...base}
        getLink={(s) => ({ to: '/providers/$storeId', params: { storeId: s.id } })}
      />,
    )
    const links = await screen.findAllByRole('link')
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/providers/s-1',
      '/providers/s-2',
    ])
  })

  it('keeps onSelect rows as buttons', async () => {
    const onSelect = vi.fn()
    render(<RankedList {...base} onSelect={onSelect} />)
    await userEvent.click(screen.getByRole('button', { name: /Second store/ }))
    expect(onSelect).toHaveBeenCalledWith(sellers[1])
  })

  it('renders static rows when neither is given', () => {
    render(<RankedList {...base} />)
    expect(screen.queryAllByRole('button')).toHaveLength(0)
    expect(screen.queryAllByRole('link')).toHaveLength(0)
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })
})
