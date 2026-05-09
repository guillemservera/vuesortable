import { mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import Sortable from '../src/components/Sortable.vue'
import type { SortableProps } from '../src/types'

type Item = {
  id: string
  label: string
}

type MockItemRect = {
  height: number
  left?: number
  top: number
  width?: number
}

type MountedSortable = VueWrapper<unknown>

const itemSlot = `
  <div v-bind="attrs" class="row">
    <button v-bind="handleAttrs" type="button" data-test-handle>Grab</button>
    <span>{{ element.label }}</span>
  </div>
`

function pointerEvent(type: string, options: MouseEventInit) {
  return new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    ...options,
  })
}

function rectFrom(input: { top: number, left: number, width: number, height: number }): DOMRect {
  return {
    bottom: input.top + input.height,
    height: input.height,
    left: input.left,
    right: input.left + input.width,
    top: input.top,
    width: input.width,
    x: input.left,
    y: input.top,
    toJSON: () => ({}),
  } as DOMRect
}

function mockRootRect(wrapper: MountedSortable, rect: { top: number, left: number, width: number, height: number }) {
  const root = wrapper.get('[data-vuesortable-root]').element as HTMLElement
  root.getBoundingClientRect = () => rectFrom(rect)
}

function getSortableItemElement(wrapper: MountedSortable, key: string) {
  const item = wrapper
    .findAll('[data-vuesortable-item-key]')
    .find(candidate => (candidate.element as HTMLElement).dataset.vuesortableItemKey === key)

  if (!item) throw new Error(`Missing sortable item ${key}`)
  return item.element as HTMLElement
}

function mockItemRects(
  wrapper: MountedSortable,
  positions: Record<string, MockItemRect>,
  options: { onRead?: (key: string) => void } = {},
) {
  for (const [key, rect] of Object.entries(positions)) {
    const element = getSortableItemElement(wrapper, key)
    element.getBoundingClientRect = () => {
      options.onRead?.(key)
      const left = rect.left ?? 44
      const width = rect.width ?? 312

      return rectFrom({
        height: rect.height,
        left,
        top: rect.top,
        width,
      })
    }
  }
}

function mockItemRectSequences(wrapper: MountedSortable, positions: Record<string, MockItemRect[]>) {
  const reads = new Map<string, number>()

  for (const [key, rects] of Object.entries(positions)) {
    const element = getSortableItemElement(wrapper, key)
    element.getBoundingClientRect = () => {
      const readIndex = reads.get(key) ?? 0
      reads.set(key, readIndex + 1)

      const rect = rects[Math.min(readIndex, rects.length - 1)]
      if (!rect) throw new Error(`Missing mock rect for sortable item ${key}`)
      const left = rect.left ?? 44
      const width = rect.width ?? 312

      return rectFrom({
        height: rect.height,
        left,
        top: rect.top,
        width,
      })
    }
  }
}

function listChildOrder(wrapper: MountedSortable) {
  return Array.from(wrapper.get('[data-vuesortable-list]').element.children).map(element =>
    element.getAttribute('data-vuesortable-item-key') ?? element.getAttribute('data-vuesortable-placeholder'),
  )
}

function mountSortable(
  items: Item[],
  options: {
    props?: Partial<SortableProps<Item>>
    slot?: string
    slots?: Record<string, string>
  } = {},
) {
  let wrapper!: MountedSortable

  wrapper = mount(Sortable as any, {
    props: {
      'modelValue': items,
      'itemKey': (item: Item) => item.id,
      'onUpdate:modelValue': (value: Item[]) => wrapper.setProps({ modelValue: value }),
      ...options.props,
    },
    slots: {
      item: options.slot ?? itemSlot,
      ...options.slots,
    },
  })

  return wrapper
}

afterEach(() => {
  vi.useRealTimers()
  document.documentElement.removeAttribute('style')
})

