import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2, List, Table2 } from 'lucide-react'
import type { Category } from '@/types/api'
import { useUrlListState } from '@/lib/use-url-list-state'
import { useListPageData } from '@/lib/use-list-page-data'
import { useConfirmTarget } from '@/lib/use-confirm-target'
import type { CategoriesSearch } from '@/routes/_authed.categories.index'

const categoriesIndexRoute = getRouteApi('/_authed/categories/')

const categoryFormSchema = z.object({
  nameEn: z.string().trim().min(1, { message: 'categories:errors.name_en_required' }),
  nameAr: z.string().trim().min(1, { message: 'categories:errors.name_ar_required' }),
  imageUrl: z.string().trim().min(1, { message: 'categories:errors.image_required' }),
  iconUrl: z.string().trim().min(1, { message: 'categories:errors.icon_required' }),
  subCategoryImageUrl: z
    .string()
    .trim()
    .min(1, { message: 'categories:errors.sub_image_required' }),
  descriptionEn: z.string(),
  descriptionAr: z.string(),
  displayOrder: z.number().min(0, { message: 'categories:errors.display_order_invalid' }),
  isActive: z.boolean(),
})

type CategoryFormValues = z.infer<typeof categoryFormSchema>

const CATEGORY_FORM_DEFAULTS: CategoryFormValues = {
  nameEn: '',
  nameAr: '',
  imageUrl: '',
  iconUrl: '',
  subCategoryImageUrl: '',
  descriptionEn: '',
  descriptionAr: '',
  displayOrder: 0,
  isActive: true,
}
import { PageHeader } from '@/components/shared/page-header'
import { SearchInput } from '@/components/shared/search-input'
import { TableFiltersShell } from '@/components/shared/table-filters-shell'
import { DataTable, type RowActionItem } from '@/components/data-table/data-table'
import { TargetedConfirmDialog } from '@/components/shared/targeted-confirm-dialog'
import { FormDialog } from '@/components/shared/form-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { FormSection } from '@/components/shared/form-section'
import { Skeleton } from '@/components/ui/skeleton'
import { ImageUploadField } from '@/components/shared/image-upload-field'
import { Can } from '@/components/permissions/can'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { format } from '@/lib/format'
import { localizedName } from '@/lib/localized-name'
import { useCategoryColumns } from '@/features/categories/categories.columns'
import {
  categoryKeys,
  useCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from '@/features/categories/categories.queries'
import { getCategoryDetail } from '@/features/categories/categories.api'

export function CategoriesListPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const canUpdate = usePermission(PERMISSIONS.categories.update)
  const canDelete = usePermission(PERMISSIONS.categories.delete)
  const canViewSubs = usePermission(PERMISSIONS.subCategories.view)

  const { searchValue, pagination, setPagination, setSearch } =
    useUrlListState<CategoriesSearch>({ route: categoriesIndexRoute })

  /* ---------- dialogs ---------- */
  const [formOpen, setFormOpen] = useState(false)
  const [formPrefilling, setFormPrefilling] = useState(false)
  const [editTarget, setEditTarget] = useState<Category | null>(null)
  const deleteFlow = useConfirmTarget<Category>()

  /* ---------- form ---------- */
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    mode: 'onBlur',
    defaultValues: CATEGORY_FORM_DEFAULTS,
  })
  const {
    register,
    control,
    handleSubmit: rhfHandleSubmit,
    reset,
    formState: { errors },
  } = form

  function openCreate() {
    reset(CATEGORY_FORM_DEFAULTS)
    setEditTarget(null)
    setFormPrefilling(false)
    setFormOpen(true)
  }

  async function openEdit(category: Category) {
    setEditTarget(category)
    setFormOpen(true)
    setFormPrefilling(true)
    try {
      const detail = await queryClient.fetchQuery({
        queryKey: categoryKeys.detail(category.id),
        queryFn: () => getCategoryDetail(category.id),
      })
      reset({
        nameEn: detail.name_en,
        nameAr: detail.name_ar,
        imageUrl: detail.image_url,
        iconUrl: detail.icon_url,
        subCategoryImageUrl: detail.sub_category_image_url,
        descriptionEn: detail.description_en ?? '',
        descriptionAr: detail.description_ar ?? '',
        displayOrder: detail.display_order,
        isActive: detail.is_active,
      })
    } catch {
      reset({
        nameEn: category.name_en,
        nameAr: category.name_ar,
        imageUrl: category.image_url,
        iconUrl: category.icon_url,
        subCategoryImageUrl: '',
        descriptionEn: '',
        descriptionAr: '',
        displayOrder: category.display_order,
        isActive: category.is_active,
      })
    } finally {
      setFormPrefilling(false)
    }
  }

  function closeForm() {
    setFormOpen(false)
    setEditTarget(null)
    setFormPrefilling(false)
  }

  /* ---------- data ---------- */
  const { data: response, isLoading } = useCategoriesQuery({
    search: searchValue || undefined,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  })

  const hasActiveFilters = searchValue !== ''
  const { rows, meta, tableProps } = useListPageData({
    response,
    isLoading,
    pagination,
    setPagination,
    hasActiveFilters,
    clearFilters: () => setSearch(''),
  })
  const columns = useCategoryColumns()

  /* ---------- mutations ---------- */
  const createMutation = useCreateCategoryMutation()
  const updateMutation = useUpdateCategoryMutation()
  const deleteMutation = useDeleteCategoryMutation()

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  /* ---------- row actions ---------- */
  function getRowActions(_row: Category): RowActionItem<Category>[] {
    const items: RowActionItem<Category>[] = [
      {
        label: t('categories:actions.view_subs'),
        icon: List,
        onClick: (r) =>
          navigate({
            to: '/categories/$categoryId/sub-categories',
            params: { categoryId: r.id },
          }),
      },
    ]

    if (canViewSubs) {
      items.push({
        label: t('categories:actions.open_sub_hub'),
        icon: Table2,
        onClick: (r) =>
          void navigate({
            to: '/categories/sub-categories',
            search: { parent: r.id },
          }),
      })
    }

    if (canUpdate || canDelete) {
      items.push({ type: 'separator' })
    }

    if (canUpdate) {
      items.push({
        label: t('categories:actions.edit'),
        icon: Pencil,
        onClick: (r) => {
          void openEdit(r)
        },
      })
    }

    if (canDelete) {
      items.push({
        label: t('categories:actions.delete'),
        icon: Trash2,
        onClick: (r) => deleteFlow.ask(r),
        variant: 'destructive',
      })
    }

    return items
  }

  const onSubmit = (values: CategoryFormValues) => {
    if (editTarget) {
      updateMutation.mutate(
        {
          id: editTarget.id,
          payload: {
            name_en: values.nameEn,
            name_ar: values.nameAr,
            image_url: values.imageUrl,
            icon_url: values.iconUrl,
            sub_category_image_url: values.subCategoryImageUrl,
            description_en: values.descriptionEn.trim() ? values.descriptionEn : null,
            description_ar: values.descriptionAr.trim() ? values.descriptionAr : null,
            display_order: values.displayOrder,
            is_active: values.isActive,
          },
        },
        { onSuccess: closeForm },
      )
    } else {
      createMutation.mutate(
        {
          name_en: values.nameEn,
          name_ar: values.nameAr,
          image_url: values.imageUrl,
          icon_url: values.iconUrl,
          sub_category_image_url: values.subCategoryImageUrl,
          description_en: values.descriptionEn.trim() || undefined,
          description_ar: values.descriptionAr.trim() || undefined,
          display_order: values.displayOrder,
        },
        { onSuccess: closeForm },
      )
    }
  }

  const firstErrorKey = (
    [
      'nameEn',
      'nameAr',
      'imageUrl',
      'iconUrl',
      'subCategoryImageUrl',
      'displayOrder',
    ] as const
  ).find((k) => errors[k]?.message)
  const firstErrorMessage =
    firstErrorKey && typeof errors[firstErrorKey]?.message === 'string'
      ? t(errors[firstErrorKey]!.message as string)
      : undefined

  const toolbar = (
    <TableFiltersShell
      meta={
        meta != null
          ? t('categories:meta.total', { count: format.number(meta.total) })
          : undefined
      }
    >
      <SearchInput
        value={searchValue}
        onChange={(v) => setSearch(v)}
        placeholder={t('categories:filters.search_placeholder')}
        className="w-full min-w-[min(100%,220px)] sm:max-w-xs md:w-80"
      />
    </TableFiltersShell>
  )

  /* ---------- render ---------- */
  return (
    <div className="space-y-6">
      <PageHeader
        title={t('categories:page_title')}
        description={t('categories:page_description')}
        actions={
          <Can permission={PERMISSIONS.categories.create}>
            <Button size="sm" onClick={openCreate}>
              <Plus className="size-4" />
              {t('categories:actions.create')}
            </Button>
          </Can>
        }
      />

      <DataTable
        columns={columns}
        data={rows}
        {...tableProps}
        emptyKeyPrefix="categories:empty"
        toolbar={toolbar}
        actions={getRowActions}
        rowLabel={(row) => localizedName(row, i18n)}
        getRowId={(row) => row.id}
        onRowClick={(row) =>
          navigate({
            to: '/categories/$categoryId/sub-categories',
            params: { categoryId: row.id },
          })
        }
      />

      <FormDialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) closeForm()
        }}
        title={
          editTarget ? t('categories:form.edit_title') : t('categories:form.create_title')
        }
        isEdit={!!editTarget}
        isLoading={isSubmitting}
        submitDisabled={formPrefilling}
        onSubmit={rhfHandleSubmit(onSubmit)}
        errorMessage={firstErrorMessage}
        suppressInitialFocus
      >
        <>
          {formPrefilling ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <div className="grid gap-3 md:grid-cols-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              <Skeleton className="h-px w-full" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-32" />
                <div className="grid gap-3 md:grid-cols-3">
                  <Skeleton className="h-24 w-full rounded-lg" />
                  <Skeleton className="h-24 w-full rounded-lg" />
                  <Skeleton className="h-24 w-full rounded-lg" />
                </div>
              </div>
              <Skeleton className="h-px w-full" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          ) : (
            <div className="space-y-0">
              <FormSection title={t('categories:form.section_names')}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="cat-name-en">{t('categories:form.name_en')}</Label>
                    <Input
                      id="cat-name-en"
                      {...register('nameEn')}
                      placeholder={t('categories:form.name_en_placeholder')}
                      aria-invalid={errors.nameEn ? true : undefined}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cat-name-ar">{t('categories:form.name_ar')}</Label>
                    <Input
                      id="cat-name-ar"
                      {...register('nameAr')}
                      placeholder={t('categories:form.name_ar_placeholder')}
                      dir="rtl"
                      aria-invalid={errors.nameAr ? true : undefined}
                    />
                  </div>
                </div>
              </FormSection>

              <FormSection title={t('categories:form.section_media')}>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="grid gap-2 rounded-lg border border-border bg-muted/20 p-4">
                    <Label className="text-foreground">{t('categories:form.image_url')}</Label>
                    <Controller
                      name="imageUrl"
                      control={control}
                      render={({ field }) => (
                        <ImageUploadField
                          value={field.value}
                          onChange={field.onChange}
                          uploadCase="category_image"
                        />
                      )}
                    />
                  </div>
                  <div className="grid gap-2 rounded-lg border border-border bg-muted/20 p-4">
                    <Label className="text-foreground">{t('categories:form.icon_url')}</Label>
                    <Controller
                      name="iconUrl"
                      control={control}
                      render={({ field }) => (
                        <ImageUploadField
                          value={field.value}
                          onChange={field.onChange}
                          uploadCase="category_image"
                        />
                      )}
                    />
                  </div>
                  <div className="grid gap-2 rounded-lg border border-border bg-muted/20 p-4 sm:col-span-2 lg:col-span-1">
                    <Label className="text-foreground">
                      {t('categories:form.sub_category_image_url')}
                    </Label>
                    <Controller
                      name="subCategoryImageUrl"
                      control={control}
                      render={({ field }) => (
                        <ImageUploadField
                          value={field.value}
                          onChange={field.onChange}
                          uploadCase="sub_category_image"
                          allowedMimeTypes={['image/gif']}
                        />
                      )}
                    />
                  </div>
                </div>
              </FormSection>

              <FormSection title={t('categories:form.section_descriptions')}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="cat-desc-en">{t('categories:form.description_en')}</Label>
                    <Textarea
                      id="cat-desc-en"
                      {...register('descriptionEn')}
                      placeholder={t('categories:form.description_en_placeholder')}
                      rows={3}
                      className="min-h-20 resize-y"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cat-desc-ar">{t('categories:form.description_ar')}</Label>
                    <Textarea
                      id="cat-desc-ar"
                      {...register('descriptionAr')}
                      placeholder={t('categories:form.description_ar_placeholder')}
                      dir="rtl"
                      rows={3}
                      className="min-h-20 resize-y"
                    />
                  </div>
                </div>
              </FormSection>

              <FormSection title={t('categories:form.section_publishing')}>
                <div className="grid gap-4 md:grid-cols-2 md:items-start">
                  <div className="grid gap-2">
                    <Label htmlFor="cat-order">{t('categories:form.display_order')}</Label>
                    <Input
                      id="cat-order"
                      type="number"
                      {...register('displayOrder', { valueAsNumber: true })}
                      min={0}
                      className="max-w-48 font-mono tabular-nums"
                      aria-invalid={errors.displayOrder ? true : undefined}
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('categories:form.display_order_hint')}
                    </p>
                  </div>
                  {editTarget ? (
                    <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-4 py-3 md:justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="cat-active" className="text-foreground">
                          {t('categories:form.is_active')}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {t('categories:form.is_active_hint')}
                        </p>
                      </div>
                      <Controller
                        name="isActive"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            id="cat-active"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground md:pt-8">
                      {t('categories:form.create_active_hint')}
                    </p>
                  )}
                </div>
              </FormSection>
            </div>
          )}
        </>
      </FormDialog>

      <TargetedConfirmDialog
        flow={deleteFlow}
        i18nPrefix="categories:delete_dialog"
        getName={(r) => localizedName(r, i18n)}
        onConfirm={(target) =>
          deleteMutation.mutate(target.id, { onSettled: deleteFlow.close })
        }
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  )
}
