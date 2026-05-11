import { PREVIEW_INDEX_BIAS_MAX, PREVIEW_INDEX_BIAS_RATIO } from '../constants'
import type { SortableCollision, SortableItemEntry, SortableOrientation } from '../types'

export type RootGeometry = {
  height: number
  left: number
  top: number
  width: number
}

export type OverlayPosition = {
  left: number
  y: number
}

export type MeasuredEntry<T = unknown> = SortableItemEntry<T> & {
  centerX: number
  centerY: number
  height: number
  left: number
  top: number
  width: number
}

export type LayoutSnapshot<T = unknown> = {
  items: MeasuredEntry<T>[]
  rootHeight: number
  rootWidth: number
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function getRootGeometry(root: HTMLElement, rootRect = root.getBoundingClientRect()): RootGeometry {
  return {
    height: root.clientHeight || rootRect.height,
    left: rootRect.left + root.clientLeft,
    top: rootRect.top + root.clientTop,
    width: root.clientWidth || rootRect.width,
  }
}

export function measureSortableLayout<T>(
  root: HTMLElement,
  rootRect: DOMRect,
  entries: SortableItemEntry<T>[],
  itemSelector: string,
) {
  const rootGeometry = getRootGeometry(root, rootRect)

  const items = Array.from(root.querySelectorAll<HTMLElement>(itemSelector))
    .map((element): MeasuredEntry<T> | null => {
      const key = element.dataset.vuesortableItemKey
      const entry = key ? entries.find(candidate => candidate.key === key) : undefined
      if (!key || !entry) return null

      const rect = element.getBoundingClientRect()
      const left = rect.left - rootGeometry.left
      const top = rect.top - rootGeometry.top

      return {
        ...entry,
        centerX: left + rect.width / 2,
        centerY: top + rect.height / 2,
        height: rect.height,
        left,
        top,
        width: rect.width,
      }
    })
    .filter((item): item is MeasuredEntry<T> => item !== null)

  return {
    items,
    rootHeight: rootGeometry.height,
    rootWidth: rootGeometry.width,
  } satisfies LayoutSnapshot<T>
}

export function findPreviewIndex<T>(
  position: OverlayPosition,
  state: {
    height: number
    key: string
    layout: LayoutSnapshot<T>
    width: number
  },
  orientation: SortableOrientation,
  collision: SortableCollision,
) {
  const overlayCenter = orientation === 'horizontal'
    ? position.left + state.width / 2
    : position.y + state.height / 2
  const measuredItems = state.layout.items.filter(item => item.key !== state.key)
  const activeItem = state.layout.items.find(item => item.key === state.key)
  const activeCenter = activeItem ? getMeasuredItemCenter(activeItem, orientation) : overlayCenter
  const direction = Math.sign(overlayCenter - activeCenter)

  for (const [index, item] of measuredItems.entries()) {
    const itemCenter = getMeasuredItemCenter(item, orientation)
    const previewBias = collision === 'biased-center' && direction !== 0
      ? getPreviewIndexBias(item, orientation)
      : 0

    if (overlayCenter < itemCenter - direction * previewBias) return index
  }

  return measuredItems.length
}

export function getMeasuredItemCenter(item: MeasuredEntry, orientation: SortableOrientation) {
  return orientation === 'horizontal' ? item.centerX : item.centerY
}

export function getPreviewIndexBias(item: MeasuredEntry, orientation: SortableOrientation) {
  const size = orientation === 'horizontal' ? item.width : item.height
  return Math.min(PREVIEW_INDEX_BIAS_MAX, size * PREVIEW_INDEX_BIAS_RATIO)
}

export function estimateItemGap(items: MeasuredEntry[], orientation: SortableOrientation) {
  for (let index = 1; index < items.length; index += 1) {
    const previous = items[index - 1]
    const current = items[index]
    if (!previous || !current) continue

    const gap = orientation === 'horizontal'
      ? current.left - (previous.left + previous.width)
      : current.top - (previous.top + previous.height)

    if (gap > 0) return gap
  }

  return 0
}
