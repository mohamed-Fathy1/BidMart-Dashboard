import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import type { ComplaintTypeRef } from '@/types/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FormDialog } from '@/components/shared/form-dialog'
import { FormSection } from '@/components/shared/form-section'
import { TargetedConfirmDialog } from '@/components/shared/targeted-confirm-dialog'
import { LoadingTable } from '@/components/shared/loading-table'
import { Can } from '@/components/permissions/can'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { useConfirmTarget } from '@/lib/use-confirm-target'
import { localizedName } from '@/lib/localized-name'
import { cn } from '@/lib/utils'
import {
  useComplaintTypeRefsQuery,
  useCreateComplaintTypeMutation,
  useDeleteComplaintTypeMutation,
  useUpdateComplaintTypeMutation,
} from '@/features/complaints/complaints.queries'

const formSchema = z.object({
  nameEn: z.string().trim().min(1, { message: 'complaints:types.errors.name_en_required' }),
  nameAr: z.string().trim().min(1, { message: 'complaints:types.errors.name_ar_required' }),
})

type FormValues = z.infer<typeof formSchema>

export function ComplaintTypesListPage() {
  const { t, i18n } = useTranslation()
  const canCreate = usePermission(PERMISSIONS.complaints.createType)
  const canUpdate = usePermission(PERMISSIONS.complaints.updateType)
  const canDelete = usePermission(PERMISSIONS.complaints.deleteType)

  const { data: types, isLoading } = useComplaintTypeRefsQuery()
  const createMutation = useCreateComplaintTypeMutation()
  const updateMutation = useUpdateComplaintTypeMutation()
  const deleteMutation = useDeleteComplaintTypeMutation()

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ComplaintTypeRef | null>(null)
  const deleteFlow = useConfirmTarget<ComplaintTypeRef>()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
    defaultValues: { nameEn: '', nameAr: '' },
  })

  function openCreate() {
    reset({ nameEn: '', nameAr: '' })
    setEditTarget(null)
    setFormOpen(true)
  }

  function openEdit(type: ComplaintTypeRef) {
    reset({ nameEn: type.name_en, nameAr: type.name_ar })
    setEditTarget(type)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditTarget(null)
  }

  const onSubmit = (values: FormValues) => {
    if (editTarget) {
      updateMutation.mutate(
        { id: editTarget.id, payload: { name_en: values.nameEn, name_ar: values.nameAr } },
        { onSuccess: closeForm },
      )
    } else {
      createMutation.mutate(
        { name_en: values.nameEn, name_ar: values.nameAr },
        { onSuccess: closeForm },
      )
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const firstErrorKey = (['nameEn', 'nameAr'] as const).find((k) => errors[k]?.message)
  const firstErrorMessage =
    firstErrorKey && typeof errors[firstErrorKey]?.message === 'string'
      ? t(errors[firstErrorKey]!.message as string)
      : undefined

  const hasRows = !!types && types.length > 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h2 className="text-lg font-semibold text-foreground">
            {t('complaints:types.title')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('complaints:types.description')}
          </p>
        </div>
        <Can permission={PERMISSIONS.complaints.createType}>
          <Button size="sm" onClick={openCreate} className="shrink-0">
            <Plus className="size-4" />
            {t('complaints:types.actions.create')}
          </Button>
        </Can>
      </div>

      {isLoading ? (
        <LoadingTable rows={4} cols={3} />
      ) : !hasRows ? (
        <Card className="gap-0 border-dashed bg-muted/20 py-0 shadow-none">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Plus className="size-[18px]" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {t('complaints:types.empty.title')}
              </p>
              <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
                {t('complaints:types.empty.hint')}
              </p>
            </div>
            {canCreate && (
              <Button size="sm" variant="outline" onClick={openCreate} className="mt-2">
                <Plus className="size-4" />
                {t('complaints:types.actions.create')}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="gap-0 overflow-hidden py-0">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead className="ps-4 text-[11px] font-medium tracking-wider text-muted-foreground uppercase hover:bg-transparent">
                  {t('complaints:types.columns.name_en')}
                </TableHead>
                <TableHead className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase hover:bg-transparent">
                  {t('complaints:types.columns.name_ar')}
                </TableHead>
                <TableHead className="w-24 pe-4 text-end text-[11px] font-medium tracking-wider text-muted-foreground uppercase hover:bg-transparent">
                  {t('complaints:types.columns.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {types!.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="ps-4 font-medium">{type.name_en}</TableCell>
                  <TableCell dir="rtl">{type.name_ar}</TableCell>
                  <TableCell className="pe-4 text-end">
                    <div className="inline-flex items-center gap-0.5">
                      {canUpdate && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEdit(type)}
                          aria-label={t('complaints:types.actions.edit')}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="size-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => deleteFlow.ask(type)}
                          aria-label={t('complaints:types.actions.delete')}
                          className={cn(
                            'text-muted-foreground',
                            'hover:bg-destructive/10 hover:text-destructive',
                          )}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <FormDialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) closeForm()
        }}
        title={
          editTarget
            ? t('complaints:types.form.edit_title')
            : t('complaints:types.form.create_title')
        }
        description={t('complaints:types.form.dialog_description')}
        isEdit={!!editTarget}
        isLoading={isSubmitting}
        onSubmit={handleSubmit(onSubmit)}
        errorMessage={firstErrorMessage}
        size="md"
        suppressInitialFocus
      >
        <FormSection title={t('complaints:types.form.section_names')}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="complaint-type-name-en">
                {t('complaints:types.form.name_en')}
              </Label>
              <Input
                id="complaint-type-name-en"
                {...register('nameEn')}
                placeholder={t('complaints:types.form.name_en_placeholder')}
                aria-invalid={errors.nameEn ? true : undefined}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="complaint-type-name-ar">
                {t('complaints:types.form.name_ar')}
              </Label>
              <Input
                id="complaint-type-name-ar"
                {...register('nameAr')}
                placeholder={t('complaints:types.form.name_ar_placeholder')}
                dir="rtl"
                aria-invalid={errors.nameAr ? true : undefined}
              />
            </div>
          </div>
        </FormSection>
      </FormDialog>

      <TargetedConfirmDialog
        flow={deleteFlow}
        i18nPrefix="complaints:types.delete_dialog"
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
