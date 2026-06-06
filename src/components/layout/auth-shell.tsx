import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Coins, Gavel } from "lucide-react";
import { LangSwitcher } from "./lang-switcher";
import { BrandWordmark } from "@/components/shared/brand-logo";
import { cn } from "@/lib/utils";

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
            <BrandWordmark
              logoClassName="h-9 w-9"
              textClassName="text-sm font-semibold tracking-tight"
            />
            {children}
          </div>
        </section>

        <aside
          aria-hidden="true"
          className="relative hidden overflow-hidden border-s border-border lg:block"
          style={{ backgroundColor: "#F5F2FF" }}
        >
          <ContourBackground />
          <AuctionHero />
        </aside>
      </div>
    </div>
  );
}

function ContourBackground() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 800 800"
      aria-hidden
    >
      <defs>
        <radialGradient id="bm-contour-fade" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stopColor="#6A23FD" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#6A23FD" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="800" fill="url(#bm-contour-fade)" />
      <g
        fill="none"
        stroke="#6A23FD"
        strokeOpacity="0.10"
        strokeWidth="1.25"
      >
        {[60, 120, 190, 270, 360, 450].map((r) => (
          <ellipse key={r} cx="400" cy="400" rx={r * 1.15} ry={r * 0.85} />
        ))}
      </g>
    </svg>
  );
}

function AuctionHero() {
  const { t } = useTranslation();

  return (
    <div className="relative flex h-full w-full items-center justify-center px-10">
      <div className="relative w-full max-w-md">
        <FloatingCoin className="-top-6 -start-8" />
        <FloatingCoin className="-top-2 end-2" size="sm" />
        <FloatingCoin className="bottom-4 -end-6" />
        <FloatingCoin className="-bottom-8 start-10" size="sm" />

        <SecondaryCard />
        <LiveBiddingCard
          eyebrow={t("common:auth.hero.live")}
          bidAmount={t("common:auth.hero.bid_amount")}
          bidLabel={t("common:auth.hero.bid_now")}
          timer="00:14"
        />

        <div className="mt-10 space-y-2 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {t("common:auth.hero.tagline")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("common:auth.hero.subtitle")}
          </p>
        </div>
      </div>
    </div>
  );
}

interface LiveBiddingCardProps {
  eyebrow: string;
  bidAmount: string;
  bidLabel: string;
  timer: string;
}

function LiveBiddingCard({
  eyebrow,
  bidAmount,
  bidLabel,
  timer,
}: LiveBiddingCardProps) {
  return (
    <div className="relative rounded-2xl bg-card p-5 shadow-[var(--shadow-floating)]">
      <span className="bg-gradient-primary absolute inset-x-5 top-0 h-1 rounded-b-full" />

      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
          <span className="inline-block size-1.5 rounded-full bg-primary" />
          {eyebrow}
        </span>
        <div className="flex -space-x-2">
          {["#E9D5FF", "#C7D2FE", "#FBCFE8"].map((c) => (
            <span
              key={c}
              className="inline-block size-6 rounded-full border-2 border-card"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="font-mono text-3xl font-semibold tracking-tight text-foreground tabular-nums">
          {bidAmount}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 font-mono text-xs font-medium text-foreground tabular-nums">
          <span className="inline-block size-1.5 rounded-full bg-destructive" />
          {timer}
        </span>
        <span className="bg-gradient-primary inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-rest">
          <Gavel className="size-3.5" />
          {bidLabel}
        </span>
      </div>
    </div>
  );
}

function SecondaryCard() {
  return (
    <div
      className="absolute -bottom-10 -end-6 w-44 -rotate-6 rounded-2xl bg-card p-3 shadow-[var(--shadow-rest)]"
      aria-hidden
    >
      <div className="aspect-[4/3] w-full rounded-lg bg-muted" />
      <div className="mt-2.5 space-y-1.5">
        <div className="h-2 w-3/4 rounded-full bg-border" />
        <div className="h-2 w-1/2 rounded-full bg-border" />
      </div>
    </div>
  );
}

interface FloatingCoinProps {
  className?: string;
  size?: "sm" | "md";
}

function FloatingCoin({ className, size = "md" }: FloatingCoinProps) {
  const dims = size === "sm" ? "size-7" : "size-10";
  const icon = size === "sm" ? "size-3.5" : "size-5";
  return (
    <span
      className={cn(
        "bg-gradient-primary absolute inline-flex items-center justify-center rounded-full text-primary-foreground shadow-rest",
        dims,
        className,
      )}
      aria-hidden
    >
      <Coins className={icon} />
    </span>
  );
}

