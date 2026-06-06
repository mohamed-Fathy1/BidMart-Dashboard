import { useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getRouteApi } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, ToggleLeft } from 'lucide-react'
import type { Bank } from '@/types/api'
import { useUrlListState } from '@/lib/use-url-list-state'
import { useListPageData } from '@/lib/use-list-page-data'
import type { BanksSearch } from '@/routes/_authed.banks'
import { PageHeader } from '@/components/shared/page-header'
import { FilterSelect } from '@/components/shared/filter-select'
import { TableFiltersShell } from '@/components/shared/table-filters-shell'
import { SearchInput } from '@/components/shared/search-input'
import {
  DataTable,
  type RowActionItem,
} from '@/components/data-table/data-table'
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
import { Can } from '@/components/permissions/can'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { useBankColumns } from '@/features/banks/banks.columns'
import {
  useBanksQuery,
  useCreateBankMutation,
  useUpdateBankMutation,
  useToggleBankMutation,
} from '@/features/banks/banks.queries'
import { useCountriesQuery } from '@/features/countries/countries.queries'
import { format } from '@/lib/format'

const banksRoute = getRouteApi('/_authed/banks')

const bankFormSchema = z.object({
  nameEn: z
    .string()
    .trim()
    .min(2, { message: 'banks:errors.name_min' })
    .max(100, { message: 'banks:errors.name_max' }),
  nameAr: z
    .string()
    .trim()
    .min(2, { message: 'banks:errors.name_min' })
    .max(100, { message: 'banks:errors.name_max' }),
  countryId: z.string().min(1, { message: 'banks:errors.country_required' }),
})

type BankFormValues = z.infer<typeof bankFormSchema>

