import { Fragment, useMemo } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import {
  navSections,
  type NavEntry,
} from '@/components/layout/nav-items'

interface CrumbDef {
  to?: string
  labelKey: string
}

// Full chain (Group → … → Leaf) for every known surface, keyed by the surface's own path.
const PATH_TO_CRUMBS: Record<string, CrumbDef[]> = {}
// Single-segment label fallbacks, derived from leaves' final URL segments.
// Lets nested dynamic paths (e.g. /categories/<id>/sub-categories) still resolve `sub-categories`.
const SEGMENT_LABELS: Record<string, string> = {}

function visit(entry: NavEntry, parents: CrumbDef[]) {
  if (entry.kind === 'leaf') {
    PATH_TO_CRUMBS[entry.to] = [
      ...parents,
      { labelKey: entry.labelKey, to: entry.to },
    ]
    const lastSeg = entry.to.split('/').filter(Boolean).pop()
    if (lastSeg) SEGMENT_LABELS[lastSeg] = entry.labelKey
  } else {
    const groupCrumb: CrumbDef = { labelKey: entry.labelKey }
    if (!PATH_TO_CRUMBS[entry.matchPath]) {
      PATH_TO_CRUMBS[entry.matchPath] = [...parents, groupCrumb]
    }
    entry.children.forEach((c) => visit(c, [...parents, groupCrumb]))
  }
}

navSections.forEach((s) => s.entries.forEach((e) => visit(e, [])))

// Surfaces that aren't in the sidebar.
PATH_TO_CRUMBS['/profile'] = [
  { labelKey: 'shell:topbar.my_profile', to: '/profile' },
]

function isProbablyId(seg: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(seg) || /^\d+$/.test(seg)
}

function findLongestKnownPrefix(segments: string[]): {
  chain: CrumbDef[] | null
  consumed: number
} {
  for (let i = segments.length; i > 0; i--) {
    const prefix = '/' + segments.slice(0, i).join('/')
    const chain = PATH_TO_CRUMBS[prefix]
    if (chain) return { chain, consumed: i }
  }
  return { chain: null, consumed: 0 }
}

function buildCrumbs(pathname: string): CrumbDef[] {
  const clean = pathname.replace(/\/$/, '') || '/'
  if (clean === '/' || clean === '/overview') {
    return [{ labelKey: 'shell:nav.overview' }]
  }

  const segments = clean.split('/').filter(Boolean)
  const { chain, consumed } = findLongestKnownPrefix(segments)
  const crumbs: CrumbDef[] = []

  if (chain) {
    const fullyConsumed = consumed === segments.length
    chain.forEach((c, idx) => {
      const isOverallLast = fullyConsumed && idx === chain.length - 1
      crumbs.push({
        labelKey: c.labelKey,
        to: isOverallLast ? undefined : c.to,
      })
    })
  }

  let acc = '/' + segments.slice(0, consumed).join('/')
  for (let i = consumed; i < segments.length; i++) {
    const seg = segments[i]!
    acc += '/' + seg
    const isLast = i === segments.length - 1
    if (isProbablyId(seg)) {
      // Skip the trailing id segment — the page <h1> conveys the same context.
      // For mid-path ids (e.g. /categories/<id>/sub-categories) keep a generic
      // "Detail" placeholder so subsequent crumbs still chain correctly.
      if (!isLast) crumbs.push({ labelKey: 'shell:topbar.detail' })
      continue
    }
    const labelKey = SEGMENT_LABELS[seg] ?? seg.replace(/-/g, ' ')
    crumbs.push({ labelKey, to: isLast ? undefined : acc })
  }

  return crumbs
}

export function BreadcrumbTrail() {
  const { t } = useTranslation()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const crumbs = useMemo(() => buildCrumbs(pathname), [pathname])

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex min-w-0 items-center gap-1 text-sm"
    >
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1
        const label = t(crumb.labelKey)
        return (
          <Fragment key={`${crumb.labelKey}-${i}`}>
            {i > 0 && (
              <ChevronRight
                aria-hidden
                className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50 rtl:rotate-180"
              />
            )}
            {crumb.to && !isLast ? (
              <Link
                to={crumb.to}
                className={cn(
                  'truncate rounded-sm px-1.5 py-0.5 text-muted-foreground hover:bg-muted hover:text-foreground',
                  'transition-colors duration-(--duration-hover) ease-(--ease-default)',
                )}
              >
                {label}
              </Link>
            ) : (
              <span
                aria-current={isLast ? 'page' : undefined}
                className={cn(
                  'truncate px-1.5 py-0.5',
                  isLast
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}
