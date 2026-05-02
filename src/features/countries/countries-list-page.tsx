import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { PaginationState } from "@tanstack/react-table";
import type { Country } from "@/types/api";
import { PageHeader } from "@/components/shared/page-header";
import { FilterSelect } from "@/components/shared/filter-select";
import {
  DataTable,
  type RowActionItem,
} from "@/components/data-table/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FormDialog } from "@/components/shared/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImageUploadField } from "@/components/shared/image-upload-field";
import { Can } from "@/components/permissions/can";
import { PERMISSIONS, usePermission } from "@/lib/permissions";
import { useCountryColumns } from "@/features/countries/countries.columns";
import {
  useCountriesQuery,
  useCreateCountryMutation,
  useUpdateCountryMutation,
  useDeleteCountryMutation,
} from "@/features/countries/countries.queries";

export function CountriesListPage() {
  const { t } = useTranslation();

  const canCreate = usePermission(PERMISSIONS.countries.create);
  const canUpdate = usePermission(PERMISSIONS.countries.update);
  const canDelete = usePermission(PERMISSIONS.countries.delete);

  /* ---------- filters ---------- */
  const [enabledFilter, setEnabledFilter] = useState("");

  /* ---------- pagination ---------- */
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  /* ---------- dialogs ---------- */
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Country | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Country | null>(null);

  /* ---------- form state ---------- */
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [isoCode, setIsoCode] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  function resetForm() {
    setNameEn("");
    setNameAr("");
    setIsoCode("");
    setImageUrl("");
    setIsEnabled(true);
    setSortOrder(0);
  }

  function openCreate() {
    resetForm();
    setEditTarget(null);
    setFormOpen(true);
  }

  function openEdit(country: Country) {
    setNameEn(country.name_en);
    setNameAr(country.name_ar);
    setIsoCode(country.iso_code);
    setImageUrl(country.image_url);
    setIsEnabled(country.is_enabled);
    setSortOrder(country.sort_order);
    setEditTarget(country);
    setFormOpen(true);
  }

  /* ---------- data ---------- */
  const { data: response, isLoading } = useCountriesQuery({
    isEnabled:
      enabledFilter === "true"
        ? true
        : enabledFilter === "false"
          ? false
          : undefined,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  });

  const data = response?.data ?? [];
  const meta = response?.meta;

  const columns = useCountryColumns();

  /* ---------- mutations ---------- */
  const createMutation = useCreateCountryMutation();
  const updateMutation = useUpdateCountryMutation();
  const deleteMutation = useDeleteCountryMutation();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  /* ---------- filter options ---------- */
  const enabledOptions = useMemo(
    () => [
      { value: "true", label: t("countries:enabled_options.enabled") },
      { value: "false", label: t("countries:enabled_options.disabled") },
    ],
    [t],
  );

  /* ---------- row actions ---------- */
  function getRowActions(_row: Country): RowActionItem<Country>[] {
    const items: RowActionItem<Country>[] = [];

    if (canUpdate) {
      items.push({
        label: t("countries:actions.edit"),
        icon: Pencil,
        onClick: (r) => openEdit(r),
      });
    }

    if (canDelete) {
      items.push({
        label: t("countries:actions.delete"),
        icon: Trash2,
        onClick: (r) => setDeleteTarget(r),
        variant: "destructive",
      });
    }

    return items;
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
            is_enabled: isEnabled,
            sort_order: sortOrder,
          },
        },
        {
          onSuccess: () => {
            setFormOpen(false);
            setEditTarget(null);
          },
        },
      );
    } else {
      createMutation.mutate(
        {
          name_en: nameEn,
          name_ar: nameAr,
          iso_code: isoCode,
          image_url: imageUrl,
          is_enabled: isEnabled,
          sort_order: sortOrder,
        },
        {
          onSuccess: () => {
            setFormOpen(false);
          },
        },
      );
    }
  }

  /* ---------- toolbar ---------- */
  const toolbar = (
    <div className="flex flex-wrap items-center gap-3">
      <FilterSelect
        value={enabledFilter}
        onChange={(v) => {
          setEnabledFilter(v);
          setPagination((p) => ({ ...p, pageIndex: 0 }));
        }}
        options={enabledOptions}
        placeholder={t("countries:filters.enabled")}
      />
    </div>
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
        data={data}
        pageCount={meta?.totalPages}
        totalRecords={meta?.total}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
        toolbar={toolbar}
        actions={canUpdate || canDelete ? getRowActions : undefined}
        getRowId={(row) => row.id}
      />

      {/* Create / Edit dialog */}
      <FormDialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) {
            setFormOpen(false);
            setEditTarget(null);
          }
        }}
        title={
          editTarget
            ? t("countries:form.edit_title")
            : t("countries:form.create_title")
        }
        isEdit={!!editTarget}
        isLoading={isSubmitting}
        onSubmit={handleSubmit}
        contentClassName="sm:max-w-lg"
      >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="country-name-en">
              {t("countries:form.name_en")}
            </Label>
            <Input
              id="country-name-en"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder={t("countries:form.name_en_placeholder")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="country-name-ar">
              {t("countries:form.name_ar")}
            </Label>
            <Input
              id="country-name-ar"
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              placeholder={t("countries:form.name_ar_placeholder")}
              dir="rtl"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="country-iso">
                {t("countries:form.iso_code")}
              </Label>
              <Input
                id="country-iso"
                value={isoCode}
                onChange={(e) => setIsoCode(e.target.value.toUpperCase())}
                placeholder={t("countries:form.iso_code_placeholder")}
                maxLength={3}
                className="font-mono uppercase"
                disabled={!!editTarget}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="country-sort">
                {t("countries:form.sort_order")}
              </Label>
              <Input
                id="country-sort"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                min={0}
                className="font-mono tabular-nums"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>{t("countries:form.image_url")}</Label>
            <ImageUploadField
              value={imageUrl}
              onChange={setImageUrl}
              uploadCase="country_image"
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="country-enabled"
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
            />
            <Label htmlFor="country-enabled">
              {t("countries:form.is_enabled")}
            </Label>
          </div>
        </div>
      </FormDialog>

      {/* Delete dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("countries:delete_dialog.title")}
        description={t("countries:delete_dialog.description")}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id, {
            onSettled: () => setDeleteTarget(null),
          });
        }}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}