export function BanksListPage() {
  const { t, i18n } = useTranslation()
  const isAr = i18n.language === 'ar'
  const { search, searchValue, pagination, setPagination, setSearch, setFilter } =
    useUrlListState<BanksSearch>({ route: banksRoute })

  const statusFilter =
    search.isActive === true ? 'true' : search.isActive === false ? 'false' : ''
  const countryFilter = search.countryId ?? ''

  const canUpdate = usePermission(PERMISSIONS.withdrawals.approve)

  /* ---------- dialogs ---------- */
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Bank | null>(null)

  /* ---------- form ---------- */
  const form = useForm<BankFormValues>({
    resolver: zodResolver(bankFormSchema),
    mode: 'onBlur',
    defaultValues: { nameEn: '', nameAr: '', countryId: '' },
  })
  const {
    register,
    control,
    handleSubmit: rhfHandleSubmit,
    reset,
    formState: { errors },
  } = form

  function openCreate() {
    reset({ nameEn: '', nameAr: '', countryId: '' })
    setEditTarget(null)
    setFormOpen(true)
  }

  function openEdit(bank: Bank) {
    reset({ nameEn: bank.nameEn, nameAr: bank.nameAr, countryId: bank.countryId })
    setEditTarget(bank)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditTarget(null)
  }

  /* ---------- data ---------- */
  const { data: response, isLoading } = useBanksQuery({
    search: searchValue.trim() || undefined,
    countryId: countryFilter || undefined,
    isActive: search.isActive,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  })

  const hasActiveFilters =
    searchValue.trim() !== '' || statusFilter !== '' || countryFilter !== ''

  const { rows, meta, tableProps } = useListPageData({
    response,
    isLoading,
    pagination,
    setPagination,
    hasActiveFilters,
    clearFilters: () => {
      setSearch('')
      setFilter('isActive', undefined)
      setFilter('countryId', undefined)
    },
  })

  const columns = useBankColumns()

  /* ---------- countries (for filter + form picker) ---------- */
  const { data: countriesResponse } = useCountriesQuery({ limit: 100 })
  const countryOptions = useMemo(
    () =>
      (countriesResponse?.data ?? []).map((c) => ({
        value: c.id,
        label: isAr ? c.name_ar : c.name_en,
      })),
    [countriesResponse?.data, isAr],
  )

  /* ---------- mutations ---------- */
  const createMutation = useCreateBankMutation()
  const updateMutation = useUpdateBankMutation()
  const toggleMutation = useToggleBankMutation()

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const firstErrorKey = (['nameEn', 'nameAr', 'countryId'] as const).find(
    (k) => errors[k]?.message,
  )
  const firstErrorMessage =
    firstErrorKey && typeof errors[firstErrorKey]?.message === 'string'
      ? t(errors[firstErrorKey]!.message as string)
      : undefined

  /* ---------- filter options ---------- */
  const statusOptions = useMemo(
    () => [
      { value: 'true', label: t('banks:status_options.active') },
      { value: 'false', label: t('banks:status_options.inactive') },
    ],
    [t],
  )

  /* ---------- row actions ---------- */
  function getRowActions(row: Bank): RowActionItem<Bank>[] {
    const items: RowActionItem<Bank>[] = []
    if (canUpdate) {
      items.push({
        label: t('banks:actions.edit'),
        icon: Pencil,
        onClick: (r) => openEdit(r),
      })
      items.push({
        label: row.isActive
          ? t('banks:actions.deactivate')
          : t('banks:actions.activate'),
        icon: ToggleLeft,
        onClick: (r) => toggleMutation.mutate(r.id),
        disabled: toggleMutation.isPending,
      })
    }
    return items
  }

  const onSubmit = (values: BankFormValues) => {
    if (editTarget) {
      updateMutation.mutate(
        {
          id: editTarget.id,
          payload: {
            nameEn: values.nameEn,
            nameAr: values.nameAr,
            countryId: values.countryId,
          },
        },
        { onSuccess: closeForm },
      )
    } else {
      createMutation.mutate(
        { nameEn: values.nameEn, nameAr: values.nameAr, countryId: values.countryId },
        { onSuccess: closeForm },
      )
    }
  }

  /* ---------- toolbar ---------- */
  const toolbar = (
    <TableFiltersShell
      meta={
        meta != null
          ? t('banks:meta.total_banks', { count: format.number(meta.total) })
          : undefined
      }
    >
      <SearchInput
        value={searchValue}
        onChange={(v) => setSearch(v)}
        placeholder={t('banks:filters.search_placeholder')}
        className="w-full min-w-[min(100%,220px)] sm:max-w-xs md:w-80"
      />
      <FilterSelect
        value={countryFilter}
        onChange={(v) => setFilter('countryId', v || undefined)}
        options={countryOptions}
        placeholder={t('banks:filters.country')}
        className="min-w-[180px]"
      />
      <FilterSelect
        value={statusFilter}
        onChange={(v) =>
          setFilter('isActive', v === 'true' ? true : v === 'false' ? false : undefined)
        }
        options={statusOptions}
        placeholder={t('banks:filters.status')}
        className="min-w-[160px]"
      />
    </TableFiltersShell>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('banks:page_title')}
        description={t('banks:page_description')}
        actions={
          <Can permission={PERMISSIONS.withdrawals.approve}>
            <Button size="sm" onClick={openCreate}>
              <Plus className="size-4" />
              {t('banks:actions.create')}
            </Button>
          </Can>
        }
      />

      <DataTable
        columns={columns}
        data={rows}
        {...tableProps}
        emptyKeyPrefix="banks:empty"
        toolbar={toolbar}
        actions={canUpdate ? getRowActions : undefined}
        rowLabel={(row) => (isAr ? row.nameAr : row.nameEn)}
        getRowId={(row) => row.id}
        onRowClick={canUpdate ? (row) => openEdit(row) : undefined}
      />

      <FormDialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) closeForm()
        }}
        title={
          editTarget ? t('banks:form.edit_title') : t('banks:form.create_title')
        }
        description={t('banks:form.dialog_description')}
        isEdit={!!editTarget}
        isLoading={isSubmitting}
        onSubmit={rhfHandleSubmit(onSubmit)}
        errorMessage={firstErrorMessage}
        suppressInitialFocus
      >
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="bank-name-en">{t('banks:form.name_en')}</Label>
              <Input
                id="bank-name-en"
                {...register('nameEn')}
                placeholder={t('banks:form.name_en_placeholder')}
                aria-invalid={errors.nameEn ? true : undefined}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bank-name-ar">{t('banks:form.name_ar')}</Label>
              <Input
                id="bank-name-ar"
                {...register('nameAr')}
                placeholder={t('banks:form.name_ar_placeholder')}
                dir="rtl"
                aria-invalid={errors.nameAr ? true : undefined}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bank-country">{t('banks:form.country')}</Label>
            <Controller
              name="countryId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="bank-country"
                    aria-invalid={errors.countryId ? true : undefined}
                    className="w-full"
                  >
                    <SelectValue placeholder={t('banks:form.country_placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {countryOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <p className="text-xs leading-relaxed text-muted-foreground">
              {t('banks:form.country_hint')}
            </p>
          </div>
        </div>
      </FormDialog>
    </div>
  )
}
