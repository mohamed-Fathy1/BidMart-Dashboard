import { useQuery } from '@tanstack/react-query'
import { createResourceKeys } from '@/lib/query-keys'
import { useResourceMutation } from '@/lib/use-resource-mutation'
import {
  listComplaintTypes,
  createComplaintType,
  updateComplaintType,
  deleteComplaintType,
  type ListComplaintTypesParams,
  type CreateComplaintTypePayload,
  type UpdateComplaintTypePayload,
} from '@/features/complaint-types/complaint-types.api'

export const complaintTypeKeys = createResourceKeys<ListComplaintTypesParams>('complaint-types')

export function useComplaintTypesQuery(params: ListComplaintTypesParams) {
  return useQuery({
    queryKey: complaintTypeKeys.list(params),
    queryFn: () => listComplaintTypes(params),
  })
}

export function useCreateComplaintTypeMutation() {
  return useResourceMutation({
    mutationFn: (payload: CreateComplaintTypePayload) => createComplaintType(payload),
    invalidate: [complaintTypeKeys.all],
    successKey: 'complaint-types:actions.create_success',
    errorKey: 'complaint-types:errors.create_failed',
  })
}

export function useUpdateComplaintTypeMutation() {
  return useResourceMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateComplaintTypePayload }) =>
      updateComplaintType(id, payload),
    invalidate: [complaintTypeKeys.all],
    successKey: 'complaint-types:actions.update_success',
    errorKey: 'complaint-types:errors.update_failed',
  })
}

export function useDeleteComplaintTypeMutation() {
  return useResourceMutation({
    mutationFn: (id: string) => deleteComplaintType(id),
    invalidate: [complaintTypeKeys.all],
    successKey: 'complaint-types:actions.delete_success',
    errorKey: 'complaint-types:errors.delete_failed',
  })
}
