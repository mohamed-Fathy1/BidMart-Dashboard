import { useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Eye, Ban, PauseCircle, CheckCircle, Trash2 } from "lucide-react";
import type { PaginationState } from "@tanstack/react-table";
import type { AdminUserListItem } from "@/types/api";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { FilterSelect } from "@/components/shared/filter-select";
import { TableFiltersShell } from "@/components/shared/table-filters-shell";
import {
  DataTable,
  type RowActionItem,
} from "@/components/data-table/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ReasonDialog } from "@/components/shared/reason-dialog";
import { useUserColumns } from "@/features/users/users.columns";
import {
  useUsersQuery,
  useBanUserMutation,
  useSuspendUserMutation,
  useActivateUserMutation,
  useDeleteUserMutation,
} from "@/features/users/users.queries";
import type { ListUsersParams } from "@/features/users/users.api";
import { PERMISSIONS, usePermission } from "@/lib/permissions";
import { format } from "@/lib/format";

export function UsersListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  /* ---------- permissions ---------- */
  const canBan = usePermission(PERMISSIONS.users.ban);
  const canSuspend = usePermission(PERMISSIONS.users.suspend);
  const canActivate = usePermission(PERMISSIONS.users.activate);
  const canDelete = usePermission(PERMISSIONS.users.delete);

  /* ---------- filters ---------- */
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [accountTypeFilter, setAccountTypeFilter] = useState("");

  /* ---------- pagination ---------- */
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  /* ---------- dialogs ---------- */
  const [banTarget, setBanTarget] = useState<AdminUserListItem | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<AdminUserListItem | null>(
    null,
  );
  const [activateTarget, setActivateTarget] =
    useState<AdminUserListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUserListItem | null>(
    null,
  );

  /* ---------- data ---------- */
  const { data: response, isLoading } = useUsersQuery({
    search: search || undefined,
    status: (statusFilter as ListUsersParams["status"]) || undefined,
    accountType:
      (accountTypeFilter as ListUsersParams["accountType"]) || undefined,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  });

  const data = response?.data ?? [];
  const meta = response?.meta;

  const columns = useUserColumns();

  /* ---------- mutations ---------- */
  const banMutation = useBanUserMutation();
  const suspendMutation = useSuspendUserMutation();
  const activateMutation = useActivateUserMutation();
  const deleteMutation = useDeleteUserMutation();

  /* ---------- filter options ---------- */
  const statusOptions = useMemo(
    () => [
      { value: "active", label: t("components:status.active") },
      { value: "suspended", label: t("components:status.suspended") },
      { value: "banned", label: t("components:status.banned") },
    ],
    [t],
  );

  const accountTypeOptions = useMemo(
    () => [
      { value: "user_only", label: t("components:status.user_only") },
      {
        value: "upgraded_to_seller",
        label: t("components:status.upgraded_to_seller"),
      },
    ],
    [t],
  );

  /* ---------- row actions ---------- */
  function getRowActions(
    row: AdminUserListItem,
  ): RowActionItem<AdminUserListItem>[] {
    const items: RowActionItem<AdminUserListItem>[] = [
      {
        label: t("users:actions.view"),
        icon: Eye,
        onClick: (r) =>
          navigate({ to: "/users/$userId", params: { userId: r.id } }),
      },
    ];

    if (
      canActivate &&
      (row.status === "banned" || row.status === "suspended")
    ) {
      items.push({
        label: t("users:actions.activate"),
        icon: CheckCircle,
        onClick: (r) => setActivateTarget(r),
      });
    }

    if (canBan && row.status !== "banned") {
      items.push({
        label: t("users:actions.ban"),
        icon: Ban,
        onClick: (r) => setBanTarget(r),
        variant: "destructive",
      });
    }

    if (canSuspend && row.status !== "suspended" && row.status !== "banned") {
      items.push({
        label: t("users:actions.suspend"),
        icon: PauseCircle,
        onClick: (r) => setSuspendTarget(r),
        variant: "destructive",
      });
    }

    if (canDelete) {
      items.push(
        { type: "separator" },
        {
          label: t("users:actions.delete"),
          icon: Trash2,
          onClick: (r) => setDeleteTarget(r),
          variant: "destructive",
        },
      );
    }

    return items;
  }

  /* ---------- toolbar ---------- */
  const toolbar = (
    <TableFiltersShell
      meta={
        meta != null
          ? t("users:meta.total_accounts", {
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
        placeholder={t("users:filters.search_placeholder")}
        className="w-full min-w-[min(100%,220px)] sm:w-72"
      />
      <FilterSelect
        value={statusFilter}
        onChange={(v) => {
          setStatusFilter(v);
          setPagination((p) => ({ ...p, pageIndex: 0 }));
        }}
        options={statusOptions}
        placeholder={t("users:filters.status")}
        className="min-w-[148px]"
      />
      <FilterSelect
        value={accountTypeFilter}
        onChange={(v) => {
          setAccountTypeFilter(v);
          setPagination((p) => ({ ...p, pageIndex: 0 }));
        }}
        options={accountTypeOptions}
        placeholder={t("users:filters.account_type")}
        className="min-w-[180px]"
      />
    </TableFiltersShell>
  );

  /* ---------- render ---------- */
  return (
    <div className="space-y-6">
      <PageHeader
        title={t("users:page_title")}
        description={t("users:page_description")}
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
          navigate({ to: "/users/$userId", params: { userId: row.id } })
        }
      />

      {/* Ban dialog */}
      <ReasonDialog
        open={!!banTarget}
        onOpenChange={(open) => !open && setBanTarget(null)}
        title={t("users:ban_dialog.title")}
        description={t("users:ban_dialog.description")}
        onConfirm={(reason) => {
          if (!banTarget) return;
          banMutation.mutate(
            { userId: banTarget.id, reason },
            { onSettled: () => setBanTarget(null) },
          );
        }}
        isLoading={banMutation.isPending}
        variant="destructive"
      />

      {/* Suspend dialog */}
      <ReasonDialog
        open={!!suspendTarget}
        onOpenChange={(open) => !open && setSuspendTarget(null)}
        title={t("users:suspend_dialog.title")}
        description={t("users:suspend_dialog.description")}
        onConfirm={(reason) => {
          if (!suspendTarget) return;
          suspendMutation.mutate(
            { userId: suspendTarget.id, reason },
            { onSettled: () => setSuspendTarget(null) },
          );
        }}
        isLoading={suspendMutation.isPending}
        variant="destructive"
      />

      {/* Activate dialog */}
      <ConfirmDialog
        open={!!activateTarget}
        onOpenChange={(open) => !open && setActivateTarget(null)}
        title={t("users:activate_dialog.title")}
        description={t("users:activate_dialog.description")}
        onConfirm={() => {
          if (!activateTarget) return;
          activateMutation.mutate(activateTarget.id, {
            onSettled: () => setActivateTarget(null),
          });
        }}
        isLoading={activateMutation.isPending}
      />

      {/* Delete dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("users:delete_dialog.title")}
        description={t("users:delete_dialog.description")}
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
