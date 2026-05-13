import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getRouteApi } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2, ToggleLeft } from "lucide-react";
import type { Country } from "@/types/api";
import { useUrlListState } from "@/lib/use-url-list-state";
import { useListPageData } from "@/lib/use-list-page-data";
import { useConfirmTarget } from "@/lib/use-confirm-target";
import type { CountriesSearch } from "@/routes/_authed.countries";

const countriesRoute = getRouteApi("/_authed/countries");

const ISO_RE = /^[A-Z]{3}$/;

const countryFormSchema = z
  .object({
    nameEn: z.string().trim().min(1, { message: "countries:errors.name_en_required" }),
    nameAr: z.string().trim().min(1, { message: "countries:errors.name_ar_required" }),
    isoCode: z.string().trim().toUpperCase(),
    imageUrl: z.string().trim().min(1, { message: "countries:errors.image_required" }),
    isEnabled: z.boolean(),
    sortOrder: z.number().min(0, { message: "countries:errors.sort_order_invalid" }),
    isEdit: z.boolean(),
  })
  .superRefine((val, ctx) => {
    // ISO is required + format-validated only when creating; on edit it's disabled.
    if (!val.isEdit && !ISO_RE.test(val.isoCode)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["isoCode"],
        message: "countries:errors.iso_invalid",
      });
    }
  });

type CountryFormValues = z.infer<typeof countryFormSchema>;
import { PageHeader } from "@/components/shared/page-header";
import { FilterSelect } from "@/components/shared/filter-select";
import { TableFiltersShell } from "@/components/shared/table-filters-shell";
import { SearchInput } from "@/components/shared/search-input";
import {
  DataTable,
  type RowActionItem,
} from "@/components/data-table/data-table";
import { TargetedConfirmDialog } from "@/components/shared/targeted-confirm-dialog";
import { FormDialog } from "@/components/shared/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImageUploadField } from "@/components/shared/image-upload-field";
import { FormSection } from "@/components/shared/form-section";
import { Can } from "@/components/permissions/can";
import { PERMISSIONS, usePermission } from "@/lib/permissions";
import { useCountryColumns } from "@/features/countries/countries.columns";
import {
  useCountriesQuery,
  useCreateCountryMutation,
  useUpdateCountryMutation,
  useToggleCountryMutation,
  useDeleteCountryMutation,
} from "@/features/countries/countries.queries";
import { format } from "@/lib/format";
import { localizedName } from "@/lib/localized-name";

