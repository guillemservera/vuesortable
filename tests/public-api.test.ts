import { describe, expect, expectTypeOf, it } from 'vitest'
import {
  Sortable,
  moveItem,
  reorderItems,
} from '../src'
import type {
  SortableCanMovePayload,
  SortableDefaultSlotProps,
  SortableDragPayload,
  SortableItemAttrsResult,
  SortableOverlayRenderState,
  SortableMotion,
  SortableProps,
} from '../src'

type Item = {
  id: string
  label: string
}

describe('public API contract', () => {
  it('exports the documented runtime API', () => {
    expect(Sortable).toBeDefined()
    expect(reorderItems).toBeTypeOf('function')
    expect(moveItem).toBeTypeOf('function')
  })

  it('does not export internal composables', async () => {
    const publicApi = await import('../src')

    expect('useSortableList' in publicApi).toBe(false)
  })

  it('keeps the documented generic types available', () => {
    expectTypeOf<SortableProps<Item>>().toMatchTypeOf<{
      modelValue: Item[]
      itemKey: keyof Item | ((item: Item) => string | number)
      canMove?: (payload: SortableCanMovePayload<Item>) => boolean
      motion?: SortableMotion
    }>()
    expectTypeOf<SortableDragPayload<Item>>().toHaveProperty('to').toEqualTypeOf<number>()
    expectTypeOf<SortableProps<Item>>().not.toHaveProperty('class')
    expectTypeOf<SortableProps<Item>>().not.toHaveProperty('listClass')
    expectTypeOf<SortableProps<Item>>().not.toHaveProperty('keyboard')
    expectTypeOf<SortableProps<Item>>().not.toHaveProperty('getItemLabel')
    expectTypeOf<SortableDefaultSlotProps<Item>['getItemAttrs']>().toBeFunction()
    expectTypeOf<ReturnType<SortableDefaultSlotProps<Item>['getItemAttrs']>>().toEqualTypeOf<SortableItemAttrsResult>()
    expectTypeOf<SortableOverlayRenderState<Item>['style']>().toBeObject()
  })
})
