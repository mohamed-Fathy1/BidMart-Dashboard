import type { ReactNode } from "react";
import { LangSwitcher } from "./lang-switcher";
import { cn } from "@/lib/utils";

interface BrandmarkProps {
  className?: string;
}

function Brandmark({ className }: BrandmarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={32}
      height={32}
      aria-hidden
      className={cn(className)}
    >
      <rect
        width="32"
        height="32"
        rx="8"
        className="fill-primary"
      />
      <text
        x="16"
        y="22"
        textAnchor="middle"
        className="fill-primary-foreground font-sans text-[18px] font-bold tracking-tight"
      >
        B
      </text>
    </svg>
  );
}

interface AuthShellProps {
  children: ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="relative min-h-screen bg-canvas">
      <div className="absolute top-4 end-4 z-10">
        <LangSwitcher />
      </div>

      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
          <div className="mx-auto w-full max-w-sm space-y-8">
            <div className="flex items-center gap-2.5">
              <Brandmark className="h-8 w-8 shrink-0 rounded-md" />
              <span className="text-sm font-semibold tracking-tight">
                BidMart Admin
              </span>
            </div>
            {children}
          </div>
        </section>

        <aside
          aria-hidden="true"
          className="relative hidden overflow-hidden border-s border-border bg-sidebar lg:block"
        >
          <TileComposition />
        </aside>
      </div>
    </div>
  );
}

function TileComposition() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="absolute -translate-x-44 translate-y-10 -rotate-6">
        <ListingTile size="sm" muted />
      </div>
      <div className="absolute translate-x-48 -translate-y-12 rotate-[5deg]">
        <ListingTile size="sm" muted />
      </div>
      <div className="absolute translate-x-40 translate-y-32 rotate-[8deg]">
        <ListingTile size="xs" muted />
      </div>
      <div className="relative">
        <ListingTile size="lg" accent />
      </div>
    </div>
  );
}

interface ListingTileProps {
  size: "xs" | "sm" | "lg";
  accent?: boolean;
  muted?: boolean;
}

function ListingTile({ size, accent, muted }: ListingTileProps) {
  const dims = {
    xs: "w-40",
    sm: "w-52",
    lg: "w-64",
  }[size];

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4",
        accent
          ? "shadow-[var(--shadow-floating)]"
          : "shadow-[var(--shadow-rest)]",
        muted && "opacity-70",
        dims,
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted">
        {accent && (
          <span className="absolute top-2 start-2 inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
        )}
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-2.5 w-3/4 rounded-full bg-border" />
        <div className="h-2 w-1/2 rounded-full bg-border" />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="h-2 w-12 rounded-full bg-border" />
        {accent ? (
          <div className="h-2 w-10 rounded-full bg-primary/30" />
        ) : (
          <div className="h-2 w-8 rounded-full bg-border" />
        )}
      </div>
    </div>
  );
}