describe('Sortable', () => {
  it('renders the root, list, and items', () => {
    const wrapper = mountSortable([
      { id: 'one', label: 'One' },
      { id: 'two', label: 'Two' },
    ])

    expect(wrapper.get('[data-vuesortable-root]').element).toBeTruthy()
    expect(wrapper.get('[data-vuesortable-list]').element).toBeTruthy()
    expect(wrapper.findAll('[data-vuesortable-item-key]')).toHaveLength(2)
    expect(wrapper.text()).toContain('One')
    expect(wrapper.text()).toContain('Two')
  })

  it('applies class to the root and listClass to the list', () => {
    const wrapper = mountSortable(
      [
        { id: 'one', label: 'One' },
        { id: 'two', label: 'Two' },
      ],
      {
        props: {
          class: 'sortable-root',
          listClass: 'sortable-list',
        },
      },
    )

    expect(wrapper.get('[data-vuesortable-root]').classes()).toContain('sortable-root')
    expect(wrapper.get('[data-vuesortable-list]').classes()).toContain('sortable-list')
  })

  it('drags vertically and clamps the overlay inside the root', async () => {
    const wrapper = mountSortable([
      { id: 'one', label: 'One' },
      { id: 'two', label: 'Two' },
      { id: 'three', label: 'Three' },
    ])

    mockRootRect(wrapper, { top: 100, left: 40, width: 320, height: 132 })
    mockItemRects(wrapper, {
      one: { top: 104, height: 40 },
      two: { top: 148, height: 40 },
      three: { top: 192, height: 40 },
    })

    await wrapper.get('[data-vuesortable-item-key="one"]').trigger('pointerdown', {
      button: 0,
      clientX: 60,
      clientY: 120,
    })
    document.dispatchEvent(pointerEvent('pointermove', { clientX: -240, clientY: 320 }))
    await nextTick()

    expect(wrapper.find('[data-vuesortable-placeholder="one"]').exists()).toBe(true)
    expect(wrapper.find('[data-vuesortable-overlay-key="one"]').exists()).toBe(true)
    expect(wrapper.find('[data-vuesortable-item-key="one"]').exists()).toBe(false)
    expect(wrapper.get('[data-vuesortable-overlay]').attributes('style')).toContain('translate3d(4px, 92px, 0)')
  })

  it('drags horizontally and clamps the overlay inside the root', async () => {
    const wrapper = mountSortable(
      [
        { id: 'one', label: 'One' },
        { id: 'two', label: 'Two' },
        { id: 'three', label: 'Three' },
      ],
      {
        props: {
          orientation: 'horizontal',
        },
      },
    )

    mockRootRect(wrapper, { top: 100, left: 40, width: 132, height: 48 })
    mockItemRects(wrapper, {
      one: { top: 104, left: 44, width: 40, height: 40 },
      two: { top: 104, left: 88, width: 40, height: 40 },
      three: { top: 104, left: 132, width: 40, height: 40 },
    })

    await wrapper.get('[data-vuesortable-item-key="one"]').trigger('pointerdown', {
      button: 0,
      clientX: 60,
      clientY: 120,
    })
    document.dispatchEvent(pointerEvent('pointermove', { clientX: 240, clientY: -240 }))
    await nextTick()

    expect(wrapper.get('[data-vuesortable-placeholder="one"]').attributes('style')).toContain('width: 40px')
    expect(wrapper.get('[data-vuesortable-overlay]').attributes('style')).toContain('translate3d(92px, 4px, 0)')
  })

  it('opens the placeholder on the horizontal axis without changing rows', async () => {
    const wrapper = mountSortable(
      [
        { id: 'one', label: 'One' },
        { id: 'two', label: 'Two' },
        { id: 'three', label: 'Three' },
      ],
      {
        props: {
          orientation: 'horizontal',
        },
      },
    )

    mockRootRect(wrapper, { top: 100, left: 40, width: 132, height: 48 })
    mockItemRects(wrapper, {
      one: { top: 104, left: 44, width: 40, height: 40 },
      two: { top: 104, left: 88, width: 40, height: 40 },
      three: { top: 104, left: 132, width: 40, height: 40 },
    })

    await wrapper.get('[data-vuesortable-item-key="one"]').trigger('pointerdown', {
      button: 0,
      clientX: 60,
      clientY: 120,
    })
    document.dispatchEvent(pointerEvent('pointermove', { clientX: 99, clientY: 120 }))
    await nextTick()

    expect(listChildOrder(wrapper)).toEqual(['two', 'one', 'three'])
    expect(wrapper.get('[data-vuesortable-placeholder="one"]').attributes('style')).toContain('height: 40px')
    expect(wrapper.get('[data-vuesortable-placeholder="one"]').attributes('style')).toContain('width: 40px')
  })

  it('renders the overlay outside the normal-flow list', async () => {
    const wrapper = mountSortable([
      { id: 'one', label: 'One' },
      { id: 'two', label: 'Two' },
    ])

    mockRootRect(wrapper, { top: 100, left: 40, width: 320, height: 88 })
    mockItemRects(wrapper, {
      one: { top: 104, height: 40 },
      two: { top: 148, height: 40 },
    })

    await wrapper.get('[data-vuesortable-item-key="one"]').trigger('pointerdown', {
      button: 0,
      clientX: 60,
      clientY: 120,
    })
    document.dispatchEvent(pointerEvent('pointermove', { clientX: 60, clientY: 170 }))
    await nextTick()

    const root = wrapper.get('[data-vuesortable-root]').element
    const list = wrapper.get('[data-vuesortable-list]').element
    const overlay = wrapper.get('[data-vuesortable-overlay]').element

    expect(root.contains(overlay)).toBe(true)
    expect(list.contains(overlay)).toBe(false)
  })

  it('allows a button handle to start dragging even though button is ignored by default', async () => {
    const wrapper = mountSortable([
      { id: 'one', label: 'One' },
      { id: 'two', label: 'Two' },
    ])

    mockRootRect(wrapper, { top: 100, left: 40, width: 320, height: 88 })
    mockItemRects(wrapper, {
      one: { top: 104, height: 40 },
      two: { top: 148, height: 40 },
    })

    await wrapper.get('[data-test-handle]').trigger('pointerdown', {
      button: 0,
      clientX: 60,
      clientY: 120,
    })
    document.dispatchEvent(pointerEvent('pointermove', { clientX: 60, clientY: 170 }))
    await nextTick()

    expect(wrapper.find('[data-vuesortable-overlay-key="one"]').exists()).toBe(true)
  })

  it('does not reorder when movement stays below the activation threshold', async () => {
    const wrapper = mountSortable([
      { id: 'one', label: 'One' },
      { id: 'two', label: 'Two' },
    ])

    await wrapper.get('[data-vuesortable-item-key="one"]').trigger('pointerdown', {
      button: 0,
      clientX: 20,
      clientY: 20,
    })
    document.dispatchEvent(pointerEvent('pointermove', { clientX: 21, clientY: 21 }))
    document.dispatchEvent(pointerEvent('pointerup', { clientX: 21, clientY: 21 }))
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('reorder')).toBeUndefined()
  })

  it('emits exactly one model update and reorder event on release', async () => {
    vi.useFakeTimers()
    const wrapper = mountSortable([
      { id: 'one', label: 'One' },
      { id: 'two', label: 'Two' },
      { id: 'three', label: 'Three' },
    ])

    mockRootRect(wrapper, { top: 100, left: 40, width: 320, height: 132 })
    mockItemRects(wrapper, {
      one: { top: 104, height: 40 },
      two: { top: 148, height: 40 },
      three: { top: 192, height: 40 },
    })

    await wrapper.get('[data-vuesortable-item-key="one"]').trigger('pointerdown', {
      button: 0,
      clientX: 60,
      clientY: 120,
    })
    document.dispatchEvent(pointerEvent('pointermove', { clientX: 60, clientY: 220 }))
    document.dispatchEvent(pointerEvent('pointerup', { clientX: 60, clientY: 220 }))
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    expect(wrapper.emitted('reorder')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual([
      { id: 'two', label: 'Two' },
      { id: 'three', label: 'Three' },
      { id: 'one', label: 'One' },
    ])

    await vi.runAllTimersAsync()
    await nextTick()
  })

  it('supports repeated drags without leaving state behind', async () => {
    vi.useFakeTimers()
    const wrapper = mountSortable([
      { id: 'one', label: 'One' },
      { id: 'two', label: 'Two' },
      { id: 'three', label: 'Three' },
    ])

    mockRootRect(wrapper, { top: 100, left: 40, width: 320, height: 132 })
    mockItemRects(wrapper, {
      one: { top: 104, height: 40 },
      two: { top: 148, height: 40 },
      three: { top: 192, height: 40 },
    })

    await wrapper.get('[data-vuesortable-item-key="one"]').trigger('pointerdown', {
      button: 0,
      clientX: 60,
      clientY: 120,
    })
    document.dispatchEvent(pointerEvent('pointermove', { clientX: -240, clientY: 320 }))
    document.dispatchEvent(pointerEvent('pointerup', { clientX: -240, clientY: 320 }))
    await nextTick()
    await vi.runAllTimersAsync()
    await nextTick()

    expect(wrapper.find('[data-vuesortable-overlay]').exists()).toBe(false)

    mockItemRects(wrapper, {
      two: { top: 104, height: 40 },
      three: { top: 148, height: 40 },
      one: { top: 192, height: 40 },
    })

    await wrapper.get('[data-vuesortable-item-key="one"]').trigger('pointerdown', {
      button: 0,
      clientX: 60,
      clientY: 208,
    })
    document.dispatchEvent(pointerEvent('pointermove', { clientX: -240, clientY: 80 }))
    document.dispatchEvent(pointerEvent('pointerup', { clientX: -240, clientY: 80 }))
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toHaveLength(2)
    expect(wrapper.emitted('update:modelValue')?.[1]?.[0]).toEqual([
      { id: 'one', label: 'One' },
      { id: 'two', label: 'Two' },
      { id: 'three', label: 'Three' },
    ])

    await vi.runAllTimersAsync()
    await nextTick()
  })

  it('does not run list motion reads when only the overlay position changes', async () => {
    const wrapper = mountSortable([
      { id: 'one', label: 'One' },
      { id: 'two', label: 'Two' },
      { id: 'three', label: 'Three' },
    ])
    let itemRectReads = 0

    mockRootRect(wrapper, { top: 100, left: 40, width: 320, height: 132 })
    mockItemRects(
      wrapper,
      {
        one: { top: 104, height: 40 },
        two: { top: 148, height: 40 },
        three: { top: 192, height: 40 },
      },
      {
        onRead: () => {
          itemRectReads += 1
        },
      },
    )

    await wrapper.get('[data-vuesortable-item-key="one"]').trigger('pointerdown', {
      button: 0,
      clientX: 60,
      clientY: 120,
    })
    document.dispatchEvent(pointerEvent('pointermove', { clientX: 60, clientY: 126 }))
    await nextTick()

    itemRectReads = 0
    document.dispatchEvent(pointerEvent('pointermove', { clientX: 60, clientY: 128 }))
    await nextTick()

    expect(itemRectReads).toBe(0)
  })

  it('cleans FLIP and drop motion inline transform and transition styles', async () => {
    vi.useFakeTimers()
    const wrapper = mountSortable([
      { id: 'one', label: 'One' },
      { id: 'two', label: 'Two' },
      { id: 'three', label: 'Three' },
    ])

    mockRootRect(wrapper, { top: 100, left: 40, width: 320, height: 132 })
    mockItemRectSequences(wrapper, {
      one: [
        { top: 104, height: 40 },
        { top: 104, height: 40 },
        { top: 104, height: 40 },
      ],
      two: [
        { top: 148, height: 40 },
        { top: 148, height: 40 },
        { top: 104, height: 40 },
      ],
      three: [
        { top: 192, height: 40 },
        { top: 192, height: 40 },
        { top: 148, height: 40 },
      ],
    })

    await wrapper.get('[data-vuesortable-item-key="one"]').trigger('pointerdown', {
      button: 0,
      clientX: 60,
      clientY: 120,
    })
    document.dispatchEvent(pointerEvent('pointermove', { clientX: 60, clientY: 220 }))
    await nextTick()

    expect((wrapper.get('[data-vuesortable-item-key="two"]').element as HTMLElement).style.transform).not.toBe('')

    document.dispatchEvent(pointerEvent('pointerup', { clientX: 60, clientY: 220 }))
    await nextTick()
    await vi.runAllTimersAsync()
    await nextTick()

    for (const element of wrapper.findAll('[data-vuesortable-motion-key]')) {
      const htmlElement = element.element as HTMLElement
      expect(htmlElement.style.transform).toBe('')
      expect(htmlElement.style.transition).toBe('')
    }
    expect(wrapper.find('[data-vuesortable-overlay]').exists()).toBe(false)
  })

  it('does not apply list or drop animations when motion is false', async () => {
    const wrapper = mountSortable(
      [
        { id: 'one', label: 'One' },
        { id: 'two', label: 'Two' },
        { id: 'three', label: 'Three' },
      ],
      {
        props: {
          motion: false,
        },
      },
    )

    mockRootRect(wrapper, { top: 100, left: 40, width: 320, height: 132 })
    mockItemRects(wrapper, {
      one: { top: 104, height: 40 },
      two: { top: 148, height: 40 },
      three: { top: 192, height: 40 },
    })

    await wrapper.get('[data-vuesortable-item-key="one"]').trigger('pointerdown', {
      button: 0,
      clientX: 60,
      clientY: 120,
    })
    document.dispatchEvent(pointerEvent('pointermove', { clientX: 60, clientY: 220 }))
    await nextTick()

    for (const element of wrapper.findAll('[data-vuesortable-motion-key]')) {
      const htmlElement = element.element as HTMLElement
      expect(htmlElement.style.transform).toBe('')
      expect(htmlElement.style.transition).toBe('')
    }

    document.dispatchEvent(pointerEvent('pointerup', { clientX: 60, clientY: 220 }))
    await nextTick()

    expect(wrapper.find('[data-vuesortable-overlay]').exists()).toBe(false)
  })

  it('lets canMove block a reorder', async () => {
    vi.useFakeTimers()
    const wrapper = mountSortable(
      [
        { id: 'one', label: 'One' },
        { id: 'two', label: 'Two' },
      ],
      {
        props: {
          canMove: () => false,
        },
      },
    )

    mockRootRect(wrapper, { top: 100, left: 40, width: 320, height: 88 })
    mockItemRects(wrapper, {
      one: { top: 104, height: 40 },
      two: { top: 148, height: 40 },
    })

    await wrapper.get('[data-vuesortable-item-key="one"]').trigger('pointerdown', {
      button: 0,
      clientX: 60,
      clientY: 120,
    })
    document.dispatchEvent(pointerEvent('pointermove', { clientX: 60, clientY: 170 }))
    document.dispatchEvent(pointerEvent('pointerup', { clientX: 60, clientY: 170 }))
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('reorder')).toBeUndefined()
    expect(wrapper.emitted('drag-cancel')).toHaveLength(1)

    await vi.runAllTimersAsync()
    await nextTick()
  })

  it('keeps placeholder width and height equal to the active item', async () => {
    const wrapper = mountSortable(
      [
        { id: 'one', label: 'One' },
        { id: 'two', label: 'Two' },
      ],
      {
        props: {
          orientation: 'horizontal',
        },
      },
    )

    mockRootRect(wrapper, { top: 100, left: 40, width: 132, height: 48 })
    mockItemRects(wrapper, {
      one: { top: 104, left: 44, width: 56, height: 32 },
      two: { top: 104, left: 104, width: 40, height: 40 },
    })

    await wrapper.get('[data-vuesortable-item-key="one"]').trigger('pointerdown', {
      button: 0,
      clientX: 60,
      clientY: 120,
    })
    document.dispatchEvent(pointerEvent('pointermove', { clientX: 120, clientY: 120 }))
    await nextTick()

    const placeholder = wrapper.get('[data-vuesortable-placeholder="one"]').element as HTMLElement
    expect(placeholder.style.height).toBe('32px')
    expect(placeholder.style.width).toBe('56px')
  })

  it('supports item keys that are unsafe in CSS selectors', async () => {
    vi.useFakeTimers()
    const unsafeKey = 'one"] [data-bad="true'
    const wrapper = mountSortable([
      { id: unsafeKey, label: 'Unsafe selector key' },
      { id: 'two', label: 'Two' },
      { id: 'three', label: 'Three' },
    ])

    mockRootRect(wrapper, { top: 100, left: 40, width: 320, height: 132 })
    mockItemRects(wrapper, {
      [unsafeKey]: { top: 104, height: 40 },
      two: { top: 148, height: 40 },
      three: { top: 192, height: 40 },
    })

    getSortableItemElement(wrapper, unsafeKey).dispatchEvent(pointerEvent('pointerdown', {
      button: 0,
      clientX: 60,
      clientY: 120,
    }))
    document.dispatchEvent(pointerEvent('pointermove', { clientX: 60, clientY: 220 }))
    await nextTick()

    expect(wrapper.find('[data-vuesortable-placeholder]').exists()).toBe(true)
    expect(() => {
      document.dispatchEvent(pointerEvent('pointerup', { clientX: 60, clientY: 220 }))
    }).not.toThrow()
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual([
      { id: 'two', label: 'Two' },
      { id: 'three', label: 'Three' },
      { id: unsafeKey, label: 'Unsafe selector key' },
    ])

    await vi.runAllTimersAsync()
    await nextTick()
  })
})