export function CountriesListPage() {
  const { t, i18n } = useTranslation();
  const { search, searchValue, pagination, setPagination, setSearch, setFilter } =
    useUrlListState<CountriesSearch>({ route: countriesRoute });
  const enabledFilter =
    search.isEnabled === true ? "true" : search.isEnabled === false ? "false" : "";

  const canUpdate = usePermission(PERMISSIONS.countries.update);
  const canDelete = usePermission(PERMISSIONS.countries.delete);

  /* ---------- dialogs ---------- */
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Country | null>(null);
  const deleteFlow = useConfirmTarget<Country>();

  /* ---------- form ---------- */
  const form = useForm<CountryFormValues>({
    resolver: zodResolver(countryFormSchema),
    mode: "onBlur",
    defaultValues: {
      nameEn: "",
      nameAr: "",
      isoCode: "",
      imageUrl: "",
      isEnabled: true,
      sortOrder: 0,
      isEdit: false,
    },
  });
  const {
    register,
    control,
    handleSubmit: rhfHandleSubmit,
    reset,
    formState: { errors },
  } = form;

  function openCreate() {
    reset({
      nameEn: "",
      nameAr: "",
      isoCode: "",
      imageUrl: "",
      isEnabled: true,
      sortOrder: 0,
      isEdit: false,
    });
    setEditTarget(null);
    setFormOpen(true);
  }

  function openEdit(country: Country) {
    reset({
      nameEn: country.name_en,
      nameAr: country.name_ar,
      isoCode: country.iso_code,
      imageUrl: country.image_url,
      isEnabled: country.is_enabled,
      sortOrder: country.sort_order,
      isEdit: true,
    });
    setEditTarget(country);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditTarget(null);
  }

  /* ---------- data ---------- */
  const { data: response, isLoading } = useCountriesQuery({
    search: searchValue.trim() || undefined,
    isEnabled: search.isEnabled,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  });

  const hasActiveFilters = searchValue.trim() !== "" || enabledFilter !== "";
  const { rows, meta, tableProps } = useListPageData({
    response,
    isLoading,
    pagination,
    setPagination,
    hasActiveFilters,
    clearFilters: () => {
      setSearch("");
      setFilter("isEnabled", undefined);
    },
  });

  const columns = useCountryColumns();

  /* ---------- mutations ---------- */
  const createMutation = useCreateCountryMutation();
  const updateMutation = useUpdateCountryMutation();
  const toggleMutation = useToggleCountryMutation();
  const deleteMutation = useDeleteCountryMutation();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const firstErrorKey = (
    ["nameEn", "nameAr", "isoCode", "imageUrl", "sortOrder"] as const
  ).find((k) => errors[k]?.message);
  const firstErrorMessage =
    firstErrorKey && typeof errors[firstErrorKey]?.message === "string"
      ? t(errors[firstErrorKey]!.message as string)
      : undefined;

  /* ---------- filter options ---------- */
  const enabledOptions = useMemo(
    () => [
      { value: "true", label: t("countries:enabled_options.enabled") },
      { value: "false", label: t("countries:enabled_options.disabled") },
    ],
    [t],
  );

  /* ---------- row actions ---------- */
  function getRowActions(row: Country): RowActionItem<Country>[] {
    const items: RowActionItem<Country>[] = [];

    if (canUpdate) {
      items.push({
        label: t("countries:actions.edit"),
        icon: Pencil,
        onClick: (r) => openEdit(r),
      });
      items.push({
        label: row.is_enabled
          ? t("countries:actions.disable")
          : t("countries:actions.enable"),
        icon: ToggleLeft,
        onClick: (r) => toggleMutation.mutate(r.id),
        disabled: toggleMutation.isPending,
      });
    }

    if (canDelete) {
      if (canUpdate) {
        items.push({ type: "separator" });
      }
      items.push({
        label: t("countries:actions.delete"),
        icon: Trash2,
        onClick: (r) => deleteFlow.ask(r),
        variant: "destructive",
      });
    }

    return items;
  }

  const onSubmit = (values: CountryFormValues) => {
    if (editTarget) {
      updateMutation.mutate(
        {
          id: editTarget.id,
          payload: {
            name_en: values.nameEn,
            name_ar: values.nameAr,
            image_url: values.imageUrl,
            is_enabled: values.isEnabled,
            sort_order: values.sortOrder,
          },
        },
        { onSuccess: closeForm },
      );
    } else {
      createMutation.mutate(
        {
          name_en: values.nameEn,
          name_ar: values.nameAr,
          iso_code: values.isoCode,
          image_url: values.imageUrl,
          is_enabled: values.isEnabled,
          sort_order: values.sortOrder,
        },
        { onSuccess: closeForm },
      );
    }
  };

  /* ---------- toolbar ---------- */
  const toolbar = (
    <TableFiltersShell
      meta={
        meta != null
          ? t("countries:meta.total_countries", {
            count: format.number(meta.total),
          })
          : undefined
      }
    >
      <SearchInput
        value={searchValue}
        onChange={(v) => setSearch(v)}
        placeholder={t("countries:filters.search_placeholder")}
        className="w-full min-w-[min(100%,220px)] sm:max-w-xs md:w-80"
      />
      <FilterSelect
        value={enabledFilter}
        onChange={(v) =>
          setFilter("isEnabled", v === "true" ? true : v === "false" ? false : undefined)
        }
        options={enabledOptions}
        placeholder={t("countries:filters.enabled")}
        className="min-w-[160px]"
      />
    </TableFiltersShell>
  );

  /* ---------- render ---------- */
  return (
    <div className="space-y-6">
      <PageHeader
        title={t("countries:page_title")}
        description={t("countries:page_description")}
        actions={
          <Can permission={PERMISSIONS.countries.create}>
            <Button size="sm" onClick={openCreate}>
              <Plus className="size-4" />
              {t("countries:actions.create")}
            </Button>
          </Can>
        }
      />

      <DataTable
        columns={columns}
        data={rows}
        {...tableProps}
        emptyKeyPrefix="countries:empty"
        toolbar={toolbar}
        actions={canUpdate || canDelete ? getRowActions : undefined}
        rowLabel={(row) => localizedName(row, i18n)}
        getRowId={(row) => row.id}
        onRowClick={canUpdate ? (row) => openEdit(row) : undefined}
      />

      <FormDialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) closeForm();
        }}
        title={
          editTarget
            ? t("countries:form.edit_title")
            : t("countries:form.create_title")
        }
        description={t("countries:form.dialog_description")}
        isEdit={!!editTarget}
        isLoading={isSubmitting}
        onSubmit={rhfHandleSubmit(onSubmit)}
        errorMessage={firstErrorMessage}
        suppressInitialFocus
      >
        <div className="space-y-0">
          <FormSection title={t("countries:form.section_names")}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="country-name-en">
                  {t("countries:form.name_en")}
                </Label>
                <Input
                  id="country-name-en"
                  {...register("nameEn")}
                  placeholder={t("countries:form.name_en_placeholder")}
                  aria-invalid={errors.nameEn ? true : undefined}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="country-name-ar">
                  {t("countries:form.name_ar")}
                </Label>
                <Input
                  id="country-name-ar"
                  {...register("nameAr")}
                  placeholder={t("countries:form.name_ar_placeholder")}
                  dir="rtl"
                  aria-invalid={errors.nameAr ? true : undefined}
                />
              </div>
            </div>
          </FormSection>

          <FormSection title={t("countries:form.section_codes")}>
            <div className="grid gap-4 sm:grid-cols-2 items-start">
              <div className="grid gap-2">
                <Label htmlFor="country-iso">
                  {t("countries:form.iso_code")}
                </Label>
                <Controller
                  name="isoCode"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="country-iso"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      onBlur={field.onBlur}
                      placeholder={t("countries:form.iso_code_placeholder")}
                      maxLength={3}
                      className="font-mono uppercase"
                      disabled={!!editTarget}
                      aria-invalid={errors.isoCode ? true : undefined}
                    />
                  )}
                />
                {editTarget ? (
                  <p className="text-xs text-muted-foreground">
                    {t("countries:form.iso_locked_hint")}
                  </p>
                ) : null}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="country-sort">
                  {t("countries:form.sort_order")}
                </Label>
                <Input
                  id="country-sort"
                  type="number"
                  {...register("sortOrder", { valueAsNumber: true })}
                  min={0}
                  className="font-mono tabular-nums"
                  aria-invalid={errors.sortOrder ? true : undefined}
                />
                <p className="text-xs text-muted-foreground">
                  {t("countries:form.sort_order_hint")}
                </p>
              </div>
            </div>
          </FormSection>

          <FormSection title={t("countries:form.section_flag")}>
            <div className="grid gap-2">
              <Label>{t("countries:form.image_url")}</Label>
              <Controller
                name="imageUrl"
                control={control}
                render={({ field }) => (
                  <ImageUploadField
                    value={field.value}
                    onChange={field.onChange}
                    uploadCase="country_image"
                  />
                )}
              />
            </div>
          </FormSection>

          <FormSection title={t("countries:form.section_visibility")}>
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <Label htmlFor="country-enabled" className="text-foreground">
                    {t("countries:form.is_enabled")}
                  </Label>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {t("countries:form.enabled_hint")}
                  </p>
                </div>
                <div className="flex shrink-0 items-center sm:ps-4">
                  <Controller
                    name="isEnabled"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="country-enabled"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </FormSection>
        </div>
      </FormDialog>

      {/* Delete dialog */}
      <TargetedConfirmDialog
        flow={deleteFlow}
        i18nPrefix="countries:delete_dialog"
        getName={(r) => localizedName(r, i18n)}
        onConfirm={(target) =>
          deleteMutation.mutate(target.id, { onSettled: deleteFlow.close })
        }
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}
