# Domain glossary

Terms the admin dashboard uses with a precise meaning. Code, copy and briefs use these words in
these senses. Add a term when a screen introduces one; never redefine one in a component.

## Reporting (Statistics and Reports)

- **Counted sale**: an order paid inside the window, not cancelled, with no accepted full refund.
  Every money figure on Statistics and Reports counts this set. A partially refunded order counts
  at its original amount.
- **Period** (Statistics): a calendar unit (day, ISO week, month, quarter, year) containing an
  anchor date. Not a rolling window.
- **Range** (Reports): an inclusive From to To pair of calendar days, sent both or neither.
  Neither means the last 30 days including today.
- **Window**: the resolved start and end the server actually used, echoed as `dateRange`. The UI
  renders the window, never its own picker value.
- **Snapshot metric**: a figure that ignores the window. Active sellers is the only one.
- **Status bucket** (Financial Report): Completed, In delivery, In progress. A fulfilment view of
  paid orders only.
- **Status group** (Orders and Sales): Completed, Cancelled, In progress, Refunded. An exhaustive
  partition of every order created in the window; Refunded comes from the refund ledger, not the
  status column.
- **Drill-down**: the live detail of one order. It can disagree with the row that opened it; the
  detail is right.
- **Share intent**: a share sheet opening, counted as a share. Reads high by construction.
- **Store**: the seller's account. There is no separate store name; the store name is the seller's
  full name or username.
- **Watch minutes**: an estimate summed over finalised show analytics only.
- **Top show**: the show with the highest sales in the window, then views, then most recent.
