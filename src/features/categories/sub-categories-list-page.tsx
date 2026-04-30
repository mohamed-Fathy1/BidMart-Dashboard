import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import type { SubCategory } from '@/types/api'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, type RowActionItem } from '@/components/data-table/data-table'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { FormDialog } from '@/components/shared/form-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { ImageUploadField } from '@/components/shared/image-upload-field'
import { Can } from '@/components/permissions/can'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { useSubCategoryColumns } from '@/features/categories/sub-categories.columns'
import {
  useCategoryDetailQuery,
  useSubCategoriesQuery,
  useCreateSubCategoryMutation,
  useUpdateSubCategoryMutation,
  useDeleteSubCategoryMutation,
} from '@/features/categories/categories.queries'

interface SubCategoriesListPageProps {
  categoryId: string
}

export function SubCategoriesListPage({ categoryId }: SubCategoriesListPageProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const canCreate = usePermission(PERMISSIONS.subCategories.create)
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

  /* ---------- render ---------- */
  return (
    <div className="space-y-6">
      <PageHeader
        title={t('categories:sub.page_title')}
        description={
          isLoadingParent
            ? undefined
            : parentCategory
              ? t('categories:sub.page_description', { category: parentCategory.name_en })
              : undefined
        }
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

      {isLoadingParent ? (
        <Skeleton className="h-6 w-48" />
      ) : null}

      <DataTable
        columns={columns}
        data={subCategories}
        isLoading={isLoadingSubs}
        actions={canUpdate || canDelete ? getRowActions : undefined}
        getRowId={(row) => row.id}
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
        title={editTarget ? t('categories:sub.form.edit_title') : t('categories:sub.form.create_title')}
        isEdit={!!editTarget}
        isLoading={isSubmitting}
        onSubmit={handleSubmit}
        contentClassName="sm:max-w-lg"
      >
        <div className="grid gap-4">
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
          <div className="grid gap-2">
            <Label>{t('categories:sub.form.image_url')}</Label>
            <ImageUploadField
              value={imageUrl}
              onChange={setImageUrl}
              uploadCase="sub_category_image"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sub-order">{t('categories:sub.form.display_order')}</Label>
            <Input
              id="sub-order"
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
                id="sub-active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="sub-active">{t('categories:sub.form.is_active')}</Label>
            </div>
          )}
        </div>
      </FormDialog>

      {/* Delete dialog */}
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
