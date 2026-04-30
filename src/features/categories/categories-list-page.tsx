import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2, List } from 'lucide-react'
import type { Category } from '@/types/api'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, type RowActionItem } from '@/components/data-table/data-table'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { FormDialog } from '@/components/shared/form-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ImageUploadField } from '@/components/shared/image-upload-field'
import { Can } from '@/components/permissions/can'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { useCategoryColumns } from '@/features/categories/categories.columns'
import {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from '@/features/categories/categories.queries'

export function CategoriesListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const canCreate = usePermission(PERMISSIONS.categories.create)
  const canUpdate = usePermission(PERMISSIONS.categories.update)
  const canDelete = usePermission(PERMISSIONS.categories.delete)

  /* ---------- dialogs ---------- */
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)

  /* ---------- form state ---------- */
  const [nameEn, setNameEn] = useState('')
  const [nameAr, setNameAr] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [iconUrl, setIconUrl] = useState('')
  const [subCategoryImageUrl, setSubCategoryImageUrl] = useState('')
  const [displayOrder, setDisplayOrder] = useState(0)
  const [isActive, setIsActive] = useState(true)

  function resetForm() {
    setNameEn('')
    setNameAr('')
    setImageUrl('')
    setIconUrl('')
    setSubCategoryImageUrl('')
    setDisplayOrder(0)
    setIsActive(true)
  }

  function openCreate() {
    resetForm()
    setEditTarget(null)
    setFormOpen(true)
  }

  function openEdit(category: Category) {
    setNameEn(category.name_en)
    setNameAr(category.name_ar)
    setImageUrl(category.image_url)
    setIconUrl(category.icon_url)
    setSubCategoryImageUrl(category.sub_category_image_url)
    setDisplayOrder(category.display_order)
    setIsActive(category.is_active)
    setEditTarget(category)
    setFormOpen(true)
  }

  /* ---------- data (non-paginated) ---------- */
  const { data: categories = [], isLoading } = useCategoriesQuery()
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
        onClick: (r) => navigate({ to: '/categories/$categoryId/sub-categories', params: { categoryId: r.id } }),
      },
    ]

    if (canUpdate) {
      items.push({
        label: t('categories:actions.edit'),
        icon: Pencil,
        onClick: (r) => openEdit(r),
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
        data={categories}
        isLoading={isLoading}
        actions={canUpdate || canDelete ? getRowActions : undefined}
        getRowId={(row) => row.id}
        onRowClick={(row) => navigate({ to: '/categories/$categoryId/sub-categories', params: { categoryId: row.id } })}
      />

      {/* Create / Edit dialog */}
      <FormDialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) {
            setFormOpen(false)
            setEditTarget(null)
          }
        }}
        title={editTarget ? t('categories:form.edit_title') : t('categories:form.create_title')}
        isEdit={!!editTarget}
        isLoading={isSubmitting}
        onSubmit={handleSubmit}
        contentClassName="sm:max-w-lg"
      >
        <div className="grid gap-4">
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
          <div className="grid gap-2">
            <Label>{t('categories:form.image_url')}</Label>
            <ImageUploadField
              value={imageUrl}
              onChange={setImageUrl}
              uploadCase="category_image"
            />
          </div>
          <div className="grid gap-2">
            <Label>{t('categories:form.icon_url')}</Label>
            <ImageUploadField
              value={iconUrl}
              onChange={setIconUrl}
              uploadCase="category_image"
            />
          </div>
          <div className="grid gap-2">
            <Label>{t('categories:form.sub_category_image_url')}</Label>
            <ImageUploadField
              value={subCategoryImageUrl}
              onChange={setSubCategoryImageUrl}
              uploadCase="sub_category_image"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cat-order">{t('categories:form.display_order')}</Label>
            <Input
              id="cat-order"
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
              min={0}
              className="font-mono tabular-nums"
            />
          </div>
          {editTarget && (
            <div className="flex items-center gap-3">
              <Switch
                id="cat-active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="cat-active">{t('categories:form.is_active')}</Label>
            </div>
          )}
        </div>
      </FormDialog>

      {/* Delete dialog */}
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
