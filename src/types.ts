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

export type SortableItemEntry<T = unknown> = {
  element: T
  index: number
  key: string
  type: 'item'
}

export type SortablePlaceholderEntry = {
  activeKey: string
  height: number
  key: string
  type: 'placeholder'
  width: number
}

export type SortableRenderEntry<T = unknown> = SortableItemEntry<T> | SortablePlaceholderEntry

export type SortableListAttrs = Record<string, unknown>

export type SortableItemAttrsResult = {
  attrs: Record<string, unknown>
}

export type SortablePlaceholderAttrsResult = {
  attrs: Record<string, unknown>
  style: CSSProperties
}

export type SortableOverlayRenderState<T = unknown> = {
  element: T
  index: number
  key: string
  dragging: boolean
  attrs: Record<string, unknown>
  style: CSSProperties
}

export type SortableDefaultSlotProps<T = unknown> = {
  entries: SortableRenderEntry<T>[]
  dragging: boolean
  dropping: boolean
  listAttrs: SortableListAttrs
  getItemAttrs: (entry: SortableItemEntry<T>) => SortableItemAttrsResult
  getHandleAttrs: (entry: SortableItemEntry<T>) => Record<string, unknown>
  getPlaceholderAttrs: (entry: SortablePlaceholderEntry) => SortablePlaceholderAttrsResult
  overlay: SortableOverlayRenderState<T> | null
}
