import { useNewWithdrawalCountQuery } from '@/features/withdrawals/withdrawals.queries'

/**
 * Small numeric pill rendered on the right of a sidebar nav leaf.
 * Self-gating: returns `null` for paths without a wired badge query, and for
 * paths whose count is zero. Mounts only after `PermissionLeaf` /
 * `useVisibleChildren` has confirmed the user can see the leaf, so the
 * underlying queries never run for permissionless admins.
 */
export function NavLeafBadge({ to }: { to: string }) {
  if (to === '/withdrawals') return <WithdrawalsCountBadge />
  return null
}

function WithdrawalsCountBadge() {
  const { data } = useNewWithdrawalCountQuery()
  const count = data?.count ?? 0
  if (count <= 0) return null
  return (
    <span
      aria-label={`${count} new`}
      className="relative z-[1] ms-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-100 px-1.5 text-[11px] font-semibold tabular-nums text-amber-800"
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}
