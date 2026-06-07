import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Check, ShieldCheck, TrendingUp } from "lucide-react";
import { LangSwitcher } from "./lang-switcher";
import { BrandWordmark } from "@/components/shared/brand-logo";

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
          <AdminConsoleHero />
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

function AdminConsoleHero() {
  const { t } = useTranslation();

  return (
    <div className="relative flex h-full w-full items-center justify-center px-10">
      <div className="relative w-full max-w-md">
        <KpiTile
          label={t("common:auth.hero.kpi_label")}
          value="248"
          delta={t("common:auth.hero.kpi_delta")}
        />

        <QueueCard
          eyebrow={t("common:auth.hero.queue_eyebrow")}
          title={t("common:auth.hero.queue_title")}
          countLabel={t("common:auth.hero.queue_count")}
          pendingLabel={t("common:auth.hero.row_status_pending")}
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

interface QueueCardProps {
  eyebrow: string;
  title: string;
  countLabel: string;
  pendingLabel: string;
}

const QUEUE_ROWS = [
  { initial: "A", name: "Atlas Auctions", cr: "CR-1042 998", color: "#4378E2" },
  { initial: "V", name: "Verde Motors", cr: "CR-7783 220", color: "#6A23FD" },
  { initial: "S", name: "Saif Electronics", cr: "CR-3398 514", color: "#884FFD" },
];

function QueueCard({ eyebrow, title, countLabel, pendingLabel }: QueueCardProps) {
  return (
    <div className="relative rounded-2xl bg-card p-5 shadow-[var(--shadow-floating)]">
      <span className="bg-gradient-primary absolute inset-x-5 top-0 h-1 rounded-b-full" />

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
            <ShieldCheck className="size-3.5" />
            {eyebrow}
          </span>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-primary/10 px-2 font-mono text-xs font-semibold text-primary tabular-nums">
          12
        </span>
      </div>

      <ul className="mt-4 space-y-2">
        {QUEUE_ROWS.map((row) => (
          <QueueRow key={row.cr} {...row} pendingLabel={pendingLabel} />
        ))}
      </ul>

      <p className="mt-3 text-[11px] text-muted-foreground">{countLabel}</p>
    </div>
  );
}

interface QueueRowProps {
  initial: string;
  name: string;
  cr: string;
  color: string;
  pendingLabel: string;
}

function QueueRow({ initial, name, cr, color, pendingLabel }: QueueRowProps) {
  return (
    <li className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/40 p-2">
      <span
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold text-white"
        style={{ backgroundColor: color }}
      >
        {initial}
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-xs font-medium text-foreground">
          {name}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
          {cr}
        </span>
      </div>
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
        <span className="size-1.5 rounded-full bg-amber-500" />
        {pendingLabel}
      </span>
      <span className="bg-gradient-primary inline-flex size-7 shrink-0 items-center justify-center rounded-full text-primary-foreground shadow-rest">
        <Check className="size-3.5" />
      </span>
    </li>
  );
}

interface KpiTileProps {
  label: string;
  value: string;
  delta: string;
}

function KpiTile({ label, value, delta }: KpiTileProps) {
  return (
    <div
      className="absolute -top-12 -end-2 w-44 rotate-3 rounded-xl bg-card p-3 shadow-[var(--shadow-rest)]"
      aria-hidden
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <TrendingUp className="size-3.5 text-emerald-600" />
      </div>
      <div className="mt-0.5 font-mono text-2xl font-semibold text-foreground tabular-nums">
        {value}
      </div>
      <div className="text-[10px] font-semibold text-emerald-700">{delta}</div>
      <Sparkline />
    </div>
  );
}

function Sparkline() {
  return (
    <svg
      viewBox="0 0 100 24"
      preserveAspectRatio="none"
      className="mt-1.5 h-6 w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="bm-spark" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#4378E2" />
          <stop offset="1" stopColor="#6A23FD" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke="url(#bm-spark)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points="0,20 12,16 24,18 36,12 48,14 60,8 72,10 84,5 100,3"
      />
    </svg>
  );
}
