import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { KeyRound, LoaderIcon, Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { PaginationState } from '@tanstack/react-table'
import type { RoleListItem, RolePermissionModule } from '@/types/api'
import { PageHeader } from '@/components/shared/page-header'
import { SearchInput } from '@/components/shared/search-input'
import { TableFiltersShell } from '@/components/shared/table-filters-shell'
import {
  DataTable,
  type RowActionItem,
} from '@/components/data-table/data-table'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { FormDialog } from '@/components/shared/form-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Can } from '@/components/permissions/can'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { useAuthStore } from '@/features/auth/auth.store'
import { useRoleColumns } from '@/features/roles/roles.columns'
import {
  useRolesQuery,
  useRolePermissionModulesQuery,
  useRoleDetailQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} from '@/features/roles/roles.queries'
import { cn } from '@/lib/utils'
import { format } from '@/lib/format'

function ModuleHeaderCheckbox({
  module,
  selectedKeys,
  onToggleModule,
  isAr,
}: {
  module: RolePermissionModule
  selectedKeys: Set<string>
  onToggleModule: (module: RolePermissionModule, select: boolean) => void
  isAr: boolean
}) {
  const keys = module.permissions.map((p) => p.key)
  const selectedInModule = keys.filter((k) => selectedKeys.has(k)).length
  const allSelected = keys.length > 0 && selectedInModule === keys.length
  const someSelected = selectedInModule > 0 && !allSelected

  const title = isAr ? module.module_ar : module.module_en

  return (
    <div
      className={cn(
        'relative flex items-center gap-3 border-b border-border bg-muted/35 px-3 py-2.5 ps-4',
        'transition-[background-color] duration-(--duration-hover) ease-(--ease-default)',
      )}
    >
      <span
        className="pointer-events-none absolute inset-y-1 start-0 w-[3px] rounded-e-full bg-primary/45"
        aria-hidden
      />
      <Checkbox
        checked={someSelected ? 'indeterminate' : allSelected}
        onCheckedChange={(v) => onToggleModule(module, v === true)}
        aria-label={title}
        className="shrink-0"
      />
      <span className="min-w-0 flex-1 text-sm font-semibold leading-tight tracking-tight text-foreground">
        {title}
      </span>
      <span className="shrink-0 rounded-md border border-border bg-card px-2 py-0.5 font-mono text-[11px] tabular-nums text-muted-foreground">
        {selectedInModule}/{keys.length}
      </span>
    </div>
  )
}

function PermissionModulesSkeleton() {
  return (
    <div className="space-y-2 p-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-lg border border-border bg-card shadow-rest"
        >
          <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-3 py-2.5">
            <Skeleton className="size-4 rounded-[4px]" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="ms-auto h-5 w-10 rounded-md" />
          </div>
          <div className="grid gap-2 p-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((__, j) => (
              <Skeleton key={j} className="h-9 rounded-md" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function RolesListPage() {
  const { t, i18n } = useTranslation()
  const isAr = i18n.language === 'ar'
  const currentRoleId = useAuthStore((s) => s.user?.roleId)

  const canUpdate = usePermission(PERMISSIONS.roles.update)
  const canDelete = usePermission(PERMISSIONS.roles.delete)

  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<RoleListItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<RoleListItem | null>(null)

  const [nameEn, setNameEn] = useState('')
  const [nameAr, setNameAr] = useState('')
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(() => new Set())

  const { data: response, isLoading } = useRolesQuery({
    search: search || undefined,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  })

  const { data: permissionModules = [], isLoading: modulesLoading } =
    useRolePermissionModulesQuery(formOpen)

  const detailQuery = useRoleDetailQuery(editTarget?.id ?? '', !!editTarget && formOpen)

  const data = response?.data ?? []
  const meta = response?.meta

  const columns = useRoleColumns()

  const createMutation = useCreateRoleMutation()
  const updateMutation = useUpdateRoleMutation()
  const deleteMutation = useDeleteRoleMutation()

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const editBlocked =
    !!editTarget && !detailQuery.data && (detailQuery.isPending || detailQuery.isFetching)

  const totalPermissionSlots = useMemo(
    () => permissionModules.reduce((n, m) => n + m.permissions.length, 0),
    [permissionModules],
  )

  useEffect(() => {
    if (!formOpen || !editTarget || !detailQuery.data) return
    if (detailQuery.data.id !== editTarget.id) return
    const d = detailQuery.data
    setNameEn(d.name_en)
    setNameAr(d.name_ar)
    const keys = Array.isArray(d.permissions) ? d.permissions : []
    setSelectedKeys(new Set(keys))
  }, [formOpen, editTarget?.id, detailQuery.data, detailQuery.dataUpdatedAt])

  function resetForm() {
    setNameEn('')
    setNameAr('')
    setSelectedKeys(new Set())
  }

  function openCreate() {
    resetForm()
    setEditTarget(null)
    setFormOpen(true)
  }

  function openEdit(role: RoleListItem) {
    if (role.isProtected) return
    setNameEn(role.name_en)
    setNameAr(role.name_ar)
    setSelectedKeys(new Set())
    setEditTarget(role)
    setFormOpen(true)
  }

  function togglePermission(key: string, checked: boolean) {
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      if (checked) next.add(key)
      else next.delete(key)
      return next
    })
  }

  function toggleModule(module: RolePermissionModule, select: boolean) {
    const keys = module.permissions.map((p) => p.key)
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      for (const k of keys) {
        if (select) next.add(k)
        else next.delete(k)
      }
      return next
    })
  }

  function canEditRow(role: RoleListItem) {
    return canUpdate && !role.isProtected
  }

  function canDeleteRow(role: RoleListItem) {
    if (!canDelete) return false
    if (role.isProtected) return false
    if (role.adminCount > 0) return false
    if (currentRoleId && role.id === currentRoleId) return false
    return true
  }

  function getRowActions(role: RoleListItem): RowActionItem<RoleListItem>[] {
    const items: RowActionItem<RoleListItem>[] = []

    if (canEditRow(role)) {
      items.push({
        label: t('roles:actions.edit'),
        icon: Pencil,
        onClick: (r) => openEdit(r),
      })
    }

    if (canDelete) {
      items.push({
        label: t('roles:actions.delete'),
        icon: Trash2,
        onClick: (r) => setDeleteTarget(r),
        variant: 'destructive',
        disabled: !canDeleteRow(role),
      })
    }

    return items
  }

  function handleSubmit() {
    const en = nameEn.trim()
    const ar = nameAr.trim()
    if (!en || !ar) {
      toast.error(t('roles:errors.validation'))
      return
    }
    const permissions = Array.from(selectedKeys)
    if (editTarget) {
      updateMutation.mutate(
        {
          id: editTarget.id,
          payload: { name_en: en, name_ar: ar, permissions },
        },
        {
          onSuccess: () => {
            setFormOpen(false)
            setEditTarget(null)
          },
        },
      )
      return
    }
    createMutation.mutate(
      { name_en: en, name_ar: ar, permissions },
      {
        onSuccess: () => {
          setFormOpen(false)
        },
      },
    )
  }

  const toolbar = useMemo(
    () => (
      <TableFiltersShell
        meta={
          meta != null
            ? t('roles:meta.total_roles', { count: format.number(meta.total) })
            : undefined
        }
      >
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v)
            setPagination((p) => ({ ...p, pageIndex: 0 }))
          }}
          placeholder={t('roles:search_placeholder')}
          className="w-full min-w-[min(100%,220px)] sm:max-w-md"
        />
      </TableFiltersShell>
    ),
    [search, t, meta],
  )

  const hasRowMenu = canUpdate || canDelete

  const selectedCount = selectedKeys.size

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('roles:page_title')}
        description={t('roles:page_description')}
        actions={
          <Can permission={PERMISSIONS.roles.create}>
            <Button size="sm" onClick={openCreate} className="gap-2">
              <Plus className="size-4 shrink-0" />
              {t('roles:actions.create')}
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
        actions={hasRowMenu ? getRowActions : undefined}
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
          editTarget ? t('roles:form.edit_title') : t('roles:form.create_title')
        }
        description={
          editTarget?.isProtected
            ? undefined
            : editTarget
              ? t('roles:form.edit_description')
              : t('roles:form.create_description')
        }
        isEdit={!!editTarget}
        isLoading={isSubmitting}
        submitDisabled={
          editBlocked ||
          modulesLoading ||
          (!editTarget && permissionModules.length === 0)
        }
        onSubmit={() => {
          handleSubmit()
        }}
        submitLabel={
          editTarget ? t('components:form_dialog.save') : t('roles:actions.create')
        }
        size="xl"
      >
        <div className="grid gap-6">
          {editBlocked && (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground">
              <LoaderIcon className="size-4 shrink-0 animate-spin text-primary" />
              {t('roles:form.loading_detail')}
            </div>
          )}

          <section className="space-y-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-semibold text-foreground">
                {t('roles:form.section_identity')}
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {t('roles:form.section_identity_hint')}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="role-name-en">{t('roles:form.name_en')}</Label>
                <Input
                  id="role-name-en"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder={t('roles:form.name_en_placeholder')}
                  disabled={!!editTarget?.isProtected || editBlocked}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role-name-ar">{t('roles:form.name_ar')}</Label>
                <Input
                  id="role-name-ar"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder={t('roles:form.name_ar_placeholder')}
                  dir="rtl"
                  disabled={!!editTarget?.isProtected || editBlocked}
                />
              </div>
            </div>
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <KeyRound className="size-4 shrink-0 text-primary" aria-hidden />
                  <Label className="text-base font-semibold leading-none">
                    {t('roles:form.permissions')}
                  </Label>
                </div>
                <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
                  {t('roles:form.permissions_hint')}
                </p>
              </div>
              {totalPermissionSlots > 0 && !modulesLoading && (
                <span className="shrink-0 rounded-md border border-border bg-muted/50 px-2.5 py-1 font-mono text-[11px] tabular-nums text-muted-foreground">
                  {t('roles:form.selected_of_total', {
                    selected: selectedCount,
                    total: totalPermissionSlots,
                  })}
                </span>
              )}
            </div>

            {modulesLoading ? (
              <div className="overflow-hidden rounded-xl border border-border bg-muted/25 shadow-rest">
                <PermissionModulesSkeleton />
              </div>
            ) : permissionModules.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-12 text-center">
                <KeyRound className="size-8 text-muted-foreground/50" aria-hidden />
                <p className="text-sm text-muted-foreground">
                  {t('roles:form.no_permission_modules')}
                </p>
              </div>
            ) : (
              <ScrollArea className="h-88 rounded-xl border border-border bg-muted/20 shadow-rest">
                <div className="flex flex-col gap-2 p-2">
                  {permissionModules.map((module) => (
                    <article
                      key={`${module.module_en}-${module.module_ar}`}
                      className="overflow-hidden rounded-lg border border-border bg-card shadow-rest"
                    >
                      <ModuleHeaderCheckbox
                        module={module}
                        selectedKeys={selectedKeys}
                        onToggleModule={toggleModule}
                        isAr={isAr}
                      />
                      <ul className="grid gap-0 p-2 sm:grid-cols-2 sm:gap-1">
                        {module.permissions.map((perm) => {
                          const label = isAr ? perm.label_ar : perm.label_en
                          const checked = selectedKeys.has(perm.key)
                          return (
                            <li key={perm.key}>
                              <label
                                htmlFor={`perm-${perm.key}`}
                                className={cn(
                                  'flex cursor-pointer items-start gap-2.5 rounded-md px-2 py-1.5',
                                  'border border-transparent',
                                  'transition-[background-color,border-color] duration-(--duration-hover) ease-(--ease-default)',
                                  !editBlocked && 'hover:border-border hover:bg-muted/55',
                                  checked && 'border-primary/25 bg-primary/5',
                                  editBlocked && 'cursor-not-allowed opacity-60',
                                )}
                              >
                                <Checkbox
                                  id={`perm-${perm.key}`}
                                  checked={checked}
                                  onCheckedChange={(v) =>
                                    togglePermission(perm.key, v === true)
                                  }
                                  disabled={editBlocked}
                                  className="mt-0.5 shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <span
                                    className={cn(
                                      'block text-sm leading-snug font-normal',
                                      checked ? 'text-foreground' : 'text-foreground/90',
                                    )}
                                  >
                                    {label}
                                  </span>
                                  <p className="mt-0.5 truncate font-mono text-[10px] tracking-tight text-muted-foreground/80">
                                    {perm.key}
                                  </p>
                                </div>
                              </label>
                            </li>
                          )
                        })}
                      </ul>
                    </article>
                  ))}
                </div>
              </ScrollArea>
            )}
          </section>
        </div>

        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {t('roles:form.footer_note')}
        </p>
      </FormDialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('roles:delete_dialog.title')}
        description={t('roles:delete_dialog.description')}
        onConfirm={() => {
          if (!deleteTarget || !canDeleteRow(deleteTarget)) return
          deleteMutation.mutate(deleteTarget.id, {
            onSettled: () => setDeleteTarget(null),
          })
        }}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  )
}
