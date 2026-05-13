import { useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Ban, Plus, Pencil, Shield, Trash2, Unlock, User } from 'lucide-react'
import type { AdminAccountListItem } from '@/types/api'
import { useUrlListState } from '@/lib/use-url-list-state'
import { useListPageData } from '@/lib/use-list-page-data'
import { useConfirmTarget } from '@/lib/use-confirm-target'
import type { AdminsSearch } from '@/routes/_authed.admins'

const adminsRoute = getRouteApi('/_authed/admins')

const adminFormSchema = z.object({
  fullName: z.string().trim().min(1, { message: 'admins:errors.validation_name' }),
  email: z
    .string()
    .trim()
    .min(1, { message: 'admins:errors.validation_email' })
    .email({ message: 'admins:errors.validation_email' }),
  phone: z.string().trim(),
  roleId: z.string().trim().min(1, { message: 'admins:errors.validation_role' }),
})

type AdminFormValues = z.infer<typeof adminFormSchema>
import { PageHeader } from '@/components/shared/page-header'
import { TableFiltersShell } from '@/components/shared/table-filters-shell'
import { SearchInput } from '@/components/shared/search-input'
import { FilterSelect } from '@/components/shared/filter-select'
import {
  DataTable,
  type RowActionItem,
} from '@/components/data-table/data-table'
import { TargetedConfirmDialog } from '@/components/shared/targeted-confirm-dialog'
import { FormDialog } from '@/components/shared/form-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Can } from '@/components/permissions/can'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { useAuthStore } from '@/features/auth/auth.store'
import { listRoles } from '@/features/roles/roles.api'
import { roleKeys } from '@/features/roles/roles.queries'
import { useAdminColumns } from '@/features/admins/admins.columns'
import {
  useAdminsQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
  useBlockAdminMutation,
  useUnblockAdminMutation,
} from '@/features/admins/admins.queries'
import { format } from '@/lib/format'
import { localizedName } from '@/lib/localized-name'

