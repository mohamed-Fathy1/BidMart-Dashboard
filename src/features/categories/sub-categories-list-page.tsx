import { useState, type ReactNode } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import type { SubCategory } from '@/types/api'
import { PageHeader } from '@/components/shared/page-header'
import { TableFiltersShell } from '@/components/shared/table-filters-shell'
import { DataTable, type RowActionItem } from '@/components/data-table/data-table'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { FormDialog } from '@/components/shared/form-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ImageUploadField } from '@/components/shared/image-upload-field'
import { ImagePreview } from '@/components/shared/image-preview'
import { Can } from '@/components/permissions/can'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { format } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useSubCategoryColumns } from '@/features/categories/sub-categories.columns'
import {
  useCategoryDetailQuery,
  useSubCategoriesQuery,
  useCreateSubCategoryMutation,
  useUpdateSubCategoryMutation,
  useDeleteSubCategoryMutation,
} from '@/features/categories/categories.queries'

function FormSection({
  title,
  children,
  className,
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  )
}

interface SubCategoriesListPageProps {
  categoryId: string
}

export function SubCategoriesListPage({ categoryId }: SubCategoriesListPageProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const canUpdate = usePermission(PERMISSIONS.subCategories.update)
  const canDelete = usePermission(PERMISSIONS.subCategories.delete)

  const { data: parentCategory, isLoading: isLoadingParent } = useCategoryDetailQuery(categoryId)
  const { data: subCategories = [], isLoading: isLoadingSubs } = useSubCategoriesQuery(categoryId)

  /* ---------- dialogs ---------- */
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<SubCategory | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SubCategory | null>(null)

  /* ---------- form state ---------- */
  const [nameEn, setNameEn] = useState('')
  const [nameAr, setNameAr] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [displayOrder, setDisplayOrder] = useState(0)
  const [isActive, setIsActive] = useState(true)

  function resetForm() {
    setNameEn('')
    setNameAr('')
    setImageUrl('')
    setDisplayOrder(0)
    setIsActive(true)
  }

  function openCreate() {
    resetForm()
    setEditTarget(null)
    setFormOpen(true)
  }

  function openEdit(sub: SubCategory) {
    setNameEn(sub.name_en)
    setNameAr(sub.name_ar)
    setImageUrl(sub.image_url ?? '')
    setDisplayOrder(sub.display_order)
    setIsActive(sub.is_active)
    setEditTarget(sub)
    setFormOpen(true)
  }

  /* ---------- mutations ---------- */
  const createMutation = useCreateSubCategoryMutation()
  const updateMutation = useUpdateSubCategoryMutation()
  const deleteMutation = useDeleteSubCategoryMutation()

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const columns = useSubCategoryColumns()

  /* ---------- row actions ---------- */
  function getRowActions(_row: SubCategory): RowActionItem<SubCategory>[] {
    const items: RowActionItem<SubCategory>[] = []

    if (canUpdate) {
      items.push({
        label: t('categories:sub.actions.edit'),
        icon: Pencil,
        onClick: (r) => openEdit(r),
      })
    }

    if (canDelete) {
      items.push({
        label: t('categories:sub.actions.delete'),
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
            image_url: imageUrl || null,
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
          category_id: categoryId,
          name_en: nameEn,
          name_ar: nameAr,
          image_url: imageUrl || null,
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

  const headerDescription: ReactNode =
    isLoadingParent ? (
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
          {t('categories:sub.page_description', { category: parentCategory.name_en })}
        </p>
      </div>
    ) : undefined

  const toolbar = (
    <TableFiltersShell
      meta={
        !isLoadingSubs
          ? t('categories:sub.meta.total', { count: format.number(subCategories.length) })
          : undefined
      }
    >
      <p className="max-w-xl text-sm text-muted-foreground">{t('categories:sub.list_hint')}</p>
    </TableFiltersShell>
  )

  /* ---------- render ---------- */
  return (
    <div className="space-y-6">
      <PageHeader
        title={t('categories:sub.page_title')}
        description={headerDescription}
        onBack={() => navigate({ to: '/categories' })}
        actions={
          <Can permission={PERMISSIONS.subCategories.create}>
            <Button size="sm" onClick={openCreate}>
              <Plus className="size-4" />
              {t('categories:sub.actions.create')}
            </Button>
          </Can>
        }
      />

      <DataTable
        columns={columns}
        data={subCategories}
        isLoading={isLoadingSubs}
        toolbar={toolbar}
        actions={canUpdate || canDelete ? getRowActions : undefined}
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
        title={editTarget ? t('categories:sub.form.edit_title') : t('categories:sub.form.create_title')}
        isEdit={!!editTarget}
        isLoading={isSubmitting}
        onSubmit={handleSubmit}
        contentClassName="sm:max-w-xl"
        suppressInitialFocus
      >
        <div className="max-h-[min(65vh,480px)] overflow-y-auto pe-1">
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

          <Separator className="my-5" />

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

          <Separator className="my-5" />

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
              </div>
              {editTarget ? (
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
        </div>
      </FormDialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('categories:sub.delete_dialog.title')}
        description={t('categories:sub.delete_dialog.description')}
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
