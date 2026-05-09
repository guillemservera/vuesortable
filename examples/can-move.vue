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
  >
    <template #item="{ element, attrs, handleAttrs }">
      <div
        v-bind="attrs"
        :data-locked="element.locked ? 'true' : 'false'"
      >
        <button
          v-bind="handleAttrs"
          type="button"
        >
          Grab
        </button>
        {{ element.label }}
      </div>
    </template>
  </Sortable>
</template>
