import type { CSSProperties } from 'vue'

export type SortableOrientation = 'vertical' | 'horizontal'

export type SortableBehavior = 'insert'

export type SortableCollision = 'center' | 'biased-center'

export type SortableActivation = {
  threshold?: number
  delay?: number
  delayOnTouchOnly?: boolean
}

export type SortableMotion =
  | false
  | {
      list?: false | {
        type?: 'flip'
        duration?: number
        easing?: string
      }
      drop?: false | {
        type?: 'snap'
        duration?: number
        easing?: string
      }
    }

export type SortableItemKey<T = unknown> = ((item: T) => string | number) | keyof T

export type SortableCanMovePayload<T = unknown> = {
  item: T
  key: string
  from: number
  to: number
  items: T[]
}

export type SortableProps<T = unknown> = {
  modelValue: T[]
  itemKey: SortableItemKey<T>
  as?: string
  disabled?: boolean
  orientation?: SortableOrientation
  behavior?: SortableBehavior
  collision?: SortableCollision
  activation?: SortableActivation
  handle?: string
  ignore?: string
  motion?: SortableMotion
  canMove?: (payload: SortableCanMovePayload<T>) => boolean
  class?: unknown
  listClass?: unknown
}

export type SortableDragPayload<T = unknown> = {
  item: T
  key: string
  from: number
  to: number
}

export type SortableMovePayload<T = unknown> = SortableDragPayload<T> & {
  activeIndex: number
  pointer: { x: number, y: number }
}

export type SortableSlotAttrs = Record<string, unknown>

export type SortableItemSlotProps<T = unknown> = {
  element: T
  index: number
  active: boolean
  dragging: boolean
  attrs: SortableSlotAttrs
  handleAttrs: SortableSlotAttrs
}

export type SortableOverlaySlotProps<T = unknown> = {
  element: T
  index: number
  dragging: boolean
  attrs: SortableSlotAttrs
  style: CSSProperties
}

export type SortablePlaceholderSlotProps = {
  key: string
  attrs: SortableSlotAttrs
  style: CSSProperties
}

export type SortableEntry<T = unknown> = {
  element: T
  index: number
  key: string
}

export type SortablePlaceholderEntry = {
  height: number
  key: string
  type: 'placeholder'
  width: number
  activeKey: string
}

export type SortableItemEntry<T = unknown> = SortableEntry<T> & {
  type: 'item'
}

export type SortableLayoutEntry<T = unknown> = SortableItemEntry<T> | SortablePlaceholderEntry
