import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createResourceKeys } from '@/lib/query-keys'
import { useResourceMutation } from '@/lib/use-resource-mutation'
import {
  listSettlements,
  getSettlement,
  getNewCount,
  revealIban,
  approveSettlement,
  adjustSettlement,
  rejectSettlement,
  type ListSettlementsParams,
  type AdjustSettlementPayload,
  type RejectSettlementPayload,
} from '@/features/withdrawals/withdrawals.api'
import type { SettlementDetail } from '@/types/api'

export const withdrawalKeys = createResourceKeys<ListSettlementsParams>('withdrawals')
export const withdrawalNewCountKey = ['withdrawals', 'new-count'] as const

/**
 * Server `error.code` → locale key. `/admin/*` errors come back forced-English,
 * so we map known stable codes to the admin's current locale. Codes whose
 * message carries dynamic info (amount, minimum) stay on the server message
 * via `preferServerMessageForCodes` below.
 */
const SETTLEMENT_ERROR_CODES: Record<string, string> = {
  SETTLEMENT_NOT_FOUND: 'withdrawals:errors.not_found',
  SETTLEMENT_ALREADY_ACTIONED: 'withdrawals:errors.already_actioned',
  SETTLEMENT_AMOUNT_EXCEEDS_AVAILABLE: 'withdrawals:errors.exceeds_available',
  BELOW_MIN_SETTLEMENT_AMOUNT: 'withdrawals:errors.below_min',
}

/** Server message contains the numeric detail — show it verbatim. */
const SETTLEMENT_KEEP_SERVER_MESSAGE = [
  'SETTLEMENT_AMOUNT_EXCEEDS_AVAILABLE',
  'BELOW_MIN_SETTLEMENT_AMOUNT',
] as const

export function useWithdrawalsQuery(params: ListSettlementsParams) {
  return useQuery({
    queryKey: withdrawalKeys.list(params),
    queryFn: () => listSettlements(params),
  })
}

export function useWithdrawalDetailQuery(id: string | undefined) {
  return useQuery({
    queryKey: id ? withdrawalKeys.detail(id) : ['withdrawals', 'detail', '__none__'],
    queryFn: () => getSettlement(id as string),
    enabled: !!id,
  })
}

export function useNewWithdrawalCountQuery() {
  return useQuery({
    queryKey: withdrawalNewCountKey,
    queryFn: () => getNewCount(),
    refetchInterval: 60_000,
  })
}

/** IBAN reveal is audit-logged server-side — only call on explicit user click. */
export function useRevealIbanMutation() {
  return useResourceMutation({
    mutationFn: (id: string) => revealIban(id),
    errorKey: 'withdrawals:errors.reveal_failed',
    errorKeyByCode: SETTLEMENT_ERROR_CODES,
  })
}

function patchDetailCache(
  queryClient: ReturnType<typeof useQueryClient>,
  detail: SettlementDetail,
) {
  queryClient.setQueryData(withdrawalKeys.detail(detail.id), detail)
}

export function useApproveSettlementMutation() {
  const queryClient = useQueryClient()
  return useResourceMutation({
    mutationFn: (id: string) => approveSettlement(id),
    invalidate: [withdrawalKeys.lists(), withdrawalNewCountKey],
    successKey: 'withdrawals:actions.approve_success',
    errorKey: 'withdrawals:errors.approve_failed',
    errorKeyByCode: SETTLEMENT_ERROR_CODES,
    preferServerMessageForCodes: SETTLEMENT_KEEP_SERVER_MESSAGE,
    onSuccess: (detail) => patchDetailCache(queryClient, detail),
  })
}

export function useAdjustSettlementMutation() {
  const queryClient = useQueryClient()
  return useResourceMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdjustSettlementPayload }) =>
      adjustSettlement(id, payload),
    invalidate: [withdrawalKeys.lists(), withdrawalNewCountKey],
    successKey: 'withdrawals:actions.adjust_success',
    errorKey: 'withdrawals:errors.adjust_failed',
    errorKeyByCode: SETTLEMENT_ERROR_CODES,
    preferServerMessageForCodes: SETTLEMENT_KEEP_SERVER_MESSAGE,
    onSuccess: (detail) => patchDetailCache(queryClient, detail),
  })
}

export function useRejectSettlementMutation() {
  const queryClient = useQueryClient()
  return useResourceMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RejectSettlementPayload }) =>
      rejectSettlement(id, payload),
    invalidate: [withdrawalKeys.lists(), withdrawalNewCountKey],
    successKey: 'withdrawals:actions.reject_success',
    errorKey: 'withdrawals:errors.reject_failed',
    errorKeyByCode: SETTLEMENT_ERROR_CODES,
    onSuccess: (detail) => patchDetailCache(queryClient, detail),
  })
}
