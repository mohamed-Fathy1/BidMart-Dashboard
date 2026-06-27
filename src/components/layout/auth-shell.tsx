import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ArrowUp } from "lucide-react";
import { LangSwitcher } from "./lang-switcher";
import { BrandLogo, BrandWordmark } from "@/components/shared/brand-logo";
import { Sparkline } from "@/components/shared/sparkline";

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
              logoClassName="h-12 w-12"
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
          <HeroWallpaper />
          <EditorialHero />
        </aside>
      </div>
    </div>
  );
}

interface TopoRing {
  baseR: number;
  freqs: Array<{ w: number; a: number; p: number }>;
  stroke: string;
  opacity: number;
}

const TOPO_CENTER = { cx: 560, cy: 240 };

const TOPO_RINGS: TopoRing[] = [
  {
    baseR: 55,
    freqs: [
      { w: 3, a: 6, p: 0.2 },
      { w: 5, a: 3, p: 1.1 },
    ],
    stroke: "#4378E2",
    opacity: 0.05,
  },
  {
    baseR: 95,
    freqs: [
      { w: 3, a: 9, p: 0.6 },
      { w: 6, a: 4, p: 0.4 },
    ],
    stroke: "#4378E2",
    opacity: 0.05,
  },
  {
    baseR: 140,
    freqs: [
      { w: 4, a: 12, p: 0.1 },
      { w: 7, a: 5, p: 2.0 },
    ],
    stroke: "#5350F0",
    opacity: 0.05,
  },
  {
    baseR: 195,
    freqs: [
      { w: 3, a: 16, p: 1.3 },
      { w: 5, a: 7, p: 0.8 },
    ],
    stroke: "#6A23FD",
    opacity: 0.045,
  },
  {
    baseR: 260,
    freqs: [
      { w: 4, a: 20, p: 0.5 },
      { w: 8, a: 6, p: 2.4 },
    ],
    stroke: "#6A23FD",
    opacity: 0.04,
  },
  {
    baseR: 335,
    freqs: [
      { w: 3, a: 26, p: 2.1 },
      { w: 6, a: 9, p: 0.9 },
    ],
    stroke: "#6A23FD",
    opacity: 0.03,
  },
  {
    baseR: 415,
    freqs: [
      { w: 4, a: 30, p: 0.7 },
      { w: 7, a: 11, p: 1.7 },
    ],
    stroke: "#6A23FD",
    opacity: 0.025,
  },
  {
    baseR: 505,
    freqs: [
      { w: 3, a: 36, p: 1.5 },
      { w: 5, a: 14, p: 0.3 },
    ],
    stroke: "#6A23FD",
    opacity: 0.02,
  },
];

function topoPath(
  cx: number,
  cy: number,
  baseR: number,
  freqs: Array<{ w: number; a: number; p: number }>,
  steps = 180,
): string {
  const pts: string[] = [];
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    let r = baseR;
    for (const { w, a, p } of freqs) r += Math.sin(t * w + p) * a;
    const x = cx + Math.cos(t) * r;
    const y = cy + Math.sin(t) * r;
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return `M ${pts.join(" L ")} Z`;
}

const TOPO_PATHS = TOPO_RINGS.map((ring) => ({
  d: topoPath(TOPO_CENTER.cx, TOPO_CENTER.cy, ring.baseR, ring.freqs),
  stroke: ring.stroke,
  opacity: ring.opacity,
}));

function ContourBackground() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 800 800"
      aria-hidden
    >
      <defs>
        <radialGradient id="bm-contour-fade" cx="70%" cy="30%" r="45%">
          <stop offset="0%" stopColor="#6A23FD" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#6A23FD" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="800" fill="url(#bm-contour-fade)" />
      <g fill="none" strokeWidth="1.1" strokeLinejoin="round">
        {TOPO_PATHS.map((ring, i) => (
          <path
            key={i}
            d={ring.d}
            stroke={ring.stroke}
            strokeOpacity={ring.opacity}
          />
        ))}
      </g>
    </svg>
  );
}

function HeroWallpaper() {
  return (
    <svg
      className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 w-full"
      preserveAspectRatio="none"
      viewBox="0 0 800 400"
      aria-hidden
    >
      <defs>
        <linearGradient id="bm-hero-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#6A23FD" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#6A23FD" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="bm-hero-line" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#4378E2" />
          <stop offset="100%" stopColor="#6A23FD" />
        </linearGradient>
      </defs>
      <path
        d="M0 320 C 90 280, 150 240, 230 250 C 320 262, 380 200, 470 190 C 560 180, 620 130, 720 110 L 800 90 L 800 400 L 0 400 Z"
        fill="url(#bm-hero-area)"
      />
      <path
        d="M0 320 C 90 280, 150 240, 230 250 C 320 262, 380 200, 470 190 C 560 180, 620 130, 720 110 L 800 90"
        fill="none"
        stroke="url(#bm-hero-line)"
        strokeOpacity="0.18"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface HeroMetric {
  labelKey: string;
  value: string;
  delta: string;
  data: number[];
}

const HERO_METRICS: HeroMetric[] = [
  {
    labelKey: "common:auth.hero.metric.auctions_label",
    value: "248",
    delta: "+12%",
    data: [12, 14, 13, 16, 18, 17, 21, 24, 26],
  },
  {
    labelKey: "common:auth.hero.metric.sellers_label",
    value: "12",
    delta: "+3",
    data: [4, 6, 5, 7, 9, 8, 10, 11, 12],
  },
  {
    labelKey: "common:auth.hero.metric.buyers_label",
    value: "4,318",
    delta: "+8.4%",
    data: [30, 34, 32, 38, 36, 42, 44, 41, 46],
  },
];

function EditorialHero() {
  const { t } = useTranslation();

  return (
    <div className="relative flex h-full w-full items-center justify-center px-12">
      <div className="w-full max-w-md space-y-10">
        <div className="space-y-3">
          <BrandLogo className="h-14 w-14" gradientId="auth-hero-mark" />
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {t("common:auth.hero.console_eyebrow")}
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-foreground">
            {t("common:auth.hero.tagline")}
          </h2>
          <p className="text-pretty text-base leading-relaxed text-muted-foreground">
            {t("common:auth.hero.subtitle")}
          </p>
        </div>

        <div className="h-px w-12 bg-border" />

        <dl className="grid grid-cols-3 gap-6">
          {HERO_METRICS.map((metric) => (
            <div key={metric.labelKey} className="space-y-1.5">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {t(metric.labelKey)}
              </dt>
              <dd className="flex items-baseline gap-2">
                <span className="font-mono text-2xl font-semibold leading-none text-foreground tabular-nums">
                  {metric.value}
                </span>
                <Sparkline
                  data={metric.data}
                  width={36}
                  height={12}
                  color="var(--color-primary)"
                  className="opacity-60"
                />
              </dd>
              <dd className="inline-flex items-center gap-0.5 font-mono text-[10px] font-medium tabular-nums text-emerald-700">
                <ArrowUp className="size-2.5" aria-hidden />
                {metric.delta}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
