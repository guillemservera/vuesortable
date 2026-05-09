import type { SortableMotion } from './types'

export const DEFAULT_IGNORE_SELECTOR = 'button,input,textarea,select,a,[contenteditable="true"],[data-sortable-ignore]'
export const DEFAULT_ACTIVATION_THRESHOLD = 4
export const PREVIEW_INDEX_BIAS_RATIO = 0.15
export const PREVIEW_INDEX_BIAS_MAX = 8

export const DEFAULT_MOTION = {
  list: {
    type: 'flip',
    duration: 150,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },
  drop: {
    type: 'snap',
    duration: 120,
    easing: 'ease-out',
  },
} satisfies Exclude<SortableMotion, false>

export const DATA_ATTRIBUTES = {
  root: 'data-vuesortable-root',
  list: 'data-vuesortable-list',
  item: 'data-vuesortable-item',
  itemKey: 'data-vuesortable-item-key',
  motionKey: 'data-vuesortable-motion-key',
  overlay: 'data-vuesortable-overlay',
  overlayKey: 'data-vuesortable-overlay-key',
  overlayItem: 'data-vuesortable-overlay-item',
  placeholder: 'data-vuesortable-placeholder',
  handle: 'data-vuesortable-handle',
} as const

export const SELECTORS = {
  item: `[${DATA_ATTRIBUTES.item}]`,
  motion: `[${DATA_ATTRIBUTES.motionKey}]`,
  placeholder: `[${DATA_ATTRIBUTES.placeholder}]`,
} as const
