import { Bell, LogOut, User } from "lucide-react";
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
import { cn } from "@/lib/utils";
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
    <header className="z-40 flex h-[var(--topbar-height)] shrink-0 items-center">
      {/* Brand — width syncs with sidebar below */}
      <div
        className="flex h-full shrink-0 items-center gap-2 overflow-hidden px-4"
        style={{
          width: collapsed
            ? "var(--sidebar-collapsed-width)"
            : "var(--sidebar-width)",
          transition: "width var(--duration-layout) var(--ease-sidebar)",
        }}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary text-xs font-bold text-primary-foreground">
          B
        </span>
        <span
          className={cn(
            "text-base font-semibold tracking-tight text-foreground whitespace-nowrap",
            "transition-opacity duration-[var(--duration-layout)] ease-[var(--ease-sidebar)]",
            collapsed ? "opacity-0" : "opacity-100",
          )}
        >
          BidMart
        </span>
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
                size="icon"
                aria-label={t("shell:topbar.profile")}
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {user?.email && (
                <>
                  <DropdownMenuLabel className="truncate font-normal text-muted-foreground text-xs">
                    {user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                variant="destructive"
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
              >
                <LogOut className="size-4" />
                {t("shell:topbar.sign_out")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
