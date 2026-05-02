import { useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Eye, CheckCircle, XCircle, ShieldCheck } from "lucide-react";
import type { PaginationState } from "@tanstack/react-table";
import type { ProviderSummary } from "@/types/api";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { FilterSelect } from "@/components/shared/filter-select";
import {
  DataTable,
  type RowActionItem,
} from "@/components/data-table/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ReasonDialog } from "@/components/shared/reason-dialog";
import { useProviderColumns } from "@/features/providers/providers.columns";
import {
  useProvidersQuery,
  useApproveProviderMutation,
  useRejectProviderMutation,
  useToggleVerificationMutation,
} from "@/features/providers/providers.queries";
import type { ListProvidersParams } from "@/features/providers/providers.api";
import { PERMISSIONS, usePermission } from "@/lib/permissions";

export function ProvidersListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  /* ---------- permissions ---------- */
  const canApprove = usePermission(PERMISSIONS.providers.approve);
  const canReject = usePermission(PERMISSIONS.providers.reject);
  const canVerify = usePermission(PERMISSIONS.providers.verify);

  /* ---------- filters ---------- */
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  /* ---------- pagination ---------- */
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  /* ---------- dialogs ---------- */
  const [approveTarget, setApproveTarget] = useState<ProviderSummary | null>(
    null,
  );
  const [rejectTarget, setRejectTarget] = useState<ProviderSummary | null>(
    null,
  );
  const [verifyTarget, setVerifyTarget] = useState<ProviderSummary | null>(
    null,
  );

  /* ---------- data ---------- */
  const { data: response, isLoading } = useProvidersQuery({
    search: search || undefined,
    status: (statusFilter as ListProvidersParams["status"]) || undefined,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  });

  const data = response?.data ?? [];
  const meta = response?.meta;

  const columns = useProviderColumns();

  /* ---------- mutations ---------- */
  const approveMutation = useApproveProviderMutation();
  const rejectMutation = useRejectProviderMutation();
  const verifyMutation = useToggleVerificationMutation();

  /* ---------- filter options ---------- */
  const statusOptions = useMemo(
    () => [
      { value: "PENDING", label: t("components:status.PENDING") },
      { value: "APPROVED", label: t("components:status.APPROVED") },
      { value: "REJECTED", label: t("components:status.REJECTED") },
      { value: "SUSPENDED", label: t("components:status.SUSPENDED") },
    ],
    [t],
  );

  /* ---------- row actions ---------- */
  function getRowActions(
    row: ProviderSummary,
  ): RowActionItem<ProviderSummary>[] {
    const items: RowActionItem<ProviderSummary>[] = [
      {
        label: t("providers:actions.view"),
        icon: Eye,
        onClick: (r) =>
          navigate({ to: "/providers/$storeId", params: { storeId: r.id } }),
      },
    ];

    if (canApprove && row.status === "PENDING") {
      items.push({
        label: t("providers:actions.approve"),
        icon: CheckCircle,
        onClick: (r) => setApproveTarget(r),
      });
    }

    if (canReject && row.status === "PENDING") {
      items.push({
        label: t("providers:actions.reject"),
        icon: XCircle,
        onClick: (r) => setRejectTarget(r),
        variant: "destructive",
      });
    }

    if (canVerify && row.status === "APPROVED") {
      items.push({
        label: row.isVerified
          ? t("providers:actions.unverify")
          : t("providers:actions.verify"),
        icon: ShieldCheck,
        onClick: (r) => setVerifyTarget(r),
      });
    }

    return items;
  }

  /* ---------- toolbar ---------- */
  const toolbar = (
    <div className="flex flex-wrap items-center gap-3">
      <SearchInput
        value={search}
        onChange={(v) => {
          setSearch(v);
          setPagination((p) => ({ ...p, pageIndex: 0 }));
        }}
        placeholder={t("providers:filters.search_placeholder")}
        className="w-64"
      />
      <FilterSelect
        value={statusFilter}
        onChange={(v) => {
          setStatusFilter(v);
          setPagination((p) => ({ ...p, pageIndex: 0 }));
        }}
        options={statusOptions}
        placeholder={t("providers:filters.status")}
      />
    </div>
  );

  /* ---------- render ---------- */
  return (
    <div className="space-y-6">
      <PageHeader
        title={t("providers:page_title")}
        description={t("providers:page_description")}
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
          navigate({ to: "/providers/$storeId", params: { storeId: row.id } })
        }
      />

      {/* Approve dialog */}
      <ConfirmDialog
        open={!!approveTarget}
        onOpenChange={(open) => !open && setApproveTarget(null)}
        title={t("providers:approve_dialog.title")}
        description={t("providers:approve_dialog.description")}
        onConfirm={() => {
          if (!approveTarget) return;
          approveMutation.mutate(approveTarget.id, {
            onSettled: () => setApproveTarget(null),
          });
        }}
        isLoading={approveMutation.isPending}
      />

      {/* Reject dialog */}
      <ReasonDialog
        open={!!rejectTarget}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        title={t("providers:reject_dialog.title")}
        description={t("providers:reject_dialog.description")}
        onConfirm={(reason) => {
          if (!rejectTarget) return;
          rejectMutation.mutate(
            { storeId: rejectTarget.id, reason },
            { onSettled: () => setRejectTarget(null) },
          );
        }}
        isLoading={rejectMutation.isPending}
        variant="destructive"
      />

      {/* Verify toggle dialog */}
      <ConfirmDialog
        open={!!verifyTarget}
        onOpenChange={(open) => !open && setVerifyTarget(null)}
        title={
          verifyTarget?.isVerified
            ? t("providers:verify_dialog.unverify_title")
            : t("providers:verify_dialog.verify_title")
        }
        description={
          verifyTarget?.isVerified
            ? t("providers:verify_dialog.unverify_description")
            : t("providers:verify_dialog.verify_description")
        }
        onConfirm={() => {
          if (!verifyTarget) return;
          verifyMutation.mutate(verifyTarget.id, {
            onSettled: () => setVerifyTarget(null),
          });
        }}
        isLoading={verifyMutation.isPending}
      />
    </div>
  );
}
