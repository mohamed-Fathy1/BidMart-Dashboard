import { Bell, LogOut, User } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LangSwitcher } from "@/components/layout/lang-switcher";
import { Separator } from "@/components/ui/separator";
import { accountInitials, cn } from "@/lib/utils";
import { useUIStore } from "@/features/ui/ui.store";
import { useAuthStore } from "@/features/auth/auth.store";
import { useLogoutMutation } from "@/features/auth/auth.queries";

interface TopbarProps {
  title?: string;
}

export function Topbar({ title }: TopbarProps) {
  const { t } = useTranslation();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const user = useAuthStore((s) => s.user);
  const logout = useLogoutMutation();

  return (
    <header className="z-40 flex h-[var(--topbar-height)] shrink-0 items-center border-b border-border/60 bg-sidebar-background">
      {/* Brand — width syncs with sidebar below */}
      <div
        className="flex h-full shrink-0 items-center overflow-hidden px-4"
        style={{
          width: collapsed
            ? "var(--sidebar-collapsed-width)"
            : "var(--sidebar-width)",
          transition: "width var(--duration-layout) var(--ease-sidebar)",
        }}
      >
        <Link
          to="/overview"
          aria-label={t("shell:nav.overview")}
          className={cn(
            "group/brand flex h-9 items-center gap-2 rounded-[var(--radius-md)] pe-2 ps-1 -ms-1",
            "transition-colors duration-[var(--duration-hover)] ease-[var(--ease-default)]",
            "hover:bg-muted-foreground/10 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/50",
          )}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary text-xs font-bold text-primary-foreground">
            B
          </span>
          <span
            className={cn(
              "text-sm font-semibold tracking-tight text-foreground whitespace-nowrap",
              "transition-opacity duration-[var(--duration-layout)] ease-[var(--ease-sidebar)]",
              collapsed ? "opacity-0" : "opacity-100",
            )}
          >
            BidMart
          </span>
        </Link>
      </div>

      {/* Page info + actions */}
      <div className="flex flex-1 items-center justify-between px-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>
                {title ?? t("shell:nav.overview")}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-1">
          <LangSwitcher />
          <Separator orientation="vertical" className="mx-1 h-5" />
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("shell:topbar.notifications")}
          >
            <Bell className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                aria-label={t("shell:topbar.profile")}
                className="gap-2 ps-1 pe-2"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-[10px] font-semibold">
                    {user ? (
                      accountInitials(user.name, user.email)
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                {user?.name && (
                  <span className="hidden max-w-[10rem] truncate text-sm font-medium text-foreground sm:inline">
                    {user.name}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {(user?.name || user?.email) && (
                <>
                  <DropdownMenuLabel className="space-y-0.5 font-normal">
                    {user?.name && (
                      <div className="truncate text-sm font-medium text-foreground">
                        {user.name}
                      </div>
                    )}
                    {user?.email && (
                      <div className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </div>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem asChild>
                <Link
                  to="/profile"
                  className="flex w-full cursor-pointer items-center gap-2"
                >
                  <User className="size-4" />
                  {t("shell:topbar.my_profile")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
              >
                <LogOut className="size-4" />
                {t("shell:topbar.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
