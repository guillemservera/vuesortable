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
  { id: 'triage', label: 'Triage' },
  { id: 'legal', label: 'Legal review', locked: true },
  { id: 'ship', label: 'Ship' },
])
const message = ref('Try moving the locked item.')

function canMove(payload: SortableCanMovePayload<Item>) {
  const allowed = !payload.item.locked
  message.value = allowed ? 'Move accepted.' : `${payload.item.label} is locked.`
  return allowed
}
</script>

<template>
  <div class="example">
    <Sortable
      v-model="items"
      item-key="id"
      :can-move="canMove"
      list-class="stack"
    >
      <template #item="{ element, attrs, handleAttrs }">
        <div
          v-bind="attrs"
          class="row"
          :data-locked="element.locked ? 'true' : 'false'"
        >
          <button
            v-bind="handleAttrs"
            class="handle"
            type="button"
          >
            Drag
          </button>
          <span>{{ element.label }}</span>
          <small v-if="element.locked">Locked</small>
        </div>
      </template>
    </Sortable>

    <p class="message">{{ message }}</p>
  </div>
</template>

<style scoped>
.example,
.stack {
  display: grid;
  gap: 10px;
}

.row {
  align-items: center;
  background: #ffffff;
  border: 1px solid #d7dde8;
  border-radius: 8px;
  color: #182033;
  display: flex;
  gap: 10px;
  min-height: 52px;
  padding: 10px 12px;
}

.row[data-locked="true"] {
  border-style: dashed;
}

.handle {
  background: #182033;
  border: 0;
  border-radius: 6px;
  color: #ffffff;
  font: inherit;
  padding: 6px 10px;
}

.message {
  color: #526077;
  margin: 0;
}
</style>
