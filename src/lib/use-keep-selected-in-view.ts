import { useEffect, type RefObject } from 'react'

const SELECTED = '[data-state="checked"], [aria-current="page"]'
const EDGE_GAP = 8

/**
 * Keeps the selected segment of a segmented control visible when its track
 * scrolls sideways (phones). Only the track scrolls, never the page, and the
 * offset is measured in viewport coordinates so it holds in RTL as well.
 * Does nothing while the track fits.
 */
export function useKeepSelectedInView(
  track: RefObject<HTMLElement | null>,
  selectedKey: unknown,
) {
  useEffect(() => {
    const el = track.current
    if (!el || el.scrollWidth <= el.clientWidth) return
    const selected = el.querySelector<HTMLElement>(SELECTED)
    if (!selected) return
    const bounds = el.getBoundingClientRect()
    const box = selected.getBoundingClientRect()
    if (box.left < bounds.left) el.scrollBy({ left: box.left - bounds.left - EDGE_GAP })
    else if (box.right > bounds.right) el.scrollBy({ left: box.right - bounds.right + EDGE_GAP })
  }, [track, selectedKey])
}
