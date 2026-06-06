import { useQuery } from '@tanstack/react-query'
import { createResourceKeys } from '@/lib/query-keys'
import { useResourceMutation } from '@/lib/use-resource-mutation'
import {
  listBanks,
  createBank,
  updateBank,
  toggleBankStatus,
  type ListBanksParams,
  type CreateBankPayload,
  type UpdateBankPayload,
} from '@/features/banks/banks.api'

export const bankKeys = createResourceKeys<ListBanksParams>('banks')

const BANK_ERROR_CODES: Record<string, string> = {
  BANK_NOT_FOUND: 'banks:errors.not_found',
  BANK_NAME_DUPLICATE: 'banks:errors.name_duplicate',
  BANK_HAS_PENDING_SETTLEMENTS: 'banks:errors.has_pending',
}

export function useBanksQuery(params: ListBanksParams) {
  return useQuery({
    queryKey: bankKeys.list(params),
    queryFn: () => listBanks(params),
  })
}

export function useCreateBankMutation() {
  return useResourceMutation({
    mutationFn: (payload: CreateBankPayload) => createBank(payload),
    invalidate: [bankKeys.all],
    successKey: 'banks:actions.create_success',
    errorKey: 'banks:errors.create_failed',
    errorKeyByCode: BANK_ERROR_CODES,
  })
}

export function useUpdateBankMutation() {
  return useResourceMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateBankPayload }) =>
      updateBank(id, payload),
    invalidate: [bankKeys.all],
    successKey: 'banks:actions.update_success',
    errorKey: 'banks:errors.update_failed',
    errorKeyByCode: BANK_ERROR_CODES,
  })
}

export function useToggleBankMutation() {
  return useResourceMutation({
    mutationFn: (id: string) => toggleBankStatus(id),
    invalidate: [bankKeys.all],
    successKey: 'banks:actions.toggle_success',
    errorKey: 'banks:errors.toggle_failed',
    errorKeyByCode: BANK_ERROR_CODES,
  })
}
