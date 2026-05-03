import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type { PaginationState } from '@tanstack/react-table'
import { Plus, Pencil, Trash2, List, Table2 } from 'lucide-react'
import type { Category } from '@/types/api'
import { PageHeader } from '@/components/shared/page-header'
import { SearchInput } from '@/components/shared/search-input'
import { TableFiltersShell } from '@/components/shared/table-filters-shell'
import { DataTable, type RowActionItem } from '@/components/data-table/data-table'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
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
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const canUpdate = usePermission(PERMISSIONS.categories.update)
  const canDelete = usePermission(PERMISSIONS.categories.delete)
  const canViewSubs = usePermission(PERMISSIONS.subCategories.view)

  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  /* ---------- dialogs ---------- */
  const [formOpen, setFormOpen] = useState(false)
  const [formPrefilling, setFormPrefilling] = useState(false)
  const [editTarget, setEditTarget] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)

  /* ---------- form state ---------- */
  const [nameEn, setNameEn] = useState('')
  const [nameAr, setNameAr] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [iconUrl, setIconUrl] = useState('')
  const [subCategoryImageUrl, setSubCategoryImageUrl] = useState('')
  const [descriptionEn, setDescriptionEn] = useState('')
  const [descriptionAr, setDescriptionAr] = useState('')
  const [displayOrder, setDisplayOrder] = useState(0)
  const [isActive, setIsActive] = useState(true)

  function resetForm() {
    setNameEn('')
    setNameAr('')
    setImageUrl('')
    setIconUrl('')
    setSubCategoryImageUrl('')
    setDescriptionEn('')
    setDescriptionAr('')
    setDisplayOrder(0)
    setIsActive(true)
  }

  function openCreate() {
    resetForm()
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
      setNameEn(detail.name_en)
      setNameAr(detail.name_ar)
      setImageUrl(detail.image_url)
      setIconUrl(detail.icon_url)
      setSubCategoryImageUrl(detail.sub_category_image_url)
      setDescriptionEn(detail.description_en ?? '')
      setDescriptionAr(detail.description_ar ?? '')
      setDisplayOrder(detail.display_order)
      setIsActive(detail.is_active)
    } catch {
      setNameEn(category.name_en)
      setNameAr(category.name_ar)
      setImageUrl(category.image_url)
      setIconUrl(category.icon_url)
      setSubCategoryImageUrl('')
      setDescriptionEn('')
      setDescriptionAr('')
      setDisplayOrder(category.display_order)
      setIsActive(category.is_active)
    } finally {
      setFormPrefilling(false)
    }
  }

  /* ---------- data ---------- */
  const { data: response, isLoading } = useCategoriesQuery({
    search: search || undefined,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  })

  const data = response?.data ?? []
  const meta = response?.meta
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
        onClick: (r) => setDeleteTarget(r),
        variant: 'destructive',
      })
    }

    return items
  }

  /* ---------- handlers ---------- */
  function handleSubmit() {
    if (editTarget) {
      updateMutation.mutate(
        {
          id: editTarget.id,
          payload: {
            name_en: nameEn,
            name_ar: nameAr,
            image_url: imageUrl,
            icon_url: iconUrl,
            sub_category_image_url: subCategoryImageUrl,
            description_en: descriptionEn.trim() ? descriptionEn : null,
            description_ar: descriptionAr.trim() ? descriptionAr : null,
            display_order: displayOrder,
            is_active: isActive,
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
          name_en: nameEn,
          name_ar: nameAr,
          image_url: imageUrl,
          icon_url: iconUrl,
          sub_category_image_url: subCategoryImageUrl,
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

  const toolbar = (
    <TableFiltersShell
      meta={
        meta != null
          ? t('categories:meta.total', { count: format.number(meta.total) })
          : undefined
      }
    >
      <SearchInput
        value={search}
        onChange={(v) => {
          setSearch(v)
          setPagination((p) => ({ ...p, pageIndex: 0 }))
        }}
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
        data={data}
        pageCount={meta?.totalPages}
        totalRecords={meta?.total}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
        toolbar={toolbar}
        actions={getRowActions}
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
          if (!open) {
            setFormOpen(false)
            setEditTarget(null)
            setFormPrefilling(false)
          }
        }}
        title={
          editTarget ? t('categories:form.edit_title') : t('categories:form.create_title')
        }
        isEdit={!!editTarget}
        isLoading={isSubmitting}
        submitDisabled={formPrefilling}
        onSubmit={handleSubmit}
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
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)}
                      placeholder={t('categories:form.name_en_placeholder')}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cat-name-ar">{t('categories:form.name_ar')}</Label>
                    <Input
                      id="cat-name-ar"
                      value={nameAr}
                      onChange={(e) => setNameAr(e.target.value)}
                      placeholder={t('categories:form.name_ar_placeholder')}
                      dir="rtl"
                    />
                  </div>
                </div>
              </FormSection>

              <FormSection title={t('categories:form.section_media')}>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="grid gap-2 rounded-lg border border-border bg-muted/20 p-4">
                    <Label className="text-foreground">{t('categories:form.image_url')}</Label>
                    <ImageUploadField
                      value={imageUrl}
                      onChange={setImageUrl}
                      uploadCase="category_image"
                    />
                  </div>
                  <div className="grid gap-2 rounded-lg border border-border bg-muted/20 p-4">
                    <Label className="text-foreground">{t('categories:form.icon_url')}</Label>
                    <ImageUploadField
                      value={iconUrl}
                      onChange={setIconUrl}
                      uploadCase="category_image"
                    />
                  </div>
                  <div className="grid gap-2 rounded-lg border border-border bg-muted/20 p-4 sm:col-span-2 lg:col-span-1">
                    <Label className="text-foreground">
                      {t('categories:form.sub_category_image_url')}
                    </Label>
                    <ImageUploadField
                      value={subCategoryImageUrl}
                      onChange={setSubCategoryImageUrl}
                      uploadCase="sub_category_image"
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
                      value={descriptionEn}
                      onChange={(e) => setDescriptionEn(e.target.value)}
                      placeholder={t('categories:form.description_en_placeholder')}
                      rows={3}
                      className="min-h-20 resize-y"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cat-desc-ar">{t('categories:form.description_ar')}</Label>
                    <Textarea
                      id="cat-desc-ar"
                      value={descriptionAr}
                      onChange={(e) => setDescriptionAr(e.target.value)}
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
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(Number(e.target.value))}
                      min={0}
                      className="max-w-48 font-mono tabular-nums"
                    />
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
                      <Switch
                        id="cat-active"
                        checked={isActive}
                        onCheckedChange={setIsActive}
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

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('categories:delete_dialog.title')}
        description={t('categories:delete_dialog.description')}
        onConfirm={() => {
          if (!deleteTarget) return
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