export function AdminsListPage() {
  const { t, i18n } = useTranslation()
  const currentUserId = useAuthStore((s) => s.user?.id)

  const canUpdate = usePermission(PERMISSIONS.admins.update)
  const canDelete = usePermission(PERMISSIONS.admins.delete)

  const { search, searchValue, pagination, setPagination, setSearch, setFilter } =
    useUrlListState<AdminsSearch>({ route: adminsRoute })
  const activeFilter =
    search.isActive === true ? 'true' : search.isActive === false ? 'false' : ''

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<AdminAccountListItem | null>(null)
  const deleteFlow = useConfirmTarget<AdminAccountListItem>()
  const blockFlow = useConfirmTarget<AdminAccountListItem>()
  const unblockFlow = useConfirmTarget<AdminAccountListItem>()

  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminFormSchema),
    mode: 'onBlur',
    defaultValues: { fullName: '', email: '', phone: '', roleId: '' },
  })
  const {
    register,
    control,
    handleSubmit: rhfHandleSubmit,
    reset,
    formState: { errors },
  } = form

  const { data: response, isLoading } = useAdminsQuery({
    search: searchValue || undefined,
    isActive: search.isActive,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  })

  const { data: rolesPage, isLoading: rolesLoading } = useQuery({
    queryKey: roleKeys.list({ page: 1, limit: 100 }),
    queryFn: () => listRoles({ page: 1, limit: 100 }),
    enabled: formOpen,
    staleTime: 60_000,
  })

  const roles = rolesPage?.data ?? []

  const hasActiveFilters = searchValue !== '' || activeFilter !== ''
  const { rows, meta, tableProps } = useListPageData({
    response,
    isLoading,
    pagination,
    setPagination,
    hasActiveFilters,
    clearFilters: () => {
      setSearch('')
      setFilter('isActive', undefined)
    },
  })

  const columns = useAdminColumns()

  const createMutation = useCreateAdminMutation()
  const updateMutation = useUpdateAdminMutation()
  const deleteMutation = useDeleteAdminMutation()
  const blockMutation = useBlockAdminMutation()
  const unblockMutation = useUnblockAdminMutation()

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  function openCreate() {
    reset({ fullName: '', email: '', phone: '', roleId: '' })
    setEditTarget(null)
    setFormOpen(true)
  }

  function openEdit(row: AdminAccountListItem) {
    if (row.isSuperAdmin && row.id !== currentUserId) return
    reset({
      fullName: row.fullName,
      email: row.email,
      phone: row.phone ?? '',
      roleId: row.role.id,
    })
    setEditTarget(row)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditTarget(null)
    reset({ fullName: '', email: '', phone: '', roleId: '' })
  }

  const onSubmit = (values: AdminFormValues) => {
    const phonePayload = values.phone.trim() ? values.phone.trim() : undefined
    if (editTarget) {
      updateMutation.mutate(
        {
          id: editTarget.id,
          payload: {
            fullName: values.fullName,
            phone: phonePayload ?? null,
            email: values.email,
            roleId: values.roleId,
          },
        },
        { onSuccess: closeForm },
      )
    } else {
      createMutation.mutate(
        {
          fullName: values.fullName,
          email: values.email,
          roleId: values.roleId,
          ...(phonePayload ? { phone: phonePayload } : {}),
        },
        { onSuccess: closeForm },
      )
    }
  }

  const firstErrorKey = (
    ['fullName', 'email', 'phone', 'roleId'] as const
  ).find((k) => errors[k]?.message)
  const firstErrorMessage =
    firstErrorKey && typeof errors[firstErrorKey]?.message === 'string'
      ? t(errors[firstErrorKey]!.message as string)
      : undefined

  const activeFilterOptions = useMemo(
    () => [
      { value: 'true', label: t('admins:filters.active_only') },
      { value: 'false', label: t('admins:filters.blocked_only') },
    ],
    [t],
  )

  function canEditRow(row: AdminAccountListItem): boolean {
    if (!canUpdate) return false
    if (row.isSuperAdmin && row.id !== currentUserId) return false
    return true
  }

  function getRowActions(row: AdminAccountListItem): RowActionItem<AdminAccountListItem>[] {
    const items: RowActionItem<AdminAccountListItem>[] = []

    if (canEditRow(row)) {
      items.push({
        label: t('admins:actions.edit'),
        icon: Pencil,
        onClick: (r) => openEdit(r),
      })
    }

    if (
      canUpdate &&
      !row.isSuperAdmin &&
      row.id !== currentUserId &&
      row.isActive
    ) {
      items.push({
        label: t('admins:actions.block'),
        icon: Ban,
        onClick: (r) => blockFlow.ask(r),
        variant: 'destructive',
      })
    }

    if (
      canUpdate &&
      row.id !== currentUserId &&
      !row.isActive &&
      !row.isSuperAdmin
    ) {
      items.push({
        label: t('admins:actions.unblock'),
        icon: Unlock,
        onClick: (r) => unblockFlow.ask(r),
      })
    }

    if (canDelete && !row.isSuperAdmin && row.id !== currentUserId) {
      items.push(
        ...(items.length ? [{ type: 'separator' as const }] : []),
        {
          label: t('admins:actions.delete'),
          icon: Trash2,
          onClick: (r) => deleteFlow.ask(r),
          variant: 'destructive',
        },
      )
    }

    return items
  }

  const toolbar = (
    <TableFiltersShell
      meta={
        meta != null
          ? t('admins:meta.total_accounts', {
              count: format.number(meta.total),
            })
          : undefined
      }
    >
      <SearchInput
        value={searchValue}
        onChange={(v) => setSearch(v)}
        placeholder={t('admins:search_placeholder')}
        className="w-full min-w-[min(100%,220px)] sm:w-72"
      />
      <FilterSelect
        value={activeFilter}
        onChange={(v) =>
          setFilter('isActive', v === 'true' ? true : v === 'false' ? false : undefined)
        }
        options={activeFilterOptions}
        placeholder={t('admins:filters.status')}
        className="min-w-[148px]"
      />
    </TableFiltersShell>
  )

  const showRowActions = canUpdate || canDelete

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admins:page_title')}
        description={t('admins:page_description')}
        actions={
          <Can permission={PERMISSIONS.admins.create}>
            <Button size="sm" onClick={openCreate}>
              <Plus className="size-4" />
              {t('admins:actions.create')}
            </Button>
          </Can>
        }
      />

      <DataTable
        columns={columns}
        data={rows}
        {...tableProps}
        emptyKeyPrefix="admins:empty"
        toolbar={toolbar}
        actions={showRowActions ? getRowActions : undefined}
        rowLabel={(row) => row.fullName || row.email}
        getRowId={(row) => row.id}
      />

      <FormDialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) closeForm()
        }}
        title={
          editTarget ? t('admins:form.edit_title') : t('admins:form.create_title')
        }
        description={
          editTarget ? t('admins:form.edit_description') : t('admins:form.create_description')
        }
        isEdit={!!editTarget}
        isLoading={isSubmitting}
        submitDisabled={!editTarget && (rolesLoading || roles.length === 0)}
        onSubmit={rhfHandleSubmit(onSubmit)}
        errorMessage={firstErrorMessage}
        size="md"
        suppressInitialFocus
      >
        <div className="flex flex-col gap-8">
          <section className="space-y-5">
            <div className="flex gap-3">
              <span
                className="mt-1 inline-block h-11 w-[3px] shrink-0 rounded-full bg-primary/45"
                aria-hidden
              />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <User className="size-4 shrink-0 text-primary" aria-hidden />
                  <h2 className="text-sm font-semibold tracking-tight text-foreground">
                    {t('admins:form.section_profile')}
                  </h2>
                </div>
                <p className="max-w-lg text-xs leading-relaxed text-muted-foreground">
                  {t('admins:form.section_profile_hint')}
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 ms-[calc(0.75rem+3px)]">
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="admin-full-name">{t('admins:form.full_name')}</Label>
                <Input
                  id="admin-full-name"
                  {...register('fullName')}
                  placeholder={t('admins:form.full_name_placeholder')}
                  autoComplete="name"
                  className="h-10"
                  aria-invalid={errors.fullName ? true : undefined}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="admin-email">{t('admins:form.email')}</Label>
                <Input
                  id="admin-email"
                  type="email"
                  {...register('email')}
                  placeholder={t('admins:form.email_placeholder')}
                  autoComplete="email"
                  className="h-10"
                  aria-invalid={errors.email ? true : undefined}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="admin-phone">{t('admins:form.phone')}</Label>
                <Input
                  id="admin-phone"
                  {...register('phone')}
                  placeholder={t('admins:form.phone_placeholder')}
                  dir="ltr"
                  className="h-10 font-mono tabular-nums"
                  autoComplete="tel"
                />
              </div>
            </div>
          </section>

          <section className="space-y-5 border-t border-border pt-8">
            <div className="flex gap-3">
              <span
                className="mt-1 inline-block h-11 w-[3px] shrink-0 rounded-full bg-primary/45"
                aria-hidden
              />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Shield className="size-4 shrink-0 text-primary" aria-hidden />
                  <h2 className="text-sm font-semibold tracking-tight text-foreground">
                    {t('admins:form.section_access')}
                  </h2>
                </div>
                <p className="max-w-lg text-xs leading-relaxed text-muted-foreground">
                  {t('admins:form.section_access_hint')}
                </p>
              </div>
            </div>

            <div
              className="rounded-lg border border-border bg-muted/25 p-4 shadow-rest ms-[calc(0.75rem+3px)]"
            >
              <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                <Label htmlFor="admin-role-trigger" className="text-sm font-medium">
                  {t('admins:form.role')}
                </Label>
                <p className="max-w-md text-[11px] leading-snug text-muted-foreground">
                  {t('admins:form.role_hint')}
                </p>
              </div>

              {rolesLoading ? (
                <Skeleton className="h-10 w-full rounded-md" />
              ) : roles.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/30 px-4 py-10 text-center">
                  <Shield className="size-8 text-muted-foreground/45" aria-hidden />
                  <p className="text-sm text-muted-foreground">{t('admins:form.empty_roles')}</p>
                </div>
              ) : (
                <Controller
                  name="roleId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        id="admin-role-trigger"
                        data-slot="admin-role-select"
                        className="h-10 w-full bg-card"
                        aria-invalid={errors.roleId ? true : undefined}
                      >
                        <SelectValue placeholder={t('admins:form.role_placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {localizedName(r, i18n)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
            </div>
          </section>

          {!editTarget && (
            <p className="rounded-lg border border-border bg-muted/35 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
              {t('admins:form.footer_create')}
            </p>
          )}
        </div>
      </FormDialog>

      <TargetedConfirmDialog
        flow={deleteFlow}
        i18nPrefix="admins:delete_dialog"
        getName={(r) => r.fullName}
        onConfirm={(target) =>
          deleteMutation.mutate(target.id, { onSettled: deleteFlow.close })
        }
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />

      <TargetedConfirmDialog
        flow={blockFlow}
        i18nPrefix="admins:block_dialog"
        getName={(r) => r.fullName}
        confirmLabel={t('admins:block_dialog.confirm')}
        onConfirm={(target) =>
          blockMutation.mutate(target.id, { onSettled: blockFlow.close })
        }
        isLoading={blockMutation.isPending}
        variant="destructive"
      />

      <TargetedConfirmDialog
        flow={unblockFlow}
        i18nPrefix="admins:unblock_dialog"
        getName={(r) => r.fullName}
        confirmLabel={t('admins:unblock_dialog.confirm')}
        onConfirm={(target) =>
          unblockMutation.mutate(target.id, { onSettled: unblockFlow.close })
        }
        isLoading={unblockMutation.isPending}
      />
    </div>
  )
}
