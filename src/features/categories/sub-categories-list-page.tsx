import { useEffect, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { PaginationState } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import type { SubCategoryListItem } from '@/types/api'
import { PageHeader } from '@/components/shared/page-header'
import { SearchInput } from '@/components/shared/search-input'
import { TableFiltersShell } from '@/components/shared/table-filters-shell'
import { DataTable, type RowActionItem } from '@/components/data-table/data-table'
import { TargetedConfirmDialog } from '@/components/shared/targeted-confirm-dialog'
import { FormDialog } from '@/components/shared/form-dialog'
import { useConfirmTarget } from '@/lib/use-confirm-target'
import { useListPageData } from '@/lib/use-list-page-data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { FormSection } from '@/components/shared/form-section'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ImageUploadField } from '@/components/shared/image-upload-field'
import { ImagePreview } from '@/components/shared/image-preview'
import { Can } from '@/components/permissions/can'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { format } from '@/lib/format'
import { localizedName } from '@/lib/localized-name'
import { useSubCategoryColumns } from '@/features/categories/sub-categories.columns'
import {
  subCategoryKeys,
  useCategoryDetailQuery,
  useCategoriesQuery,
  useSubCategoriesQuery,
  useCreateSubCategoryMutation,
  useUpdateSubCategoryMutation,
  useDeleteSubCategoryMutation,
} from '@/features/categories/categories.queries'
import {
  getSubCategoryDetail,
  type UpdateSubCategoryPayload,
} from '@/features/categories/categories.api'

const PARENT_SELECT_NONE = '__none'

export interface SubCategoriesListPageProps {
  categoryId: string
  variant: 'under-category' | 'hub'
  onHubParentChange?: (categoryId: string) => void
}

export function SubCategoriesListPage({
  categoryId,
  variant,
  onHubParentChange,
}: SubCategoriesListPageProps) {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()

  const canUpdate = usePermission(PERMISSIONS.subCategories.update)
  const canDelete = usePermission(PERMISSIONS.subCategories.delete)

  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [categoryPickSearch, setCategoryPickSearch] = useState('')

  const { data: parentCategory, isLoading: isLoadingParent } = useCategoryDetailQuery(
    variant === 'under-category' ? categoryId : '',
  )

  const listParams = {
    category_id: categoryId,
    search: search || undefined,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  }

  const { data: listResponse, isLoading: isLoadingSubs } = useSubCategoriesQuery(listParams)

  const hasActiveFilters = !!categoryId && search !== ''
  const { rows: subRows, meta, tableProps } = useListPageData({
    response: categoryId ? listResponse : undefined,
    isLoading: !!categoryId && isLoadingSubs,
    pagination,
    setPagination,
    hasActiveFilters,
    clearFilters: () => {
      setSearch('')
      setPagination((p) => ({ ...p, pageIndex: 0 }))
    },
  })

  const { data: categoryPickResponse } = useCategoriesQuery({
    search: categoryPickSearch || undefined,
    page: 1,
    limit: 100,
  })
  const categoryOptions = categoryPickResponse?.data ?? []

  const { data: formCategoriesResponse } = useCategoriesQuery({
    page: 1,
    limit: 100,
  })
  const formCategoryOptions = formCategoriesResponse?.data ?? []

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }, [categoryId])

  /* ---------- dialogs ---------- */
  const [formOpen, setFormOpen] = useState(false)
  const [formPrefilling, setFormPrefilling] = useState(false)
  const [editTargetId, setEditTargetId] = useState<string | null>(null)
  const deleteFlow = useConfirmTarget<SubCategoryListItem>()

  /* ---------- form state ---------- */
  const [parentCategoryId, setParentCategoryId] = useState(categoryId)
  const [nameEn, setNameEn] = useState('')
  const [nameAr, setNameAr] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [descriptionEn, setDescriptionEn] = useState('')
  const [descriptionAr, setDescriptionAr] = useState('')
  const [displayOrder, setDisplayOrder] = useState(0)
  const [isActive, setIsActive] = useState(true)
  const [originalParentId, setOriginalParentId] = useState<string | null>(null)

  function resetForm() {
    setParentCategoryId(categoryId)
    setNameEn('')
    setNameAr('')
    setImageUrl('')
    setDescriptionEn('')
    setDescriptionAr('')
    setDisplayOrder(0)
    setIsActive(true)
    setOriginalParentId(null)
  }

  function openCreate() {
    if (!categoryId) return
    resetForm()
    setEditTargetId(null)
    setFormOpen(true)
  }

  async function openEdit(row: SubCategoryListItem) {
    setEditTargetId(row.id)
    setFormOpen(true)
    setFormPrefilling(true)
    setParentCategoryId(row.parentCategory?.id ?? categoryId)
    setOriginalParentId(row.parentCategory?.id ?? categoryId)
    setNameEn(row.name_en)
    setNameAr(row.name_ar)
    setImageUrl(row.image_url ?? '')
    setDisplayOrder(row.display_order)
    setIsActive(row.is_active)
    setDescriptionEn('')
    setDescriptionAr('')
    try {
      const detail = await queryClient.fetchQuery({
        queryKey: subCategoryKeys.detail(row.id),
        queryFn: () => getSubCategoryDetail(row.id),
      })
      setParentCategoryId(detail.category_id)
      setOriginalParentId(detail.category_id)
      setDescriptionEn(detail.description_en ?? '')
      setDescriptionAr(detail.description_ar ?? '')
    } catch {
      /* row values already applied */
    } finally {
      setFormPrefilling(false)
    }
  }

  /* ---------- mutations ---------- */
  const createMutation = useCreateSubCategoryMutation()
  const updateMutation = useUpdateSubCategoryMutation()
  const deleteMutation = useDeleteSubCategoryMutation()

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const columns = useSubCategoryColumns({ showParent: variant === 'hub' && !!categoryId })

  /* ---------- row actions ---------- */
  function getRowActions(_row: SubCategoryListItem): RowActionItem<SubCategoryListItem>[] {
    const items: RowActionItem<SubCategoryListItem>[] = []

    if (canUpdate) {
      items.push({
        label: t('categories:sub.actions.edit'),
        icon: Pencil,
        onClick: (r) => {
          void openEdit(r)
        },
      })
    }

    if (canDelete) {
      items.push({
        label: t('categories:sub.actions.delete'),
        icon: Trash2,
        onClick: (r) => deleteFlow.ask(r),
        variant: 'destructive',
      })
    }

    return items
  }

  /* ---------- handlers ---------- */
  function handleSubmit() {
    if (editTargetId) {
      const payload: UpdateSubCategoryPayload = {
        name_en: nameEn,
        name_ar: nameAr,
        image_url: imageUrl || null,
        description_en: descriptionEn.trim() ? descriptionEn : null,
        description_ar: descriptionAr.trim() ? descriptionAr : null,
        display_order: displayOrder,
        is_active: isActive,
      }
      if (originalParentId != null && parentCategoryId !== originalParentId) {
        payload.category_id = parentCategoryId
      }
      updateMutation.mutate(
        { id: editTargetId, payload },
        {
          onSuccess: () => {
            setFormOpen(false)
            setEditTargetId(null)
          },
        },
      )
    } else {
      if (!categoryId) return
      createMutation.mutate(
        {
          category_id: categoryId,
          name_en: nameEn,
          name_ar: nameAr,
          image_url: imageUrl || null,
          description_en: descriptionEn.trim() || undefined,
          description_ar: descriptionAr.trim() || undefined,
          display_order: displayOrder,
        },
        {
          onSuccess: () => {
            setFormOpen(false)
          },
        },
      )
    }
  }

  const hubPicker =
    variant === 'hub' ? (
      <div className="grid w-full gap-4 lg:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="hub-parent-cat" className="text-foreground">
            {t('categories:sub.hub.parent_label')}
          </Label>
          <Select
            value={categoryId || PARENT_SELECT_NONE}
            onValueChange={(v) => onHubParentChange?.(v === PARENT_SELECT_NONE ? '' : v)}
          >
            <SelectTrigger id="hub-parent-cat" className="w-full">
              <SelectValue placeholder={t('categories:sub.hub.parent_placeholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PARENT_SELECT_NONE}>
                {t('categories:sub.hub.parent_none')}
              </SelectItem>
              {categoryOptions.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {localizedName(c, i18n)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <p className="text-sm font-medium leading-none text-foreground">
            {t('categories:sub.hub.search_categories_label')}
          </p>
          <SearchInput
            value={categoryPickSearch}
            onChange={setCategoryPickSearch}
            placeholder={t('categories:sub.hub.search_categories_placeholder')}
            className="w-full min-w-[min(100%,220px)] sm:max-w-xs md:w-full"
          />
        </div>
      </div>
    ) : null

  const headerDescription: ReactNode =
    variant === 'hub' ? (
      <p className="text-sm leading-snug text-muted-foreground">
        {t('categories:sub.hub.page_description')}
      </p>
    ) : isLoadingParent ? (
      <Skeleton className="h-16 w-full max-w-lg rounded-lg" />
    ) : parentCategory ? (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        <div className="flex min-w-0 items-center gap-3">
          <ImagePreview
            src={parentCategory.image_url}
            alt={parentCategory.name_en}
            size="md"
            className="ring-1 ring-border/80"
          />
          <div className="min-w-0 space-y-0.5">
            <p className="truncate font-medium text-foreground">{parentCategory.name_en}</p>
            <p className="truncate text-sm text-muted-foreground" dir="rtl">
              {parentCategory.name_ar}
            </p>
          </div>
        </div>
        <p className="text-sm leading-snug text-muted-foreground sm:max-w-md sm:border-s sm:border-border sm:ps-5">
          {t('categories:sub.page_description', { category: localizedName(parentCategory, i18n) })}
        </p>
      </div>
    ) : undefined

  const toolbar = (
    <TableFiltersShell
      meta={
        meta != null && categoryId
          ? t('categories:sub.meta.total', { count: format.number(meta.total) })
          : undefined
      }
    >
      <div className="flex w-full flex-col gap-4">
        {hubPicker}
        {categoryId ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
            <SearchInput
              value={search}
              onChange={(v) => {
                setSearch(v)
                setPagination((p) => ({ ...p, pageIndex: 0 }))
              }}
              placeholder={t('categories:sub.filters.search_placeholder')}
              className="w-full min-w-[min(100%,220px)] sm:max-w-xs md:w-80"
            />
            {variant === 'under-category' ? (
              <p className="max-w-xl text-sm text-muted-foreground sm:flex-1">
                {t('categories:sub.list_hint')}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t('categories:sub.hub.pick_parent_hint')}</p>
        )}
      </div>
    </TableFiltersShell>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('categories:sub.page_title')}
        description={headerDescription}
        actions={
          categoryId ? (
            <Can permission={PERMISSIONS.subCategories.create}>
              <Button size="sm" onClick={openCreate}>
                <Plus className="size-4" />
                {t('categories:sub.actions.create')}
              </Button>
            </Can>
          ) : null
        }
      />

      <DataTable
        columns={columns}
        data={subRows}
        {...tableProps}
        emptyKeyPrefix="categories:sub.empty"
        toolbar={toolbar}
        actions={categoryId && (canUpdate || canDelete) ? getRowActions : undefined}
        rowLabel={(row) => localizedName(row, i18n)}
        getRowId={(row) => row.id}
      />

      <FormDialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) {
            setFormOpen(false)
            setEditTargetId(null)
            setFormPrefilling(false)
          }
        }}
        title={
          editTargetId ? t('categories:sub.form.edit_title') : t('categories:sub.form.create_title')
        }
        isEdit={!!editTargetId}
        isLoading={isSubmitting}
        submitDisabled={formPrefilling}
        onSubmit={handleSubmit}
        suppressInitialFocus
      >
        <>
          {formPrefilling ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <>
              {editTargetId ? (
                <>
                  <FormSection title={t('categories:sub.form.section_parent')}>
                    <div className="grid gap-2">
                      <Label htmlFor="sub-parent-cat" className="text-foreground">
                        {t('categories:sub.form.parent_category')}
                      </Label>
                      <Select value={parentCategoryId} onValueChange={setParentCategoryId}>
                        <SelectTrigger id="sub-parent-cat" className="w-full max-w-md">
                          <SelectValue placeholder={t('categories:sub.form.parent_placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {formCategoryOptions.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {localizedName(c, i18n)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {t('categories:sub.form.parent_hint')}
                      </p>
                    </div>
                  </FormSection>
                </>
              ) : null}

              <FormSection title={t('categories:sub.form.section_names')}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="sub-name-en">{t('categories:sub.form.name_en')}</Label>
                    <Input
                      id="sub-name-en"
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)}
                      placeholder={t('categories:sub.form.name_en_placeholder')}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sub-name-ar">{t('categories:sub.form.name_ar')}</Label>
                    <Input
                      id="sub-name-ar"
                      value={nameAr}
                      onChange={(e) => setNameAr(e.target.value)}
                      placeholder={t('categories:sub.form.name_ar_placeholder')}
                      dir="rtl"
                    />
                  </div>
                </div>
              </FormSection>

              <FormSection title={t('categories:sub.form.section_media')}>
                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  <Label className="text-foreground">{t('categories:sub.form.image_url')}</Label>
                  <div className="mt-2">
                    <ImageUploadField
                      value={imageUrl}
                      onChange={setImageUrl}
                      uploadCase="sub_category_image"
                    />
                  </div>
                </div>
              </FormSection>

              <FormSection title={t('categories:sub.form.section_descriptions')}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="sub-desc-en">{t('categories:sub.form.description_en')}</Label>
                    <Textarea
                      id="sub-desc-en"
                      value={descriptionEn}
                      onChange={(e) => setDescriptionEn(e.target.value)}
                      placeholder={t('categories:sub.form.description_en_placeholder')}
                      rows={3}
                      className="min-h-20 resize-y"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sub-desc-ar">{t('categories:sub.form.description_ar')}</Label>
                    <Textarea
                      id="sub-desc-ar"
                      value={descriptionAr}
                      onChange={(e) => setDescriptionAr(e.target.value)}
                      placeholder={t('categories:sub.form.description_ar_placeholder')}
                      dir="rtl"
                      rows={3}
                      className="min-h-20 resize-y"
                    />
                  </div>
                </div>
              </FormSection>

              <FormSection title={t('categories:sub.form.section_publishing')}>
                <div className="grid gap-4 md:grid-cols-2 md:items-start">
                  <div className="grid gap-2">
                    <Label htmlFor="sub-order">{t('categories:sub.form.display_order')}</Label>
                    <Input
                      id="sub-order"
                      type="number"
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(Number(e.target.value))}
                      min={0}
                      className="max-w-48 font-mono tabular-nums"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('categories:sub.form.display_order_hint')}
                    </p>
                  </div>
                  {editTargetId ? (
                    <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-4 py-3 md:justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="sub-active" className="text-foreground">
                          {t('categories:sub.form.is_active')}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {t('categories:sub.form.is_active_hint')}
                        </p>
                      </div>
                      <Switch id="sub-active" checked={isActive} onCheckedChange={setIsActive} />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground md:pt-8">
                      {t('categories:sub.form.create_active_hint')}
                    </p>
                  )}
                </div>
              </FormSection>
            </>
          )}
        </>
      </FormDialog>

      <TargetedConfirmDialog
        flow={deleteFlow}
        i18nPrefix="categories:sub.delete_dialog"
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
