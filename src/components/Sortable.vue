<script setup lang="ts" generic="T = unknown">
import { computed, normalizeClass, shallowRef, useAttrs } from 'vue'
import type { SortableProps } from '../types'
import { DEFAULT_IGNORE_SELECTOR, DEFAULT_MOTION } from '../constants'
import { useSortableList } from '../composables/useSortableList'
import type {
  SortableDragPayload,
  SortableItemSlotProps,
  SortableMovePayload,
  SortableOverlaySlotProps,
  SortablePlaceholderSlotProps,
} from '../types'

defineOptions({
  name: 'Sortable',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<SortableProps<T>>(), {
  activation: () => ({ threshold: 4 }),
  as: 'div',
  behavior: 'insert',
  collision: 'biased-center',
  disabled: false,
  ignore: DEFAULT_IGNORE_SELECTOR,
  motion: () => DEFAULT_MOTION,
  orientation: 'vertical',
})

const emit = defineEmits<{
  'update:modelValue': [value: T[]]
  'drag-start': [payload: SortableDragPayload<T>]
  'drag-move': [payload: SortableMovePayload<T>]
  reorder: [payload: SortableDragPayload<T>]
  'drag-end': [payload: SortableDragPayload<T>]
  'drag-cancel': [payload: SortableDragPayload<T>]
}>()

defineSlots<{
  item(props: SortableItemSlotProps<T>): unknown
  overlay?(props: SortableOverlaySlotProps<T>): unknown
  placeholder?(props: SortablePlaceholderSlotProps): unknown
}>()

const attrs = useAttrs()
const rootRef = shallowRef<HTMLElement | null>(null)

const forwardedAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})

const sortable = useSortableList<T>({
  emit: {
    dragCancel: payload => emit('drag-cancel', payload),
    dragEnd: payload => emit('drag-end', payload),
    dragMove: payload => emit('drag-move', payload),
    dragStart: payload => emit('drag-start', payload),
    reorder: payload => emit('reorder', payload),
    updateModelValue: value => emit('update:modelValue', value),
  },
  props,
  rootRef,
})

const rootClass = computed(() => [normalizeClass(attrs.class), normalizeClass(props.class)])
const listClass = computed(() => normalizeClass(props.listClass))
const rootStyle = computed(() => [attrs.style, sortable.rootStyle])

defineExpose({
  isDragging: sortable.isDragging,
  isSorting: sortable.isSorting,
})
</script>

<template>
  <component
    :is="props.as"
    ref="rootRef"
    v-bind="forwardedAttrs"
    :data-vuesortable-disabled="props.disabled ? 'true' : 'false'"
    :data-vuesortable-dragging="sortable.isDragging.value ? 'true' : 'false'"
    :data-vuesortable-dropping="sortable.isDropping.value ? 'true' : 'false'"
    :data-vuesortable-orientation="props.orientation"
    :class="rootClass"
    :style="rootStyle"
    data-vuesortable-root
  >
    <div
      :class="listClass"
      data-vuesortable-list
    >
      <template
        v-for="entry in sortable.layoutEntries.value"
        :key="entry.key"
      >
        <slot
          v-if="entry.type === 'placeholder'"
          name="placeholder"
          v-bind="sortable.getPlaceholderSlotProps(entry)"
        >
          <div
            v-bind="sortable.getPlaceholderSlotProps(entry).attrs"
            :style="sortable.getPlaceholderSlotProps(entry).style"
          />
        </slot>

        <slot
          v-else
          name="item"
          v-bind="sortable.getItemSlotProps(entry)"
        >
          <div v-bind="sortable.getItemSlotProps(entry).attrs">
            {{ entry.element }}
          </div>
        </slot>
      </template>
    </div>

    <div
      v-if="sortable.overlayState.value"
      v-bind="sortable.getOverlaySlotProps(sortable.overlayState.value).attrs"
      :style="sortable.getOverlaySlotProps(sortable.overlayState.value).style"
    >
      <slot
        name="overlay"
        v-bind="sortable.getOverlaySlotProps(sortable.overlayState.value)"
      >
        <slot
          name="item"
          v-bind="sortable.getOverlayFallbackItemSlotProps(sortable.overlayState.value)"
        >
          <div v-bind="sortable.getOverlayFallbackItemSlotProps(sortable.overlayState.value).attrs">
            {{ sortable.overlayState.value.element }}
          </div>
        </slot>
      </slot>
    </div>
  </component>
</template>
