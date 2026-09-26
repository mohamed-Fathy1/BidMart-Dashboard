---
name: BidMart Admin
description: The operating console for a bilingual live-auction marketplace.
colors:
  gavel-violet: "#6A23FD"
  gavel-violet-hover: "#884FFD"
  paddle-blue: "#4378E2"
  paddle-blue-hover: "#6993E8"
  ledger-ink: "#1C1917"
  worn-stone: "#78716C"
  warm-canvas: "#F5F3F0"
  paper-white: "#FFFFFF"
  hairline-stone: "#E7E5E4"
  quiet-stone: "#F5F5F4"
  context-gray: "#D6D3D1"
  stop-red: "#DC2626"
  settled-emerald: "#059669"
typography:
  headline:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  section:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.005em"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.3
  figure:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.625rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  body-arabic:
    fontFamily: "IBM Plex Sans Arabic, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
  data:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.4
    fontFeature: "tnum"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.gavel-violet}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
    height: "36px"
  button-outline:
    backgroundColor: "{colors.warm-canvas}"
    textColor: "{colors.ledger-ink}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
    height: "36px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ledger-ink}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
    height: "36px"
  button-destructive:
    backgroundColor: "{colors.stop-red}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
    height: "36px"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.ledger-ink}"
    rounded: "{rounded.sm}"
    padding: "4px 12px"
    height: "36px"
  card:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ledger-ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
  metric-cell:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ledger-ink}"
    typography: "{typography.figure}"
    padding: "16px 20px"
  nav-item-active:
    backgroundColor: "rgba(106, 35, 253, 0.1)"
    textColor: "{colors.gavel-violet}"
    rounded: "{rounded.md}"
  status-badge:
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "2px 10px 2px 8px"
---

# Design System: BidMart Admin

## Overview

**Creative North Star: "The Auction House Ledger"**

Behind every lively auction there is a ledger: calm, exact, and trusted by everyone who reads it.
The BidMart admin dashboard is that ledger for a live-streaming marketplace. Its surfaces are warm
stone and white paper, its figures are set so they can be read and compared at a glance, and its
one strong color, Gavel Violet, marks the decision in front of the admin: the active page, the
primary action, the focused control. Everything else stays quiet so the data and the next action
can lead.

The system is built for staff who spend their day in it, mostly in Arabic, on a desktop. Density is
deliberate: tables at 48px rows, figures grouped on shared surfaces, filters in one row above the
list they scope. Components are precise and restrained: hairline borders, small radii, color only
for state, motion only for change. The mood is calm, exact, warm and confident.

It must never drift toward a generic SaaS template (gradient cards, grids of icon-plus-heading
cards, hero metrics with decorative sparklines), a crypto trading terminal (dark neon, flashing
tickers, red and green everywhere), or the playful, promotional look of the consumer marketplace
app.

Motion is two-speed and never decorative. Color and opacity change on 150ms ease-out; width,
height and collapse move on 280ms with a standard ease; tooltip, popover, menu and toast entry use
180ms with an emphasized ease; checkboxes and focus rings respond in 90ms. Exits are faster than
entries and ease in. Structure and color never share one timeline. State changes morph existing
elements instead of swapping `display`. No springs, no bounces, no staggered entrances.

**Key Characteristics:**
- Warm stone neutrals, white paper surfaces, one violet accent reserved for state and action.
- Borders do the structural work; shadows only mark the depth tier.
- Figures in the UI sans with the currency code set smaller; mono only for columns of data.
- Arabic (RTL) is designed first, never mirrored as an afterthought.
- Two-speed motion: layout moves slowly, color changes quickly, nothing bounces.

## Colors

A warm stone palette with a single saturated violet, a supporting blue that only appears inside the
brand gradient and charts, and conventional status colors that always carry a label.

