<script setup lang="ts">
import { ref } from 'vue'
import { Sortable } from 'vuesortable'
import type { SortableCanMovePayload } from 'vuesortable'

type Item = {
  id: string
  label: string
  locked?: boolean
}

const items = ref<Item[]>([
  { id: 'drafts', label: 'Drafts' },
  { id: 'legal', label: 'Legal review', locked: true },
  { id: 'inbox', label: 'Inbox' },
])

function canMove(payload: SortableCanMovePayload<Item>) {
  return !payload.item.locked
}
</script>

<template>
  <Sortable
    v-model="items"
    item-key="id"
    :can-move="canMove"
    v-slot="{ entries, listAttrs, getItemAttrs, getHandleAttrs, getPlaceholderAttrs, overlay }"
  >
    <div v-bind="listAttrs">
      <template
        v-for="entry in entries"
        :key="entry.key"
      >
        <div
          v-if="entry.type === 'placeholder'"
          v-bind="getPlaceholderAttrs(entry).attrs"
          :style="getPlaceholderAttrs(entry).style"
        />

        <div
          v-else
          v-bind="getItemAttrs(entry).attrs"
          :data-locked="entry.element.locked ? 'true' : 'false'"
        >
          <button
            v-bind="getHandleAttrs(entry)"
            type="button"
          >
            Grab
          </button>
          {{ entry.element.label }}
        </div>
      </template>
    </div>

    <div
      v-if="overlay"
      v-bind="overlay.attrs"
      :style="overlay.style"
      :data-locked="overlay.element.locked ? 'true' : 'false'"
    >
      {{ overlay.element.label }}
    </div>
  </Sortable>
</template>
