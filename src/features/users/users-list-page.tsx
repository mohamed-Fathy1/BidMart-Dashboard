import { useMemo } from "react";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Eye, Ban, PauseCircle, CheckCircle, Trash2 } from "lucide-react";
import type { AdminUserListItem, AccountType } from "@/types/api";
import { useUrlListState } from "@/lib/use-url-list-state";
import { useListPageData } from "@/lib/use-list-page-data";
import { useConfirmTarget } from "@/lib/use-confirm-target";
import type { UsersSearch, UsersListStatus } from "@/routes/_authed.users";

const usersRoute = getRouteApi("/_authed/users");
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { FilterSelect } from "@/components/shared/filter-select";
import { TableFiltersShell } from "@/components/shared/table-filters-shell";
import {
  DataTable,
  type RowActionItem,
} from "@/components/data-table/data-table";
import {
  TargetedConfirmDialog,
  TargetedReasonDialog,
} from "@/components/shared/targeted-confirm-dialog";
import { useUserColumns } from "@/features/users/users.columns";
import {
  useUsersQuery,
  useBanUserMutation,
  useSuspendUserMutation,
  useActivateUserMutation,
  useDeleteUserMutation,
} from "@/features/users/users.queries";
import { PERMISSIONS, usePermission } from "@/lib/permissions";
import { format } from "@/lib/format";

export function UsersListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { search, searchValue, pagination, setPagination, setSearch, setFilter } =
    useUrlListState<UsersSearch>({ route: usersRoute });
  const statusFilter = search.status ?? "";
  const accountTypeFilter = search.accountType ?? "";

  /* ---------- permissions ---------- */
  const canBan = usePermission(PERMISSIONS.users.ban);
  const canSuspend = usePermission(PERMISSIONS.users.suspend);
  const canActivate = usePermission(PERMISSIONS.users.activate);
  const canDelete = usePermission(PERMISSIONS.users.delete);

  /* ---------- dialogs ---------- */
  const banFlow = useConfirmTarget<AdminUserListItem>();
  const suspendFlow = useConfirmTarget<AdminUserListItem>();
  const activateFlow = useConfirmTarget<AdminUserListItem>();
  const deleteFlow = useConfirmTarget<AdminUserListItem>();

  /* ---------- data ---------- */
  const { data: response, isLoading } = useUsersQuery({
    search: searchValue || undefined,
    status: search.status,
    accountType: search.accountType,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  });

  const hasActiveFilters =
    searchValue !== "" || statusFilter !== "" || accountTypeFilter !== "";
  const { rows, meta, tableProps } = useListPageData({
    response,
    isLoading,
    pagination,
    setPagination,
    hasActiveFilters,
    clearFilters: () => {
      setSearch("");
      setFilter("status", undefined);
      setFilter("accountType", undefined);
    },
  });

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

  function targetName(target: AdminUserListItem | null): string {
    if (!target) return "";
    return target.accountName || target.email || target.phoneNumber || "";
  }

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
        onClick: (r) => activateFlow.ask(r),
      });
    }

    if (canBan && row.status !== "banned") {
      items.push({
        label: t("users:actions.ban"),
        icon: Ban,
        onClick: (r) => banFlow.ask(r),
        variant: "destructive",
      });
    }

    if (canSuspend && row.status !== "suspended" && row.status !== "banned") {
      items.push({
        label: t("users:actions.suspend"),
        icon: PauseCircle,
        onClick: (r) => suspendFlow.ask(r),
        variant: "destructive",
      });
    }

    if (canDelete) {
      items.push(
        { type: "separator" },
        {
          label: t("users:actions.delete"),
          icon: Trash2,
          onClick: (r) => deleteFlow.ask(r),
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
        value={searchValue}
        onChange={(v) => setSearch(v)}
        placeholder={t("users:filters.search_placeholder")}
        className="w-full min-w-[min(100%,220px)] sm:w-72"
      />
      <FilterSelect
        value={statusFilter}
        onChange={(v) => setFilter("status", (v as UsersListStatus | "") || undefined)}
        options={statusOptions}
        placeholder={t("users:filters.status")}
        className="min-w-[148px]"
      />
      <FilterSelect
        value={accountTypeFilter}
        onChange={(v) => setFilter("accountType", (v as AccountType | "") || undefined)}
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
        data={rows}
        {...tableProps}
        emptyKeyPrefix="users:empty"
        toolbar={toolbar}
        actions={getRowActions}
        rowLabel={(row) => row.accountName || row.email || row.phoneNumber || ""}
        getRowId={(row) => row.id}
        onRowClick={(row) =>
          navigate({ to: "/users/$userId", params: { userId: row.id } })
        }
      />

      <TargetedReasonDialog
        flow={banFlow}
        i18nPrefix="users:ban_dialog"
        getName={(r) => targetName(r)}
        onConfirm={(target, reason) =>
          banMutation.mutate(
            { userId: target.id, reason },
            { onSettled: banFlow.close },
          )
        }
        isLoading={banMutation.isPending}
      />

      <TargetedReasonDialog
        flow={suspendFlow}
        i18nPrefix="users:suspend_dialog"
        getName={(r) => targetName(r)}
        onConfirm={(target, reason) =>
          suspendMutation.mutate(
            { userId: target.id, reason },
            { onSettled: suspendFlow.close },
          )
        }
        isLoading={suspendMutation.isPending}
      />

      <TargetedConfirmDialog
        flow={activateFlow}
        i18nPrefix="users:activate_dialog"
        getName={(r) => targetName(r)}
        onConfirm={(target) =>
          activateMutation.mutate(target.id, { onSettled: activateFlow.close })
        }
        isLoading={activateMutation.isPending}
      />

      <TargetedConfirmDialog
        flow={deleteFlow}
        i18nPrefix="users:delete_dialog"
        getName={(r) => targetName(r)}
        onConfirm={(target) =>
          deleteMutation.mutate(target.id, { onSettled: deleteFlow.close })
        }
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}
