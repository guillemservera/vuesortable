# VueSortable

Unstyled sortable primitives for Vue 3.

VueSortable is not a SortableJS wrapper. It is a Vue-native sortable primitive.

## Status

VueSortable is currently in an early `0.x` release. The core API is usable, but some advanced features such as nested lists, cross-list transfer, virtualized lists, and keyboard reordering are still on the roadmap.

## Why VueSortable?

VueSortable exists for teams that want sortable behavior without adopting a styled component, a DOM-cloning drag library, or SortableJS-specific contracts.

The primitive keeps the dragged item as a local overlay controlled by Vue state. List geometry, placeholder placement, reorder decisions, and optional motion are handled by the component. Visual design stays in userland through slots, classes, and styles you provide.

## Features

- Vue 3.5+ component and composable API.
- Dependency-free runtime, with `vue` as the only peer dependency.
- Single-list reorder with controlled `v-model`.
- Vertical and horizontal orientation.
- Handle and ignore selectors.
- Local overlay, normal-flow placeholder, and clamped movement.
- Optional FLIP list motion and snap drop motion.
- Headless slots for item, overlay, and placeholder rendering.
- Neutral `data-vuesortable-*` attributes for state and tests.
- No SortableJS, VueUse, Tailwind, CSS files, or visual classes.

## Installation

```bash
npm install vuesortable
```

```bash
pnpm add vuesortable
```

## Quick Start

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Sortable } from 'vuesortable'

const items = ref([
  { id: 'drafts', label: 'Drafts' },
  { id: 'issues', label: 'Issues' },
  { id: 'inbox', label: 'Inbox' },
])
</script>

<template>
  <Sortable
    v-model="items"
    item-key="id"
    orientation="vertical"
    list-class="space-y-2"
  >
    <template #item="{ element, attrs, handleAttrs }">
      <div v-bind="attrs">
        <button v-bind="handleAttrs" type="button">
          Grab
        </button>
        {{ element.label }}
      </div>
    </template>
  </Sortable>
</template>
```

## API

### Props

| Prop | Type | Default |
| --- | --- | --- |
| `modelValue` | `T[]` | required |
| `itemKey` | `((item: T) => string \| number) \| keyof T` | required |
| `as` | `string` | `'div'` |
| `disabled` | `boolean` | `false` |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` |
| `behavior` | `'insert'` | `'insert'` |
| `collision` | `'center' \| 'biased-center'` | `'biased-center'` |
| `activation` | `{ threshold?: number, delay?: number, delayOnTouchOnly?: boolean }` | `{ threshold: 4 }` |
| `handle` | `string` | `undefined` |
| `ignore` | `string` | `button,input,textarea,select,a,[contenteditable="true"],[data-sortable-ignore]` |
| `motion` | `false \| SortableMotionConfig` | FLIP list and snap drop motion |
| `canMove` | `(payload: SortableCanMovePayload<T>) => boolean` | `undefined` |
| `class` | `unknown` | `undefined` |
| `listClass` | `unknown` | `undefined` |

`behavior` is intentionally limited to `insert` in `0.1.0`. Swap behavior is reserved for a future release.

### Events

| Event | Payload |
| --- | --- |
| `update:modelValue` | `T[]` |
| `drag-start` | `{ item: T, key: string, from: number, to: number }` |
| `drag-move` | `{ item: T, key: string, from: number, to: number, activeIndex: number, pointer: { x: number, y: number } }` |
| `reorder` | `{ item: T, key: string, from: number, to: number }` |
| `drag-end` | `{ item: T, key: string, from: number, to: number }` |
| `drag-cancel` | `{ item: T, key: string, from: number, to: number }` |

`reorder` is emitted only when the model changes. `drag-end` is emitted after an active drag ends, even if the item returns to its original position.

### Slots

#### `item`

```ts
{
  element: T
  index: number
  active: boolean
  dragging: boolean
  attrs: Record<string, unknown>
  handleAttrs: Record<string, unknown>
}
```

Bind `attrs` to the element that represents the sortable item. Bind `handleAttrs` to a drag handle when you want one.

#### `overlay`

```ts
{
  element: T
  index: number
  dragging: boolean
  attrs: Record<string, unknown>
  style: CSSProperties
}
```

The overlay slot is optional. If omitted, VueSortable reuses the `item` slot inside the structural overlay wrapper.

#### `placeholder`

```ts
{
  key: string
  attrs: Record<string, unknown>
  style: CSSProperties
}
```

The placeholder slot is optional. If omitted, VueSortable renders an empty structural placeholder that preserves the active item's width and height.

## Motion

Motion is behavior-only and does not include visual effects. VueSortable may write temporary inline `transform` and `transition` values for FLIP list motion and drop snapping, then cleans them up after the animation finishes.

```vue
<Sortable
  v-model="items"
  item-key="id"
  :motion="{
    list: { type: 'flip', duration: 150, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    drop: { type: 'snap', duration: 120, easing: 'ease-out' }
  }"
/>
```

Disable all motion with:

```vue
<Sortable v-model="items" item-key="id" :motion="false" />
```

## Styling

VueSortable does not ship CSS and does not impose visual classes. It only uses structural inline styles needed for geometry, such as `position`, `width`, `height`, `transform`, `pointerEvents`, and `touchAction`.

Use your own classes, attributes, and slot markup:

```vue
<Sortable v-model="items" item-key="id" class="board" list-class="board-list">
  <template #item="{ element, attrs }">
    <article v-bind="attrs" class="task-card">
      {{ element.label }}
    </article>
  </template>
</Sortable>
```

## Accessibility Status

The current release focuses on pointer-driven single-list reordering. Native button handles work well with custom UI, but keyboard reordering helpers and higher-level accessibility patterns are still roadmap items.

For now, provide clear handle labels, preserve focusable controls inside your item slot, and avoid hiding the current order from assistive technology.

## Comparison with VueUse useSortable / Vue.Draggable

VueUse `useSortable` integrates SortableJS into Vue composables. Vue.Draggable is also built around SortableJS.

VueSortable takes a different approach: it is a Vue-native primitive with local overlay rendering, Vue-controlled state, and no runtime dependency beyond Vue itself. It is lower-level by design, so it can fit custom UI systems without bringing visual styles or SortableJS behavior contracts.

## Limitations

- Single-list reorder only.
- No nested lists yet.
- No cross-list transfer yet.
- No virtualized lists yet.
- Keyboard reordering and accessibility helpers are early and on the roadmap.
- The API is `0.x` and may change before `1.0`.

## Roadmap

- Keyboard reorder helpers.
- Cross-list transfer primitives.
- Nested list guidance.
- Virtualized list integration notes.
- More collision strategies.
- Optional examples for common UI patterns.

## Local Development

```bash
pnpm install
pnpm dev
```

The playground lives in `playground/` and is not published to npm. It imports VueSortable with the public package name, `vuesortable`; the playground Vite config aliases that name to `src/index.ts` so local development works before `dist/` exists.

## Examples

Copyable examples are available in `examples/`.

## License

MIT © 2026 Guillem Servera
