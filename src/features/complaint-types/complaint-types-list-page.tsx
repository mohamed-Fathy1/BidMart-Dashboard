import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getRouteApi } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2, ToggleLeft } from 'lucide-react'
import type { ComplaintType } from '@/types/api'
import { useUrlListState } from '@/lib/use-url-list-state'
import { useListPageData } from '@/lib/use-list-page-data'
import { useConfirmTarget } from '@/lib/use-confirm-target'
import type { ComplaintTypesSearch } from '@/routes/_authed.complaint-types'
import { PageHeader } from '@/components/shared/page-header'
import { FilterSelect } from '@/components/shared/filter-select'
import { TableFiltersShell } from '@/components/shared/table-filters-shell'
import { SearchInput } from '@/components/shared/search-input'
import { DataTable, type RowActionItem } from '@/components/data-table/data-table'
import { TargetedConfirmDialog } from '@/components/shared/targeted-confirm-dialog'
import { FormDialog } from '@/components/shared/form-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { FormSection } from '@/components/shared/form-section'
import { Can } from '@/components/permissions/can'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { useComplaintTypeColumns } from '@/features/complaint-types/complaint-types.columns'
import {
  useComplaintTypesQuery,
  useCreateComplaintTypeMutation,
  useUpdateComplaintTypeMutation,
  useDeleteComplaintTypeMutation,
} from '@/features/complaint-types/complaint-types.queries'
import { format } from '@/lib/format'

const complaintTypesRoute = getRouteApi('/_authed/complaint-types')

const complaintTypeFormSchema = z.object({
  nameEn: z.string().trim().min(1, { message: 'complaint-types:errors.name_en_required' }),
  nameAr: z.string().trim().min(1, { message: 'complaint-types:errors.name_ar_required' }),
  isActive: z.boolean(),
})

type ComplaintTypeFormValues = z.infer<typeof complaintTypeFormSchema>

