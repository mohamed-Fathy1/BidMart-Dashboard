/**
 * Standard query-key factory. Every list-style resource produces the same
 * five keys; pass a second generic if the list endpoint takes typed params.
 *
 * The returned arrays are byte-compatible with the hand-rolled `*Keys` objects
 * that previously lived in each `*.queries.ts` file, so existing
 * `invalidateQueries({ queryKey: keys.all })` calls keep matching.
 */
export function createResourceKeys<TParams = unknown>(resource: string) {
  const all = [resource] as const
  return {
    all,
    lists: () => [resource, 'list'] as const,
    list: (params: TParams) => [resource, 'list', params] as const,
    details: () => [resource, 'detail'] as const,
    detail: (id: string) => [resource, 'detail', id] as const,
  }
}

export type ResourceKeys<TParams = unknown> = ReturnType<
  typeof createResourceKeys<TParams>
>
