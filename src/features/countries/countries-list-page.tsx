import { useState, useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ToggleLeft } from "lucide-react";
import type { PaginationState } from "@tanstack/react-table";
import type { Country } from "@/types/api";
import { PageHeader } from "@/components/shared/page-header";
import { FilterSelect } from "@/components/shared/filter-select";
import { TableFiltersShell } from "@/components/shared/table-filters-shell";
import { SearchInput } from "@/components/shared/search-input";
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
import { Separator } from "@/components/ui/separator";
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
import { cn } from "@/lib/utils";

function FormSection({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {title}
      </h3>
      {children}
    </div>
  );
}

export function CountriesListPage() {
  const { t } = useTranslation();

  const canUpdate = usePermission(PERMISSIONS.countries.update);
  const canDelete = usePermission(PERMISSIONS.countries.delete);

  /* ---------- filters ---------- */
  const [search, setSearch] = useState("");
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
    search: search.trim() || undefined,
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
  const toggleMutation = useToggleCountryMutation();
  const deleteMutation = useDeleteCountryMutation();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const canSave = useMemo(() => {
    const nameEnOk = nameEn.trim().length > 0;
    const nameArOk = nameAr.trim().length > 0;
    const imageOk = imageUrl.trim().length > 0;
    const orderOk = Number.isFinite(sortOrder) && sortOrder >= 0;
    const iso = isoCode.trim().toUpperCase();
    const isoOk =
      !!editTarget || (iso.length === 3 && /^[A-Z]{3}$/.test(iso));
    return nameEnOk && nameArOk && imageOk && orderOk && isoOk;
  }, [nameEn, nameAr, isoCode, imageUrl, sortOrder, editTarget]);

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
        onClick: (r) => setDeleteTarget(r),
        variant: "destructive",
      });
    }

    return items;
  }

  /* ---------- handlers ---------- */
  function handleSubmit() {
    const name_en = nameEn.trim();
    const name_ar = nameAr.trim();
    const iso_code = isoCode.trim().toUpperCase();
    const image_url = imageUrl.trim();

    if (!name_en) {
      toast.error(t("countries:errors.name_en_required"));
      return;
    }
    if (!name_ar) {
      toast.error(t("countries:errors.name_ar_required"));
      return;
    }
    if (!editTarget && (iso_code.length !== 3 || !/^[A-Z]{3}$/.test(iso_code))) {
      toast.error(t("countries:errors.iso_invalid"));
      return;
    }
    if (!image_url) {
      toast.error(t("countries:errors.image_required"));
      return;
    }
    if (!Number.isFinite(sortOrder) || sortOrder < 0) {
      toast.error(t("countries:errors.sort_order_invalid"));
      return;
    }

    if (editTarget) {
      updateMutation.mutate(
        {
          id: editTarget.id,
          payload: {
            name_en,
            name_ar,
            image_url,
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
          name_en,
          name_ar,
          iso_code,
          image_url,
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
        value={search}
        onChange={(v) => {
          setSearch(v);
          setPagination((p) => ({ ...p, pageIndex: 0 }));
        }}
        placeholder={t("countries:filters.search_placeholder")}
        className="w-full min-w-[min(100%,220px)] sm:max-w-xs md:w-80"
      />
      <FilterSelect
        value={enabledFilter}
        onChange={(v) => {
          setEnabledFilter(v);
          setPagination((p) => ({ ...p, pageIndex: 0 }));
        }}
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
        data={data}
        pageCount={meta?.totalPages}
        totalRecords={meta?.total}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
        toolbar={toolbar}
        actions={canUpdate || canDelete ? getRowActions : undefined}
        getRowId={(row) => row.id}
        onRowClick={canUpdate ? (row) => openEdit(row) : undefined}
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
        description={t("countries:form.dialog_description")}
        isEdit={!!editTarget}
        isLoading={isSubmitting}
        submitDisabled={!canSave}
        onSubmit={handleSubmit}
        contentClassName="sm:max-w-2xl"
        suppressInitialFocus
      >
        <div className="max-h-[min(72vh,600px)] space-y-0 overflow-y-auto pe-1">
          <FormSection title={t("countries:form.section_names")}>
            <div className="grid gap-4 md:grid-cols-2">
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
            </div>
          </FormSection>

          <Separator className="my-6" />

          <FormSection title={t("countries:form.section_codes")}>
            <div className="grid gap-4 sm:grid-cols-2 items-start">
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
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  min={0}
                  className="font-mono tabular-nums"
                />
              </div>
            </div>
          </FormSection>

          <Separator className="my-6" />

          <FormSection title={t("countries:form.section_flag")}>
            <div className="grid gap-2">
              <Label>{t("countries:form.image_url")}</Label>
              <ImageUploadField
                value={imageUrl}
                onChange={setImageUrl}
                uploadCase="country_image"
              />
            </div>
          </FormSection>

          <Separator className="my-6" />

          <FormSection title={t("countries:form.section_visibility")}>
            <div className="rounded-lg border border-border bg-card p-4 shadow-rest">
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
                  <Switch
                    id="country-enabled"
                    checked={isEnabled}
                    onCheckedChange={setIsEnabled}
                  />
                </div>
              </div>
            </div>
          </FormSection>
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