export function ComplaintTypesListPage() {
  const { t, i18n } = useTranslation()
  const { search, searchValue, pagination, setPagination, setSearch, setFilter } =
    useUrlListState<ComplaintTypesSearch>({ route: complaintTypesRoute })
  const activeFilter =
    search.isActive === true ? 'true' : search.isActive === false ? 'false' : ''

  const canUpdate = usePermission(PERMISSIONS.complaints.updateType)
  const canDelete = usePermission(PERMISSIONS.complaints.deleteType)

  /* ---------- dialogs ---------- */
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ComplaintType | null>(null)
  const deleteFlow = useConfirmTarget<ComplaintType>()

  /* ---------- form ---------- */
  const {
    register,
    control,
    handleSubmit: rhfHandleSubmit,
    reset,
    formState: { errors },
  } = useForm<ComplaintTypeFormValues>({
    resolver: zodResolver(complaintTypeFormSchema),
    mode: 'onBlur',
    defaultValues: { nameEn: '', nameAr: '', isActive: true },
  })

  function openCreate() {
    reset({ nameEn: '', nameAr: '', isActive: true })
    setEditTarget(null)
    setFormOpen(true)
  }

  function openEdit(ct: ComplaintType) {
    reset({ nameEn: ct.name_en, nameAr: ct.name_ar, isActive: ct.is_active })
    setEditTarget(ct)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditTarget(null)
  }

  /* ---------- data ---------- */
  const { data: response, isLoading } = useComplaintTypesQuery({
    search: searchValue.trim() || undefined,
    isActive: search.isActive,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  })

  const hasActiveFilters = searchValue.trim() !== '' || activeFilter !== ''
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

  const columns = useComplaintTypeColumns()

  /* ---------- mutations ---------- */
  const createMutation = useCreateComplaintTypeMutation()
  const updateMutation = useUpdateComplaintTypeMutation()
  const deleteMutation = useDeleteComplaintTypeMutation()

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const firstErrorKey = (['nameEn', 'nameAr'] as const).find((k) => errors[k]?.message)
  const firstErrorMessage =
    firstErrorKey && typeof errors[firstErrorKey]?.message === 'string'
      ? t(errors[firstErrorKey]!.message as string)
      : undefined

  /* ---------- filter options ---------- */
  const activeOptions = useMemo(
    () => [
      { value: 'true', label: t('complaint-types:active_options.active') },
      { value: 'false', label: t('complaint-types:active_options.inactive') },
    ],
    [t],
  )

  /* ---------- row actions ---------- */
  function getRowActions(row: ComplaintType): RowActionItem<ComplaintType>[] {
    const items: RowActionItem<ComplaintType>[] = []

    if (canUpdate) {
      items.push({
        label: t('complaint-types:actions.edit'),
        icon: Pencil,
        onClick: (r) => openEdit(r),
      })
      items.push({
        label: row.is_active
          ? t('complaint-types:actions.deactivate')
          : t('complaint-types:actions.activate'),
        icon: ToggleLeft,
        onClick: (r) =>
          updateMutation.mutate({ id: r.id, payload: { is_active: !r.is_active } }),
        disabled: updateMutation.isPending,
      })
    }

    if (canDelete) {
      if (canUpdate) items.push({ type: 'separator' })
      items.push({
        label: t('complaint-types:actions.delete'),
        icon: Trash2,
        onClick: (r) => deleteFlow.ask(r),
        variant: 'destructive',
      })
    }

    return items
  }

  const onSubmit = (values: ComplaintTypeFormValues) => {
    if (editTarget) {
      updateMutation.mutate(
        {
          id: editTarget.id,
          payload: { name_en: values.nameEn, name_ar: values.nameAr, is_active: values.isActive },
        },
        { onSuccess: closeForm },
      )
    } else {
      createMutation.mutate(
        { name_en: values.nameEn, name_ar: values.nameAr },
        { onSuccess: closeForm },
      )
    }
  }

  /* ---------- localised name for dialogs ---------- */
  function localName(ct: ComplaintType) {
    return i18n.language === 'ar' ? ct.name_ar : ct.name_en
  }

  /* ---------- toolbar ---------- */
  const toolbar = (
    <TableFiltersShell
      meta={
        meta != null
          ? t('complaint-types:meta.total', { count: format.number(meta.total) })
          : undefined
      }
    >
      <SearchInput
        value={searchValue}
        onChange={(v) => setSearch(v)}
        placeholder={t('complaint-types:filters.search_placeholder')}
        className="w-full min-w-[min(100%,220px)] sm:max-w-xs md:w-80"
      />
      <FilterSelect
        value={activeFilter}
        onChange={(v) =>
          setFilter('isActive', v === 'true' ? true : v === 'false' ? false : undefined)
        }
        options={activeOptions}
        placeholder={t('complaint-types:filters.status')}
        className="min-w-[160px]"
      />
    </TableFiltersShell>
  )

  /* ---------- render ---------- */
  return (
    <div className="space-y-6">
      <PageHeader
        title={t('complaint-types:page_title')}
        description={t('complaint-types:page_description')}
        actions={
          <Can permission={PERMISSIONS.complaints.createType}>
            <Button size="sm" onClick={openCreate}>
              <Plus className="size-4" />
              {t('complaint-types:actions.create')}
            </Button>
          </Can>
        }
      />

      <DataTable
        columns={columns}
        data={rows}
        {...tableProps}
        emptyKeyPrefix="complaint-types:empty"
        toolbar={toolbar}
        actions={canUpdate || canDelete ? getRowActions : undefined}
        rowLabel={(row) => localName(row)}
        getRowId={(row) => row.id}
        onRowClick={canUpdate ? (row) => openEdit(row) : undefined}
      />

      <FormDialog
        open={formOpen}
        onOpenChange={(open) => { if (!open) closeForm() }}
        title={editTarget ? t('complaint-types:form.edit_title') : t('complaint-types:form.create_title')}
        description={t('complaint-types:form.dialog_description')}
        isEdit={!!editTarget}
        isLoading={isSubmitting}
        onSubmit={rhfHandleSubmit(onSubmit)}
        errorMessage={firstErrorMessage}
        suppressInitialFocus
      >
        <div className="space-y-0">
          <FormSection title={t('complaint-types:form.section_names')}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="ct-name-en">{t('complaint-types:form.name_en')}</Label>
                <Input
                  id="ct-name-en"
                  {...register('nameEn')}
                  placeholder={t('complaint-types:form.name_en_placeholder')}
                  aria-invalid={errors.nameEn ? true : undefined}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ct-name-ar">{t('complaint-types:form.name_ar')}</Label>
                <Input
                  id="ct-name-ar"
                  {...register('nameAr')}
                  placeholder={t('complaint-types:form.name_ar_placeholder')}
                  dir="rtl"
                  aria-invalid={errors.nameAr ? true : undefined}
                />
              </div>
            </div>
          </FormSection>

          {editTarget && (
            <FormSection title={t('complaint-types:form.section_visibility')}>
              <div className="rounded-lg border border-border bg-muted/40 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <Label htmlFor="ct-active" className="text-foreground">
                      {t('complaint-types:form.is_active')}
                    </Label>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {t('complaint-types:form.active_hint')}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center sm:ps-4">
                    <Controller
                      name="isActive"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          id="ct-active"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            </FormSection>
          )}
        </div>
      </FormDialog>

      <TargetedConfirmDialog
        flow={deleteFlow}
        i18nPrefix="complaint-types:delete_dialog"
        getName={(r) => localName(r)}
        onConfirm={(target) =>
          deleteMutation.mutate(target.id, { onSettled: deleteFlow.close })
        }
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  )
}
