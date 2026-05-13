import { describe, it, expect } from 'vitest'
import { createResourceKeys } from './query-keys'

describe('createResourceKeys', () => {
  const keys = createResourceKeys<{ page: number }>('admins')

  it('produces byte-identical arrays to the legacy hand-rolled shape', () => {
    expect(keys.all).toEqual(['admins'])
    expect(keys.lists()).toEqual(['admins', 'list'])
    expect(keys.list({ page: 1 })).toEqual(['admins', 'list', { page: 1 }])
    expect(keys.details()).toEqual(['admins', 'detail'])
    expect(keys.detail('abc')).toEqual(['admins', 'detail', 'abc'])
  })

  it('returns equal arrays across calls so React Query cache hits match', () => {
    // Structural equality is what `invalidateQueries({ queryKey })` matches on.
    expect(JSON.stringify(keys.list({ page: 1 }))).toBe(
      JSON.stringify(['admins', 'list', { page: 1 }]),
    )
  })

  it('namespaces by the resource name so two features do not collide', () => {
    const adminKeys = createResourceKeys('admins')
    const userKeys = createResourceKeys('users')
    expect(adminKeys.all[0]).not.toBe(userKeys.all[0])
  })
})