### Primary
- **Gavel Violet** (#6A23FD): the accent. Primary buttons, the active navigation row and its edge
  bar, the focus ring, selected toggles, links, and the emphasized series in a chart. Tinted to
  10% for selected fills.
- **Gavel Violet Hover** (#884FFD): the lighter step for hover on the primary button and soft
  accent surfaces.

### Secondary
- **Paddle Blue** (#4378E2): the second stop of the brand gradient, and the second categorical
  series in charts. Never used alone for UI chrome.
- **Paddle Blue Hover** (#6993E8): the gradient's hover step.

### Neutral
- **Ledger Ink** (#1C1917): all primary text, and the net line in financial charts.
- **Worn Stone** (#78716C): secondary text, labels, captions, placeholders, axis ticks.
- **Warm Canvas** (#F5F3F0): the page background behind the content shell, and the sidebar.
- **Paper White** (#FFFFFF): cards, the content shell, sheets, popovers, table surfaces.
- **Hairline Stone** (#E7E5E4): every border, divider and gridline, and the 1px rules inside a
  metric band.
- **Quiet Stone** (#F5F5F4): muted fills: secondary buttons, hover rows, skeletons, chart tracks.
- **Context Gray** (#D6D3D1): the de-emphasized series in an emphasis chart.

### Status
- **Settled Emerald** (#059669): active, approved, verified, enabled, completed, positive deltas.
  Status badges use the emerald family (50 fill, 700 text, 500 dot).
- **Stop Red** (#DC2626): destructive actions (block, reject, delete, ban), errors, negative net.
- Warning (amber), info (blue) and accent (violet) badges use the matching Tailwind 50/700/500
  families. A status color always travels with its text label, never alone.

### Named Rules
**The One Accent Rule.** Gavel Violet marks state and the primary action only. If a screen has
violet on something that is neither selected, focused, active nor the main action, remove it.

**The Gradient Stays Home Rule.** The Paddle Blue to Gavel Violet gradient (90deg) belongs to the
brand logo, the login submit and auth hero CTAs. It never appears on cards, tables, list rows,
sidebar items or any repeating element.

**The Warm Gray Rule.** Neutrals come from the stone family. Do not introduce cool slate or zinc
grays.

## Typography

**Body Font:** Inter (with system-ui)
**Arabic Font:** IBM Plex Sans Arabic (with system-ui), applied whenever the document is `lang="ar"`
**Data Font:** JetBrains Mono (with ui-monospace)

**Character:** One sans carries everything a person reads: titles, labels, buttons and headline
figures. The mono is a measuring tool for columns of numbers, ids and timestamps, never a costume.

### Hierarchy
- **Headline** (600, 1.5rem, 1.2): the page title in the page header. One per page.
- **Section** (600, 1.25rem, 1.25): rare second-level headings inside a page.
- **Title** (600, 1rem, 1.3): card and sheet section titles.
- **Figure** (600, 1.625rem, 1): headline numbers in metric bands and stat cards. Proportional
  digits; the currency code sits beside it at 0.8125rem in Worn Stone.
- **Body** (400, 0.875rem, 1.5): all running text, table cells and form values.
- **Label** (500, 0.75rem, 1.4): metric labels, field labels, captions, badge text.
- **Data** (JetBrains Mono 500, 0.8125rem, tabular figures): order numbers, money and counts in
  table columns, dates in tables.

### Named Rules
**The Ledger Figure Rule.** A number that stands alone uses the sans with proportional digits. A
number that stacks in a column with others uses tabular figures. Never set a headline figure in
bold mono.

**The Arabic Digits Rule.** In Arabic every number, including those inside translated sentences
and literal copy, uses Arabic-Indic digits, and every date uses the Gregorian calendar.

## Layout

The shell is a persistent sidebar (260px, 64px collapsed) and a 56px topbar around a white content
shell on the Warm Canvas, separated by a 12px gap. At 1024px (`lg`) and up the sidebar is a rail;
below it becomes an off-canvas drawer with a scrim, and the content shell takes the full width.

Pages follow one rhythm: a page header (title, optional description or resolved window, actions at
the inline end), then 24px between blocks. List pages put their filters in one bordered shell above
the table, with the result count at the inline end. Report and statistics pages put related figures
in one metric band before the detail below them.

Spacing steps are 4, 8, 12, 16 and 24px. Groups are tight inside (8 to 12px) and separated by 24px
between blocks. Tables use 48px rows, a sticky header and hairline row borders. Metric bands are two
columns on phones and three to six from `lg` up; a cell left alone on a phone row widens to fill it.

All spacing and positioning use logical properties (inline start and end), so the same layout
mirrors cleanly in Arabic. Directional icons flip in RTL.

### Named Rules
**The One Filter Row Rule.** Filters live in one row above everything they scope. A chart or table
never carries its own private filter.

**The Report Or Filter Rule.** A surface either reports numbers or filters the list, never both. If
a figure also works as a filter, it belongs in a status filter, not a metric band.

## Elevation & Depth

Depth is structural, not decorative. Surfaces are separated by borders and by the step from Warm
Canvas to Paper White; shadows are three fixed tiers that say how far a surface sits from the page,
and nothing else.

### Shadow Vocabulary
- **Rest** (`box-shadow: 0 0 0 1px rgba(28,25,23,0.03), 0 1px 2px rgba(28,25,23,0.03)`): cards,
  metric bands and filter shells at rest.
- **Raised** (`box-shadow: 0 0 0 1px rgba(28,25,23,0.03), 0 1px 3px rgba(28,25,23,0.02), 0 4px 12px rgba(28,25,23,0.04), 0 12px 32px -4px rgba(28,25,23,0.03)`):
  the content shell and dialogs.
- **Floating** (`box-shadow: 0 0 0 1px rgba(28,25,23,0.04), 0 2px 6px rgba(28,25,23,0.04), 0 8px 24px -4px rgba(28,25,23,0.08)`):
  popovers, dropdown menus and toasts.

### Named Rules
**The Hover Never Lifts Rule.** Hover changes background, never shadow. A shadow is a depth tier,
so it only changes when the surface actually moves to another tier.

**The No Nested Cards Rule.** A card never sits inside another card or inside a sheet panel.
Inside a surface, sections are split by hairline dividers.

## Shapes

Corners are small and consistent: 6px for inputs and small buttons, 8px for the default (menus,
popovers, navigation rows), 12px for cards, metric bands and filter shells, 16px for the outer
content shell. Nothing is rounder than 16px except badges, which are full pills. Every border is
1px Hairline Stone; there are no thick or colored side borders on cards or list items. Data bars
(proportion bars, chart columns) are thin with a 4px rounded data end and a square baseline.

## Components

### Buttons
Precise and quiet; the primary one is the only colored button on most screens.
- **Shape:** gently rounded (6px), 36px tall by default (32px small, 40px large); icon buttons
  are square at the same heights.
- **Primary:** Gavel Violet fill, white text, 16px horizontal padding.
- **Outline:** Warm Canvas fill with a 1px Hairline Stone border and Ledger Ink text.
- **Ghost / Secondary:** transparent or Quiet Stone with Ledger Ink text; hover fills with Quiet
  Stone.
- **Destructive:** Stop Red fill, reserved for block, reject, delete and ban.
- **Gradient:** the brand gradient with a pill shape, only on auth and empty-state hero actions.
- **Hover / Focus / Pressed:** hover shifts the fill (primary to 90%); keyboard focus draws a 3px
  Gavel Violet ring at 50%; pressed states use opacity, never scale or translate; disabled is 50%
  opacity with no pointer events.

### Status Badges
- **Style:** full pill, 1px border in the status family at 70%, a 50-step fill, 700-step text and
  a 6px dot in the 500 step. Label text at 12px medium.
- **Width:** a badge is as wide as its label, never stretched to its column.

### Cards / Containers
- **Corner Style:** 12px.
- **Background:** Paper White on Warm Canvas.
- **Shadow Strategy:** the Rest tier (see Elevation & Depth).
- **Border:** 1px Hairline Stone.
- **Internal Padding:** 24px; card titles use the Title style.

### Inputs / Fields
- **Style:** 1px Hairline Stone border, transparent fill, 6px radius, 36px tall, 14px text.
- **Focus:** the border turns Gavel Violet and a 3px Gavel Violet ring at 50% appears.
- **Error / Disabled:** errors turn the border Stop Red with a soft red ring and an inline message
  below; disabled drops to 50% opacity.

### Navigation
- **Sidebar rows:** 18px icons with 14px labels. Hover fills with a soft stone tint; the active
  row fills with Gavel Violet at 10%, turns its text violet, and shows a 3px violet edge bar at the
  inline start. Groups expand with a rotating chevron on the layout timing.
- **Section tabs:** a segmented control inside a 1px bordered track; the active segment is a white
  pill at the Rest tier with violet text. They are navigation links marked as the current page, not
  ARIA tabs.
- **Breadcrumb and command palette** derive from the same navigation registry, so labels match
  everywhere.

### Metric Band (signature)
Related figures share one Paper White surface split by 1px Hairline Stone rules, instead of a card
each. Each cell stacks a Label, a Figure and an optional caption. A cell can span two columns (a
featured item such as the top show). A band only reports; it never filters.

### Status Filter
A list filtered by status groups gets a segmented control directly above the table: "All" first,
then each group, every option carrying its count for the whole window in a small pill. The checked
option is a white segment at the Rest tier with violet text and a violet-tinted count. It is a
radio group, so arrow keys move through it. Counts never change with the selection, and the row's
inline end holds any single summary figure (such as average order value).

### Data Table
48px rows, sticky header, hairline row borders, hover fills with Quiet Stone at 50%. Numeric and id
columns use the Data style and align to the inline end. Empty states are one line of copy and one
action, with no illustration.

### Charts
Charts follow the emphasis form: one Gavel Violet series is the point, context series are Context
Gray, lines are 2px and straight between points, gridlines are solid hairlines, and axis ticks are
round numbers that include zero. A legend is present for two or more series, and every chart has a
table beside it with the same values.

## Do's and Don'ts

### Do:
- **Do** reserve Gavel Violet (#6A23FD) for the selected, focused, active or primary thing on the
  screen.
- **Do** group related figures in one metric band with 1px rules, and set them in the sans with a
  smaller currency code.
- **Do** separate surfaces with 1px Hairline Stone borders and the canvas-to-paper step, using only
  the Rest, Raised and Floating shadows.
- **Do** design every screen in Arabic first: logical properties, flipped directional icons,
  Arabic-Indic digits, Gregorian dates.
- **Do** keep status colors paired with a text label, and keep badges as wide as their label.
- **Do** use 6, 8, 12 and 16px radii for inputs, menus, cards and the shell respectively.

### Don't:
- **Don't** put the brand gradient on cards, tables, rows, sidebar items or any repeated element.
- **Don't** add a shadow on hover; change the background instead.
- **Don't** nest cards, or build pages out of grids of identical icon-plus-heading cards.
- **Don't** set headline figures in bold mono, or use mono as decoration for non-data text.
- **Don't** use glass or backdrop blur panels, emoji in the UI, or thick colored side borders.
- **Don't** drift toward a generic SaaS template, a dark trading terminal, or the consumer app's
  promotional look.
