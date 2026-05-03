import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Ban, Plus, Pencil, Shield, Trash2, Unlock, User } from 'lucide-react'
import type { PaginationState } from '@tanstack/react-table'
import type { AdminAccountListItem } from '@/types/api'
import { PageHeader } from '@/components/shared/page-header'
import { TableFiltersShell } from '@/components/shared/table-filters-shell'
import { SearchInput } from '@/components/shared/search-input'
import { FilterSelect } from '@/components/shared/filter-select'
import {
  DataTable,
  type RowActionItem,
} from '@/components/data-table/data-table'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
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

export function AdminsListPage() {
  const { t, i18n } = useTranslation()
  const currentUserId = useAuthStore((s) => s.user?.id)

  const canUpdate = usePermission(PERMISSIONS.admins.update)
  const canDelete = usePermission(PERMISSIONS.admins.delete)

  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<AdminAccountListItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminAccountListItem | null>(null)
  const [blockTarget, setBlockTarget] = useState<AdminAccountListItem | null>(null)
  const [unblockTarget, setUnblockTarget] = useState<AdminAccountListItem | null>(null)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [roleId, setRoleId] = useState('')

  const { data: response, isLoading } = useAdminsQuery({
    search: search || undefined,
    isActive:
      activeFilter === 'true'
        ? true
        : activeFilter === 'false'
          ? false
          : undefined,
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

  const data = response?.data ?? []
  const meta = response?.meta

  const columns = useAdminColumns()

  const createMutation = useCreateAdminMutation()
  const updateMutation = useUpdateAdminMutation()
  const deleteMutation = useDeleteAdminMutation()
  const blockMutation = useBlockAdminMutation()
  const unblockMutation = useUnblockAdminMutation()

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  function resetForm() {
    setFullName('')
    setPhone('')
    setEmail('')
    setRoleId('')
  }

  function openCreate() {
    resetForm()
    setEditTarget(null)
    setFormOpen(true)
  }

  function openEdit(row: AdminAccountListItem) {
    if (row.isSuperAdmin && row.id !== currentUserId) return
    setFullName(row.fullName)
    setPhone(row.phone ?? '')
    setEmail(row.email)
    setRoleId(row.role.id)
    setEditTarget(row)
    setFormOpen(true)
  }

  function handleSubmit() {
    const nameTrim = fullName.trim()
    const emailTrim = email.trim()
    const phoneTrim = phone.trim()

    if (!nameTrim) {
      toast.error(t('admins:errors.validation_name'))
      return
    }
    if (!emailTrim) {
      toast.error(t('admins:errors.validation_email'))
      return
    }
    if (!roleId) {
      toast.error(t('admins:errors.validation_role'))
      return
    }

    const phonePayload = phoneTrim ? phoneTrim : undefined

    if (editTarget) {
      updateMutation.mutate(
        {
          id: editTarget.id,
          payload: {
            fullName: nameTrim,
            phone: phonePayload ?? null,
            email: emailTrim,
            roleId,
          },
        },
        {
          onSuccess: () => {
            setFormOpen(false)
            setEditTarget(null)
          },
        },
      )
    } else {
      createMutation.mutate(
        {
          fullName: nameTrim,
          email: emailTrim,
          roleId,
          ...(phonePayload ? { phone: phonePayload } : {}),
        },
        {
          onSuccess: () => {
            setFormOpen(false)
          },
        },
      )
    }
  }

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
        onClick: (r) => setBlockTarget(r),
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
        onClick: (r) => setUnblockTarget(r),
      })
    }

    if (canDelete && !row.isSuperAdmin && row.id !== currentUserId) {
      items.push(
        ...(items.length ? [{ type: 'separator' as const }] : []),
        {
          label: t('admins:actions.delete'),
          icon: Trash2,
          onClick: (r) => setDeleteTarget(r),
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
        value={search}
        onChange={(v) => {
          setSearch(v)
          setPagination((p) => ({ ...p, pageIndex: 0 }))
        }}
        placeholder={t('admins:search_placeholder')}
        className="w-full min-w-[min(100%,220px)] sm:w-72"
      />
      <FilterSelect
        value={activeFilter}
        onChange={(v) => {
          setActiveFilter(v)
          setPagination((p) => ({ ...p, pageIndex: 0 }))
        }}
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
        data={data}
        pageCount={meta?.totalPages}
        totalRecords={meta?.total}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
        toolbar={toolbar}
        actions={showRowActions ? getRowActions : undefined}
        getRowId={(row) => row.id}
      />

      <FormDialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) {
            setFormOpen(false)
            setEditTarget(null)
          }
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
        onSubmit={() => handleSubmit()}
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
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t('admins:form.full_name_placeholder')}
                  autoComplete="name"
                  className="h-10"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="admin-email">{t('admins:form.email')}</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('admins:form.email_placeholder')}
                  autoComplete="email"
                  className="h-10"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="admin-phone">{t('admins:form.phone')}</Label>
                <Input
                  id="admin-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
                <Select value={roleId || undefined} onValueChange={setRoleId}>
                  <SelectTrigger id="admin-role-trigger" data-slot="admin-role-select" className="h-10 w-full bg-card">
                    <SelectValue placeholder={t('admins:form.role_placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {i18n.language === 'ar' ? r.name_ar : r.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('admins:delete_dialog.title')}
        description={
          deleteTarget
            ? t('admins:delete_dialog.description_named', { name: deleteTarget.fullName })
            : t('admins:delete_dialog.description')
        }
        onConfirm={() => {
          if (!deleteTarget) return
          deleteMutation.mutate(deleteTarget.id, {
            onSettled: () => setDeleteTarget(null),
          })
        }}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />

      <ConfirmDialog
        open={!!blockTarget}
        onOpenChange={(open) => !open && setBlockTarget(null)}
        title={t('admins:block_dialog.title')}
        description={
          blockTarget
            ? t('admins:block_dialog.description_named', { name: blockTarget.fullName })
            : t('admins:block_dialog.description')
        }
        onConfirm={() => {
          if (!blockTarget) return
          blockMutation.mutate(blockTarget.id, {
            onSettled: () => setBlockTarget(null),
          })
        }}
        isLoading={blockMutation.isPending}
        variant="destructive"
        confirmLabel={t('admins:block_dialog.confirm')}
      />

      <ConfirmDialog
        open={!!unblockTarget}
        onOpenChange={(open) => !open && setUnblockTarget(null)}
        title={t('admins:unblock_dialog.title')}
        description={
          unblockTarget
            ? t('admins:unblock_dialog.description_named', { name: unblockTarget.fullName })
            : t('admins:unblock_dialog.description')
        }
        onConfirm={() => {
          if (!unblockTarget) return
          unblockMutation.mutate(unblockTarget.id, {
            onSettled: () => setUnblockTarget(null),
          })
        }}
        isLoading={unblockMutation.isPending}
        confirmLabel={t('admins:unblock_dialog.confirm')}
      />
    </div>
  )
}
